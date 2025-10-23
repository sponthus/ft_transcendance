import Ajv from "ajv"

let slugRegex = "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$";
let nameRegex = "^@?(?=.*[A-Za-z])[A-Za-z0-9_-]+(?: [A-Za-z0-9_-]+)*$";

export const headersWithApiKeyJsonSchema = {
	type: "object",
	properties: {
		anyOf: [ 
			{ type: "string",
				const: "x-internal-api-key",
				minLength: 1, 
				maxLength: 100 
			},
			{
				type: "string",
				const: "content-type",
			}
		],
		"x-internal-api-key": { type: "string", minLength: 1, maxLength: 100 },
		"content-type": { type: "string", const: "application/json" }
	},
	required: ["x-internal-api-key"],
	additionalProperties: false
}

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
  pattern: nameRegex,
  errorMessage: {
	pattern: "Invalid tournament name",
	minLength: "Tournament name too short",
	maxLength: "Tournament name too long",
	type: "Tournament name must be a string"
  }
};

export const playerSchema = {
  type: "string", 
  minLength: 3, 
  maxLength: 21, 
  pattern: nameRegex,
  errorMessage: {
	pattern: "Invalid player name",
	minLength: "Player name too short",
	maxLength: "Player name too long",
	type: "Player name must be a string"
  }
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

export const tournamentIdParamSchema = {
	type: "object",
	properties: { 
		tournamentId: {
			type: "string",
			pattern: "^[0-9]+$",
			minLength: 1,
			maxLength: 15
		} 
	},
	required: ["tournamentId"],
	additionalProperties: false
}

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

export const noBodySchema = {
  type: "object",
  properties: { },
  additionalProperties: false
};

export const tournamentActionSchema = {
  type: "object",
  properties: {
    userId: { 
		type: "number", 
		minimum: 1,
		errorMessage: {
			type: "userId must be a number",
			minimum: "Invalid userId"
		}
	},
    ownerUserId: { 
		type: "number", 
		minimum: 1,
		errorMessage: {
			type: "ownerUserId must be a number",
			minimum: "Invalid ownerUserId"
		}
	},
    tournamentId: { 
		type: "number", 
		minimum: 1,
		errorMessage: {
			type: "tournamentId must be a number",
			minimum: "Invalid tournamentId"
		}
	},
    tournamentName: { 
      type: "string", 
      minLength: 3, 
      maxLength: 30, 
      pattern: nameRegex,
	  errorMessage: {
		pattern: "Invalid tournament name",
		minLength: "Tournament name too short",
		maxLength: "Tournament name too long",
		type: "Tournament name must be a string"
	  }
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
      items: { 
		type: "string",
		minLength: 3,
		maxLength: 21,
		pattern: nameRegex,
		errorMessage: {
			minLength: "Player name too short",
			maxLength: "Player name too long",
			pattern: "Invalid player name"
		}
	},
      uniqueItems: true,
	  errorMessage: {
		minItems: "Invalid number of players",
		maxItems: "Invalid number of players",
		uniqueItems: "Duplicate player names are not allowed",
		type: "Players must be an array of strings"
	  }
    },
    option: { 
		type: "number", 
		minimum: 0, 
		maximum: 1,
		errorMessage: {
			type: "Option must be a number",
			minimum: "Invalid option",
			maximum: "Invalid option"
		}
	}
  },
  required: ["name", "players", "option"],
  additionalProperties: false
};

export const gameCreationSchema = {
  type: "object",
  properties: {
    player_a: playerSchema,
    player_b: playerSchema,
    requestedMaxScore: { 
		type: "integer", 
		minimum: 1, 
		maximum: 21,
		errorMessage: {
			type: "Invalid max score",
			minimum: "Invalid max score",
			maximum: "Invalid max score"
		}
	},
    requestedAi: { 
		type: "integer", 
		minimum: 0, 
		maximum: 2,
		errorMessage: {
			type: "Invalid ai option",
			minimum: "Invalid ai option",
			maximum: "Invalid ai option"
		} 
	},
    requestedOption: { 
		type: "integer",
		minimum: 0, 
		maximum: 1,
		errorMessage: {
			type: "Invalid option",
			minimum: "Invalid option",
			maximum: "Invalid option"
		}
	},
  },
  required: ["player_a", "player_b"],
  additionalProperties: false
};

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
