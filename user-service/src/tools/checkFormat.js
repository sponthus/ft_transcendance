import Ajv from "ajv"

export function    checkAnswerFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            ownerSlug: { type: "string", minLength: 3, maxLength: 20, pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$"},
            tournamentId: { type: "number", minimum: 1},
            tournamentName: { type: "string", minimum: 3, maximum: 30, pattern: "^(?![=+\\-@])(?![ _-])(?!.*[ _-]$)(?!^[ _-]+$)(?!.*[\\r\\n\\t])(?=.*[A-Za-zÀ-ÖØ-öø-ÿ0-9])[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$" },
            answer: { type: "string",  enum: ["decline", "accept"] },
        },
        required: ["ownerSlug", "tournamentId", "tournamentName", "answer"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}

export function    checkRegistrationFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            username: { type: "string", minLength: 3, maxLength: 15, pattern: "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$"}, // Updated pattern
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
            username: { type: "string", minLength: 3, maxLength: 15, pattern: "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$"}, // Updated pattern
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

export function    checkCodeFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            code: { type: "string", minLength: 6, maxLength: 6, pattern: "^(?=.*[0-9])[0-9]+$"},
        },
        required: ["code"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}

export function    checkSlugFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            slug: { 
				type: "string", 
				minLength: 3, 
				maxLength: 20, 
				pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$"}, // Updated pattern
        },
        required: ["slug"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid) {
		console.log("Format errors :");
		console.log(contract.errors);
        return (false);
	}
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
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}

export function    checkPasswordFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            password: { type: "string", minLength: 6, maxLength: 15, pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"},
        },
        required: ["password"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}