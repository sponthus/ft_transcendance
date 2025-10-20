import Ajv from "ajv"

export function    checkNameFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            oldName: 
            { 
				type: "string", 
				minLength: 3, 
				maxLength: 20, 
				pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$"
            },
            newName: 
            { 
				type: "string", 
				minLength: 3, 
				maxLength: 20, 
				pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$"
            },

        },
        required: ["oldName", "newName"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
    {
		console.log("Format errors :");
		console.log(contract.errors);
        return (false);
	}
    return (true);
}