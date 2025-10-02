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

export function	checkTournamentCreationFormat(request)
{
	const schema = 
	{
		type: "object",
		properties:
		{
			name: { 
				type: "string", 
				minLength: 3, 
				maxLength: 30, 
				pattern: "^(?=.*[a-zA-ZÀ-ÿ0-9])[a-zA-ZÀ-ÿ0-9 \\-]+$" 
			},
			players: 
			{ 
				type: "array", 
				anyOf: [
					{ minItems: 4, maxItems: 4 },
					{ minItems: 8, maxItems: 8 }
				],
				items: { type: "string" },
				uniqueItems: true 
			}
		},
		required: ["name", "players"],
		additionalProperties: false
	};
	const ajv = new Ajv();
	const BodyContract = ajv.compile(schema);
	const valid = BodyContract(request.body);
    return {
        valid,
        errors: BodyContract.errors
    };
}

export function	checkGameCreationFormat(request)
{
	const schema = 
	{
		type: "object",
		properties:
		{
			player_a: { 
				type: "string", 
				minLength: 3, 
				maxLength: 20, 
				pattern: "^(?=.*[a-zA-ZÀ-ÿ0-9])[a-zA-ZÀ-ÿ0-9 \\-]+$" },
			player_b: { 
				type: "string", 
				minLength: 3, 
				maxLength: 15, 
				pattern: "^(?=.*[a-zA-ZÀ-ÿ0-9])[a-zA-ZÀ-ÿ0-9 \\-]+$" },
			requestedMaxScore: { type: "integer", minimum: 1, maximum: 21 },
			requestedAi: { type: "number", minimum: 0, maximum: 2 },
			requestedOption: { type: "number", minimum: 0, maximum: 1 }
		},
		required: ["player_a", "player_b"],
		additionalProperties: false
	};
	const ajv = new Ajv();
	const BodyContract = ajv.compile(schema);
	const valid = BodyContract(request.body);
    return {
        valid,
        errors: BodyContract.errors
    };
}

export function    checkUsernameFormat(username)
{
    const schema = 
    {
        type: "string", 
		minLength: 3, 
		maxLength: 15, 
		pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"
	};
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(username);
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

export function checkWebSocketMessageFormat(message) {
	const schema = {
		type: "object",
		properties: {
			type: { type: "string", minLength: 3 },
			token: { type: "string", minLength: 10, maxLength: 500 },
			gameId: { type: "number", minimum: 1 },
			input: {
				type: "object",
                propertyNames: { maxLength: 15 }, // Touch name
                additionalProperties: { type: "boolean" } // Touch value
			}
		},
		required: ["type"],
		additionalProperties: false, // Allows no other properties
		allOf: [
			{
				if: {
					properties: { type: { const: "input" } }
				},
				then: {
					required: ["type", "input"]
				}
			},
			{
				if: {
					properties: { type: { const: "auth" } }
				},
				then: {
					required: ["type", "token", "gameId"]
				}
			},
			{
				if: {
					properties: { type: { const: "ping" } }
				},
				then: {
					required: ["type"]
				}
			},
			{
				if: {
					properties: { type: { const: "start" } }
				},
				then: {
					required: ["type"]
				}
			}
		]
	};
	const ajv = new Ajv();
	const validate = ajv.compile(schema);
	const valid = validate(message);
	return {
		valid,
		errors: validate.errors
	};
}