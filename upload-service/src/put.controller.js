import path from "path";
import fs from "fs";
import { __dirname } from "./index.js";
import pump from "pump";
import { fileTypeFromBuffer } from "file-type";

export async function uploadAvatar(request, reply) {
    const user = request.user;

    if (!request.isMultipart()) {
        console.log("Request not multipart");
        return reply.code(400).send({ error: 'Expected multipart/form-data' });
    }

    console.log("Uploading avatar for user = " + user.slug);

    const avatarDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(avatarDir)) {
        console.log("Creating avatarDir " + avatarDir);
        fs.mkdirSync(avatarDir, { recursive: true });
    }

    const parts = await request.parts();
    const slug = user.slug;

    for await (const part of parts) {
        if (part.type === 'file') {
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(part.mimetype)) {
                console.log("Invalid file type:", part.mimetype);
                return reply.code(400).send({ error: "File must be a PNG or JPEG image" });
            }

            const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
            let uploadedSize = 0;
            const chunks = [];

            const fileName = `${slug}${path.extname(part.filename).toLowerCase()}`;
            const filePath = path.join(avatarDir, fileName);

            try {
                await new Promise((resolve, reject) => {
                    part.file.on('data', chunk => {
                        uploadedSize += chunk.length;
                        if (uploadedSize > MAX_SIZE) {
                            part.file.destroy();
                            return reject(new Error("File too large (max 5MB)"));
                        }
                        chunks.push(chunk);
                    });

                    part.file.on('end', resolve);
                    part.file.on('error', reject);
                });

                // Vérifie le vrai type du fichier via sa signature binaire
                const buffer = Buffer.concat(chunks);
                const type = await fileTypeFromBuffer(buffer);

                if (!type || !allowedTypes.includes(type.mime)) {
                    console.log("Invalid real file type:", type);
                    return reply.code(400).send({ error: "Invalid image file (must be real PNG or JPEG)" });
                }

                // Écrit le fichier après validation
                fs.writeFileSync(filePath, buffer);

                console.log(`✅ Avatar uploaded for user: ${slug}`);
                return reply.send({ avatar: fileName });

            } catch (err) {
                console.error("❌ Upload failed:", err.message);
                return reply.code(500).send({ error: 'Failed upload: ' + err.message });
            }
        }
    }

    return reply.code(400).send({ error: "No avatar file uploaded" });
}
