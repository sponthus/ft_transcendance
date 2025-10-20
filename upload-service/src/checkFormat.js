export const nameSchema = {
  type: "object",
  properties: {
    oldName: { 
      type: "string", 
      minLength: 3, 
      maxLength: 20, 
      pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$"
    },
    newName: { 
      type: "string", 
      minLength: 3, 
      maxLength: 20, 
      pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$"
    }
  },
  required: ["oldName", "newName"],
  additionalProperties: false
};