import path from "path";
import fs from "fs";
import {__dirname} from "./index.js";
import pump from "pump";

// TODO : Check stuff on the file : real img file ? size ?
export async function uploadAvatar(request, reply) {
    const { slug } = request.params;
    const user = request.user; // JWT token

    // Check if there is a file
    if (!request.isMultipart()) {
        console.log("Request not multipart");
        return reply.code(400).send({ error: 'Expected multipart/form-data' });
    }
    console.log("Uploading avatar for user = " + slug);

    if (user.slug !== slug)
        return reply.code(403).send({ error: "Not authorized to change this avatar" });

    // Path of actual dir on the computer
    console.log("dirname = " + __dirname);
    // Path on server to find the upload
    const avatarDir = path.join(__dirname, '..', 'uploads');
    console.log("final dirname = " + avatarDir);
    // If it doesn't exist creates it
    if (!fs.existsSync(avatarDir)) {
        console.log("Creating avatarDir " + avatarDir);
        fs.mkdirSync(avatarDir, { recursive: true });
    }

    const parts = await request.parts(); // fastify-multipart
    console.log("Parts are = ", parts);

    for await (const part of parts) {
        console.log(`me here`);
        // Check it's a file and it's an avatar
        if (part.type === 'file') {
            // File name = slug.jpg
            const fileName = `${slug}.jpg`;
            // File path = /uploads/filename
            const filePath = path.join(avatarDir, fileName);
            console.log("file path resulting = " + filePath);
            // const storedFilePath = path.join('uploads', fileName);
            try {
                await pump(part.file, fs.createWriteStream(filePath));
                console.log(`Avatar uploaded for user: ${slug}`);

                // Reply = It worked
                return reply.send({ avatar: fileName });
            }
            catch (err) {
                console.log(err);
                return reply.code(500).send({error: 'Failed upload :' + err.message});
            }
        }
    }
    return reply.code(400).send({ error: "No avatar file uploaded" });
}