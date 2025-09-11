import Ajv from "ajv"

export function    checkRegistrationFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            username: { type: "string", minLength: 3, maxLength: 15, pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"},
            password: { type: "string", minLength: 6, maxLength: 15, pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"},
        },
        required: ["username", "password"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
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

export function    checkNicknameFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            nickname: { type: "string", minLength: 3, maxLength: 15, pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"}, //autoriser chiffre et certain char speciaux
        },
        required: ["nickname"],
        additionalProperties: false //si autre chose dans properties que nickname --> refuse
    };
    const ajv = new Ajv(); //le mettre ailleurs pour eco du CPU ?
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}