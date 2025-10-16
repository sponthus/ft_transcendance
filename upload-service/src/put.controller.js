import path from "path";
import fs from "fs";
import {__dirname} from "./index.js";
import pump from "pump";
import { error } from "console";

// TODO : Check stuff on the file : real img file ? size ?
export async function uploadAvatar(request, reply) {
    const user = request.user; // JWT token

    // Check if there is a file
    if (!request.isMultipart()) {
        console.log("Request not multipart");
        return reply.code(400).send({ error: 'Expected multipart/form-data' });
    }
    console.log("Uploading avatar for user = " + user.slug);

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
	const slug = user.slug;
	
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
                return reply.code(200).send();
            }
            catch (err) {
                console.log(err);
                return reply.code(500).send({error: 'Failed upload :' + err.message});
            }
        }
    }
    return reply.code(400).send({ error: "No avatar file uploaded" });
}

export async function updateName(request, reply)
{
    const   { oldName, newName } = request.body;

    //check le format

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
        console.log(`✅ Avatar renommé : ${oldFile} → ${newUsername}${ext}`);
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error"});
    }
}