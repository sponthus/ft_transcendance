//FICHIER OBSOLETE

// TODO : Control what info is given or not ? For now not necessary
export async function getUser(request, reply) {
    const { slug } = request.params; // gets :slug in the request
    const { db } = request.server;

    console.log("Trying to find user with slug " + slug);
    const user = db.prepare('SELECT username, slug, avatar, id, created_at FROM users WHERE slug = ?').get(slug);
    if (!user) {
        return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
}
// TODO: NOT TESTED because no corresponding ui in frontend

export async function modifyAvatar(request, reply) {
    const { slug } = request.params;
    const { db } = request.server;

    console.log("Trying to find user with slug" + slug);
    const user = db.prepare('SELECT username, slug, avatar, id, created_at FROM users WHERE slug = ?').get(slug);
    if (!user) {
        return reply.status(404).send({ error: 'User not found' });
    }

    let avatarPath = null;
    // TODO = Check if the file at this path is available
    if (request.body.avatar) {
        avatarPath = request.body.avatar;
    }
    if (avatarPath) {
        db.prepare('UPDATE users SET avatar = ? WHERE slug = ?').run(avatarPath, slug);
        console.log("path for avatar has been updated with " + avatarPath);
        return reply.status(200).send({ avatarPath });
    }
    else
        return reply.status(400).send({ error: "No avatar found" });
}