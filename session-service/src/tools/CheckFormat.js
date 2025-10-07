import Ajv from "ajv"

export function    checkSlugFormat(slug)
{
    const schema = 
    {
        type: "string",
        minLength: 1,
        maxLength: 15,
        pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$" // Updated format
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(slug);
    if (!valid)
        return (false);
    return (true);
}

export function    checkChangeInfosFormat(request)
{
    const schema = 
    {
        type: "object",
		properties:
		{
			slug: { 
				type: "string", 
				minLength: 3, 
				maxLength: 15,
				pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$" // Updated pattern
			},
			username: { 
				type: "string",
				minLength: 3,
				maxLength: 20,
				pattern: "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$" // Updated pattern
			}
		},
		required: ["slug", "username"],
		additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}

export function    checkSendMessageFormat(request)
{
    const schema = 
    {
        type: "object",
		properties:
		{
			sender: { 
				type: "string", 
				minLength: 3, 
				maxLength: 15,
				pattern: "^[a-z0-9]+(-[0-9]+)?$"
			},
			message: { 
				type: "string",
				minLength: 3,
				maxLength: 20,
				pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"
			}
		},
		required: ["sender", "message"],
		additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}

export function    checkUsernameFormat(username)
{
    const schema = 
    {
        type: "string", 
		minLength: 3, 
		maxLength: 15, 
		pattern: "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$" // Updated pattern
	};
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(username);
	console.log(contract.errors);
    if (!valid)
        return (false);
    return (true);
}

export function    checkStatusFormat(status)
{
    const schema = 
    {
        type: "string", 
		enum: ["playing", "not_playing"]
	};
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(status);
	console.log(contract.errors);
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