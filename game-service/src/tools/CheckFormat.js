import Ajv from "ajv"

let slugRegex = "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$";

export const slugSchema = {
  type: "string",
  minLength: 1,
  maxLength: 20,
  pattern: slugRegex
};

export const slugParamsSchema = {
	type: "object",
	properties: { slug: slugSchema },
	required: ["slug"],
	additionalProperties: false
};

export const tournamentNameSchema = {
  type: "string",
  minLength: 3,
  maxLength: 30,
  pattern: "^(?![=+\\-@])(?![ _-])(?!.*[ _-]$)(?!^[ _-]+$)(?!.*[\\r\\n\\t])(?=.*[A-Za-zÀ-ÖØ-öø-ÿ0-9])[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$"
};

export const playerSchema = {
  type: "string", 
  minLength: 3, 
  maxLength: 21, 
  pattern: "^(?!@?[_-])(?!.*[_-]$)(?!^\\s)(?!.*\\s$)(?!.*\\s{2})(?!.*(?:\\s.*){3})(?=.*[A-Za-z])(?!@?[0-9_-]+$)@?[A-Za-z0-9 _-]+$"
};

export const idUserSchema = {
  type: "number",
  minimum: 1
};

export const idSchema = {
	oneOf : [
		{ type: "number", minimum: 1 },
		{ type: "string", minLength: 1, maxLength: 15, pattern: "^[0-9]+$" }
	]
};

export const idParamSchema = {
	type: "object",
	properties: { 
		gameId: {
			type: "string",
			pattern: "^[0-9]+$",
			minLength: 1,
			maxLength: 15
		} 
	},
	required: ["gameId"],
	additionalProperties: false
}

export const idStringSchema = {
  type: "string",
  minLength: 1,
  maxLength: 15,
  pattern: "^[0-9]+$"
};

export const tournamentActionSchema = {
  type: "object",
  properties: {
    userId: { type: "number", minimum: 1 },
    ownerUserId: { type: "number", minimum: 1 },
    tournamentId: { type: "number", minimum: 1 },
    tournamentName: { 
      type: "string", 
      minLength: 3, 
      maxLength: 30, 
      pattern: "^(?![=+\\-@])(?![ _-])(?!.*[ _-]$)(?!^[ _-]+$)(?!.*[\\r\\n\\t])(?=.*[A-Za-zÀ-ÖØ-öø-ÿ0-9])[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$"
    }
  },
  required: ["userId", "ownerUserId", "tournamentId", "tournamentName"],
  additionalProperties: false
};

export const tournamentCreationSchema = {
  type: "object",
  properties: {
    name: tournamentNameSchema,
    players: { 
      type: "array", 
      anyOf: [
        { minItems: 4, maxItems: 4 },
        { minItems: 8, maxItems: 8 }
      ],
      items: { type: "string" },
      uniqueItems: true
    },
    option: { type: "number", minimum: 0, maximum: 1 }
  },
  required: ["name", "players", "option"],
  additionalProperties: false
};

export const gameCreationSchema = {
  type: "object",
  properties: {
    player_a: playerSchema,
    player_b: playerSchema,
    requestedMaxScore: { type: "integer", minimum: 1, maximum: 21 },
    requestedAi: { type: "number", minimum: 0, maximum: 2 },
    requestedOption: { type: "number", minimum: 0, maximum: 1 }
  },
  required: ["player_a", "player_b"],
  additionalProperties: false
};

/*export function    checkSlugFormat(slug)
{
    const schema = 
    {
        type: "string",
        minLength: 1,
        maxLength: 20,
        pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$" // Same as username without maj
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(slug);
    if (!valid)
        return (false);
    return (true);
}

export function checkTournamentNameFormat(name)
{
	const schema = 
	{
		type: "string",
		minLength: 3,
		maxLength: 30,
		pattern: "^(?![=+\\-@])(?![ _-])(?!.*[ _-]$)(?!^[ _-]+$)(?!.*[\\r\\n\\t])(?=.*[A-Za-zÀ-ÖØ-öø-ÿ0-9])[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$"
	};
	const ajv = new Ajv();
	const contract = ajv.compile(schema);
	const valid = contract(name);
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
				pattern: "^(?![=+\\-@])(?![ _-])(?!.*[ _-]$)(?!^[ _-]+$)(?!.*[\\r\\n\\t])(?=.*[A-Za-zÀ-ÖØ-öø-ÿ0-9])[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$" 
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
			},
			option: { type: "number", minimum: 0, maximum: 1 }
		},
		required: ["name", "players", "option"],
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
				maxLength: 21, 
				pattern: "^(?!@?[_-])(?!.*[_-]$)(?!^\\s)(?!.*\\s$)(?!.*\\s{2})(?!.*(?:\\s.*){3})(?=.*[A-Za-z])(?!@?[0-9_-]+$)@?[A-Za-z0-9 _-]+$" }, // Accepts 2 spaces, @ at beginning
			player_b: { 
				type: "string", 
				minLength: 3, 
				maxLength: 21, 
				pattern: "^(?!@?[_-])(?!.*[_-]$)(?!^\\s)(?!.*\\s$)(?!.*\\s{2})(?!.*(?:\\s.*){3})(?=.*[A-Za-z])(?!@?[0-9_-]+$)@?[A-Za-z0-9 _-]+$" }, // Accepts 2 spaces, @ at beginning
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

export function    checkPlayerFormat(username)
{
    const schema = 
    {
        type: "string", 
		minLength: 3, 
		maxLength: 21, 
		pattern: "^(?!@?[_-])(?!.*[_-]$)(?!^\\s)(?!.*\\s$)(?!.*\\s{2})(?!.*(?:\\s.*){3})(?=.*[A-Za-z])(?!@?[0-9_-]+$)@?[A-Za-z0-9 _-]+$" // Updated pattern
	};
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(username);
	if (!valid) {
		console.error("❌ Player format error: ");
		console.error(contract.errors);
	}
    if (!valid)
        return (false);
    return (true);
}

export function    checkIdNumberFormat(id)
{
    const schema = 
    {
        type: "number",
        minimum: 1
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(id);
    if (!valid) {
		console.error("❌ ID number format error: ");
		console.error(contract.errors);
        return (false);
	}
    return (true);
}
*/

export function    checkIdFormat(id)
{
    const schema = 
    {
        oneOf : [
			{ type: "number", minimum: 1 },
			{ type: "string", minLength: 1, maxLength: 15, pattern: "^[0-9]+$" }
		]
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(id);
    if (!valid) {
		console.error("❌ ID format error: ");
		console.error(contract.errors);
		return (false);
	}
    return (true);
}

export function checkWebSocketMessageFormat(message) {
	const schema = {
		type: "object",
		properties: {
			type: { type: "string", minLength: 3 },
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
					required: ["type", "gameId"]
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