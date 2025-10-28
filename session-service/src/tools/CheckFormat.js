import Ajv from "ajv";

let slugRegex = "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$";
let usernameRegex = "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$";
let messageRegex = "^(?!\\s)(?!.*\\s$)[A-Za-z0-9./ _-]+(-[0-9]+)?$";

export const slugSchema = {
  type: "string",
  minLength: 3,
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
      minLength: 3,
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
		enum: ["online", "disconnected"]
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
					pattern: messageRegex,
					minLength: 3,
					maxLength: 20 
				}
		]
    },
    message: {
		type: "string",
		minLength: 3,
		maxLength: 20,
		pattern: messageRegex
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

export const numberIdSchema = {
  type: "number",
  minimum: 1
};

export const idParamSchema = {
  type: "object",
  properties: {
	userId: { type: "string", pattern: "^(?:[1-9][0-9]*)$", minLength: 1, maxLength: 15 }
  }
};

export const idStringSchema = {
  type: "string",
  minLength: 1,
  maxLength: 15,
  pattern: "^[0-9]+$"
};

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