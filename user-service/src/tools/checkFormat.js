export const idUserSchema = {
  type: "object",
  properties: {
    idUser: { type: "number", minimum: 1 }
  },
  required: ["idUser"],
  additionalProperties: false
};

export const characterAssetSchema = {
  type: "object",
  properties: {
    asset: { 
      type: "integer", 
      minimum: 0, 
      maximum: 18 
    }
  },
  required: ["asset"],
  additionalProperties: false
};

export const npcAssetSchema = {
  type: "object",
  properties: {
    asset: { 
      type: "integer", 
      minimum: 0, 
      maximum: 11 
    }
  },
  required: ["asset"],
  additionalProperties: false
};

export const addTournamentNotifSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["tournament_accept", "tournament_cancel", "tournament_invite", "tournament_ready"]
    },
    receiverId: {
      anyOf: [
        { type: "number", minimum: 1 },
        { type: "array", items: { type: "number", minimum: 1 }, minItems: 1 }
      ]
    },
    senderId: { type: "number", minimum: 1 },
    tournamentId: { type: "number", minimum: 1 },
    tournamentName: { 
      type: "string", 
      minLength: 3, 
      maxLength: 30, 
      pattern: "^(?![=+\\-@])(?![ _-])(?!.*[ _-]$)(?!^[ _-]+$)(?!.*[\\r\\n\\t])(?=.*[A-Za-zÀ-ÖØ-öø-ÿ0-9])[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$" 
    }
  },
  required: ["type", "receiverId", "senderId", "tournamentId", "tournamentName"],
  additionalProperties: false
};

export const avatarSchema = {
  type: "object",
  properties: {
    avatar: {
      type: "string",
      minLength: 5,
      maxLength: 255,
      pattern: "^.+\\.(png|jpg|jpeg)$",
    }
  },
  required: ["avatar"],
  additionalProperties: false
};

export const slugSchema = {
  type: 'object',
  properties: {
    slug: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      pattern: '^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$'
    }
  },
  required: ['slug'],
  additionalProperties: false
};

export const answerSchema = {
  type: "object",
  properties: {
    ownerSlug: { 
      type: "string", 
      minLength: 3, 
      maxLength: 20, 
      pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$"
    },
    tournamentId: { 
      type: "number", 
      minimum: 1 
    },
    tournamentName: { 
      type: "string", 
      minLength: 3, 
      maxLength: 30, 
      pattern: "^(?![=+\\-@])(?![ _-])(?!.*[ _-]$)(?!^[ _-]+$)(?!.*[\\r\\n\\t])(?=.*[A-Za-zÀ-ÖØ-öø-ÿ0-9])[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$" 
    },
    answer: { 
      type: "string",  
      enum: ["decline", "accept"] 
    },
  },
  required: ["ownerSlug", "tournamentId", "tournamentName", "answer"],
  additionalProperties: false
};

export const registrationSchema = {
  type: "object",
  properties:
  {
    username:
    { 
      type: "string", 
      minLength: 3, 
      maxLength: 15, 
      pattern: "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$",
      not: { const: "default" },
      errorMessage:
      {
        type: "Username must be a string",
        minLength: "Username must be at least 3 characters",
        maxLength: "Username cannot be longer than 15 characters",
        pattern: "Username format is invalid",
        not: "Username cannot be 'default'",
      },
    },
    password:
    { 
      type: "string", 
      minLength: 6, 
      maxLength: 15, 
      pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$",
      errorMessage:
      {
        type: "Password must be a string",
        minLength: "Password must be at least 6 characters",
        maxLength: "Password cannot be longer than 15 characters",
        pattern: "Password contains invalid characters"
      },
    },
  },
  required: ["username", "password"],
  additionalProperties: false
};

export const usernameSchema = {
  type: "object",
  properties: {
    username: { 
      type: "string", 
      minLength: 3, 
      maxLength: 15, 
      pattern: "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$"
    },
  },
  required: ["username"],
  additionalProperties: false
};

export const codeSchema = {
  type: "object",
  properties: {
    code: { 
      type: "string", 
      minLength: 6, 
      maxLength: 6, 
      pattern: "^(?=.*[0-9])[0-9]+$"
    },
  },
  required: ["code"],
  additionalProperties: false
};

export const nicknameSchema = {
  type: "object",
  properties: {
    nickname: { 
      type: "string", 
      minLength: 3, 
      maxLength: 15, 
      pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"
    },
  },
  required: ["nickname"],
  additionalProperties: false
};

export const passwordSchema = {
  type: "object",
  properties: {
    password: { 
      type: "string", 
      minLength: 6, 
      maxLength: 15, 
      pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"
    },
  },
  required: ["password"],
  additionalProperties: false
};