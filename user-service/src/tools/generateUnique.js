export function generateUniqueSlug(baseSlug, db)
{
    let slug = baseSlug;
    let counter = 1;

    const dbFindings = db.prepare("SELECT COUNT(*) AS count FROM users WHERE slug = ?");
    while (dbFindings.get(slug).count > 0)
    {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

export function generateUniqueUsername(baseUsername, db)
{
    let username = baseUsername;
    let counter = 1;

    const dbFindings = db.prepare("SELECT COUNT(*) AS count FROM users WHERE username = ?");
    while (dbFindings.get(username).count > 0)
    {
        username = `${baseUsername}-${counter}`;
        counter++;
    }
    return username;
}