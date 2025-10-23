import Ajv from "ajv";

let slugRegex = "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$";
let usernameRegex = "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$";

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

export const changeInfosSchema = {
  type: "object",
  properties: {
    slug: { 
      type: "string",
      minLength: 4,
      maxLength: 20,
      pattern: slugRegex
    },
    username: { 
      type: "string",
      minLength: 3,
      maxLength: 15,
      pattern: usernameRegex
    },
	status: {
		type: "string",
		enum: ["online", "playing", "disconnected", "not_playing"]
	}
  },
  required: ["slug", "username"],
  additionalProperties: false
};

export const sendMessageToGroupSchema = {
  type: "object",
  properties: {
    userIds: {
		type: "array",
		items: {
			anyOf: [
				{ type: "number" },
				{ type: "string",
					pattern: "^[0-9]+$",
					minLength: 1,
					maxLength: 15
				}
			]
		},
		minItems: 1,
		uniqueItems: true
    },
    sender: {
		anyOf: [
				{ type: "number" },
				{ type: "string", 
					pattern: "^(?!\\s)(?!.*\\s$)[a-z0-9 _-]+(-[0-9]+)?$",
					minLength: 3,
					maxLength: 20 
				}
		]
    },
    message: {
		type: "string",
		minLength: 3,
		maxLength: 20,
		pattern: "^(?!\\s)(?!.*\\s$)[a-z0-9 _-]+(-[0-9]+)?$"
    }
  },
  required: ["sender","message"],
  additionalProperties: false
};

export const sendMessageSchema = {
  type: "object",
  properties: {
    sender: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      pattern: "^(?!\\s)(?!.*\\s$)[a-z0-9 _-]+(-[0-9]+)?$"
    },
    message: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      pattern: "^(?!\\s)(?!.*\\s$)[a-z0-9 _-]+(-[0-9]+)?$"
    }
  },
  required: ["sender","message"],
  additionalProperties: false
};

export const usernameSchema = {
  type: "string",
  minLength: 3,
  maxLength: 20,
  pattern: usernameRegex
};

export const statusSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["playing", "not_playing"]
    }
  },
  required: ["status"],
  additionalProperties: false
};

export const numberIdSchema = {
  type: "number",
  minimum: 1
};

export const idParamSchema = {
  type: "object",
  properties: {
	userId: { type: "string", pattern: "^[0-9]+$", minLength: 1, maxLength: 15 }
  }
};

export const idStringSchema = {
  type: "string",
  minLength: 1,
  maxLength: 15,
  pattern: "^[0-9]+$"
};

/*
export function    checkSlugFormat(slug)
{
    const schema = 
    {
        type: "string",
        minLength: 1,
        maxLength: 20,
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
				maxLength: 20,
				pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$" // Updated pattern
			},
			username: { 
				type: "string",
				minLength: 3,
				maxLength: 15,
				pattern: "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$" // Updated pattern
			},
			status: {
				type: "string",
				enum: ["online", "playing", "disconnected"]
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

export function    checkSendMessageToGroupFormat(request)
{
    const schema = 
    {
        type: "object",
		properties:
		{
			userIds: {
				type: "array",
				items: { type: ["number", "string"] },
				minItems: 1,
				uniqueItems: true
			},
			sender: { 
				type: ["string", "number"], 
				minLength: 3, 
				maxLength: 20,
				pattern: "^(?!\\s)(?!.*\\s$)[a-z0-9 _-]+(-[0-9]+)?$"
			},
			message: { 
				type: "string",
				minLength: 3,
				maxLength: 20,
				pattern: "^(?!\\s)(?!.*\\s$)[a-z0-9 _-]+(-[0-9]+)?$"
			}
		},
		required: ["sender", "message"],
		additionalProperties: false
    };
    const ajv = new Ajv({ allowUnionTypes: true });
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid) {
		console.warn(contract.errors);
        return (false);
	}
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
				maxLength: 20,
				pattern: "^(?!\\s)(?!.*\\s$)[a-z0-9 _-]+(-[0-9]+)?$"
			},
			message: { 
				type: "string",
				minLength: 3,
				maxLength: 20,
				pattern: "^(?!\\s)(?!.*\\s$)[a-z0-9 _-]+(-[0-9]+)?$"
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
		maxLength: 20, 
		pattern: "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$" // Updated pattern
	};
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(username);
	if (!valid)
		console.warn(contract.errors);
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
	if (!valid)
		console.warn(contract.errors);
    if (!valid)
        return (false);
    return (true);
}
*/
export function checkNumberIdFormat(id)
{
	const schema =
	{
		type: "number",
		minimum: 1
	};
	const ajv = new Ajv();
	const contract = ajv.compile(schema);
	const valid = contract(id);
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
    if (!valid) {
        return (false);
	}
    return (true);
}