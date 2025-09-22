import Ajv from "ajv"

export function    checkSlugFormat(slug)
{
    const schema = 
    {
        type: "string",
        minLength: 1,
        maxLength: 15,
        pattern: "^[a-z0-9]+(-[0-9]+)?$"
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(slug);
    if (!valid)
        return (false);
    return (true);
}

export function    checkUsernameFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            username: { type: "string", minLength: 3, maxLength: 15, pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"},
        },
        required: ["username"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}

export function    checkIdFormat(id)
{
    const schema = 
    {
        type: "string",
        minLength: 1,
        maxLength: 15,
        pattern: "^[0-9]+$"
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(id);
    if (!valid)
        return (false);
    return (true);
}