import Ajv from "ajv";

export function checkWebSocketMessageFormat(message) {
    const schema = {
        type: "object",
        properties: {
            type: { type: "string", minLength: 3 },
			token: { type: "string", minLength: 10, maxLength: 500 }
        },
        required: ["type"],
        additionalProperties: false, // Allows no other properties
		allOf: [
			{
				if: {
					properties: { type: { const: "auth" } }
				},
				then: {
					required: ["type", "token"]
				}
			},
			{
				if: {
					properties: { type: { const: "ping" } }
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
