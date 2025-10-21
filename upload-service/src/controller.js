import path from "path";
import fs from "fs";
import { __dirname } from "./index.js";
// import pump from "pump";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

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
                            return reject(new Error("File too large (max 5MB)")); //c'est quoi ca ?? TODO MORGAN
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


                try
                {
                    await sharp(buffer).metadata();
                }
                catch (err)
                {
                    console.log("Sharp failed to read image: ", err.mesage);
                    return reply.code(400).send({error: "Corrupted or invalid image"});
                }


                // Écrit le fichier après validation
                fs.writeFileSync(filePath, buffer);
                console.log(`✅ Avatar uploaded for user: ${slug}`);
                return reply.code(200).send({ avatar: fileName});

            } catch (err) {
                console.error("❌ Upload failed:", err.message);
                return reply.code(500).send({ error: "Internal Server Error"});
            }
        }
    }

    return reply.code(400).send({ error: "No avatar file uploaded" });
}

export async function updateName(request, reply)
{
    const   { oldName, newName } = request.body;

    console.log('ENTRER DANS UPDATE NAME');
    console.log('ENTRER DANS UPDATE NAME');
    try
    {
        const uploadDir = path.join(process.cwd(), "uploads"); //cwd --> current working directory
        const files = fs.readdirSync(uploadDir);
    
        const oldFile = files.find((file) => file.startsWith(oldName + "."));
        if (!oldFile)
        {
            return reply.code(404).send({ error: "Avatar file not found"});
        }
        const ext = path.extname(oldFile);
        const oldPath = path.join(uploadDir, oldFile)
        const newPath = path.join(uploadDir, `${newName}${ext}`);
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Avatar renommé : ${oldFile} → ${newName}${ext}`);
        return reply.code(200).send();
    }
    catch (err)
    {
        console.log('ERRRRROOOOOORR', err.message);
        return reply.code(500).send({ error: "Internal Server Error" + err.mesage});
    }
}
