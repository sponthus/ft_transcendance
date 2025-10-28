let slugRegex = "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+$";
let tournamentNameRegex = "^@?(?=.*[A-Za-z])[A-Za-z0-9_-]+(?: [A-Za-z0-9_-]+)*$"; // And nickname
let usernameRegex = "^(?![_-])(?!.*[_-]$)(?=.*[A-Za-z])(?![0-9_]+)[A-Za-z0-9_-]+$";
let passwordRegex = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?+!@$%^&*\=]).{6,}$";

export const backgroundColorSchema = {
  type: "object",
  properties: {
	red: {
	  type: "number",
	  minimum: 0,
	  maximum: 255,
	  errorMessage: {
		type: "Red must be a number",
		minimum: "Red must be at least 0",
		maximum: "Red cannot be higher than 255"
	  }
	},
	green: {
	  type: "number",
	  minimum: 0,
	  maximum: 255,
	  errorMessage: {
		type: "Green must be a number",
		minimum: "Green must be at least 0",
		maximum: "Green cannot be higher than 255"
	  }
	},
	blue: {
	  type: "number",
	  minimum: 0,
	  maximum: 255,
	  errorMessage: {
		type: "Blue must be a number",
		minimum: "Blue must be at least 0",
		maximum: "Blue cannot be higher than 255"
	  }
	}
  },
  required: ["red", "green", "blue"],
  additionalProperties: false
};

export const avatarSchema = {
  type: "object",
  properties: {
    avatar: {
      type: "string",
      minLength: 5,
      maxLength: 255,
      pattern: "^(?![_-])(?!.*[_-]$)(?=.*[a-z])(?![0-9_]+)[a-z0-9_-]+\\.(png|jpg|jpeg)$",
      errorMessage: {
        type: "Avatar must be a string",
        minLength: "Avatar must be at least 5 characters",
        maxLength: "Avatar cannot be longer than 255 characters",
        pattern: "Avatar must be a valid image file (png, jpg, jpeg)"
      }
    },
    slug: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      pattern: slugRegex,
      errorMessage: {
        type: "Slug must be a string",
        minLength: "Slug must be at least 3 characters",
        maxLength: "Slug cannot be longer than 20 characters",
        pattern: "Slug format is invalid"
      }
    },
    idUser: {
      type: "number",
      minimum: 1,
      errorMessage: {
        type: "idUser must be a number",
        minimum: "idUser must be at least 1"
      }
    }
  },
  required: ["avatar", "slug", "idUser"],
  additionalProperties: false
}

export const idUserSchema = {
  type: "object",
  properties: {
    idUser: {
      type: "string",
      pattern: '^[1-9][0-9]*$',
      errorMessage: {
        type: "idUser must be a number",
        minimum: "idUser must be at least 1"
      }
    }
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
      maximum: 18,
      errorMessage: {
        type: "Asset must be an integer",
        minimum: "Asset must be at least 0",
        maximum: "Asset cannot be higher than 18"
      }
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
      maximum: 11,
      errorMessage: {
        type: "Asset must be an integer",
        minimum: "Asset must be at least 0",
        maximum: "Asset cannot be higher than 11"
      }
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
      enum: ["tournament_accept", "tournament_cancel", "tournament_invite", "tournament_ready"],
      errorMessage: {
        type: "Type must be a string",
        enum: "Type must be one of: tournament_accept, tournament_cancel, tournament_invite, tournament_ready"
      }
    },
    receiverId: {
      anyOf: [
        {
          type: "array",
          items: {
            type: "number",
            minimum: 1,
            errorMessage: {
              type: "Receiver IDs must be numbers",
              minimum: "Each receiver ID must be at least 1"
            },
          },
		  uniqueItems: true,
          minItems: 1,
          errorMessage: {
            minItems: "Receiver array cannot be empty",
			uniqueItems: "Receiver IDs must be unique"
          }
        },
		{
          type: "number",
          minimum: 1,
          errorMessage: {
            type: "Receiver ID must be a number",
            minimum: "Receiver ID must be at least 1"
          }
        }
      ]
    },
    senderId: {
      type: "number",
      minimum: 1,
      errorMessage: {
        type: "Sender ID must be a number",
        minimum: "Sender ID must be at least 1"
      }
    },
    tournamentId: {
      type: "number",
      minimum: 1,
      errorMessage: {
        type: "Tournament ID must be a number",
        minimum: "Tournament ID must be at least 1"
      }
    },
    tournamentName: {
      type: "string",
      minLength: 3,
      maxLength: 30,
      pattern: tournamentNameRegex,
      errorMessage: {
        type: "Tournament name must be a string",
        minLength: "Tournament name must be at least 3 characters",
        maxLength: "Tournament name cannot be longer than 30 characters",
        pattern: "Tournament name contains invalid characters"
      }
    }
  },
  required: ["type", "receiverId", "senderId", "tournamentId", "tournamentName"],
  additionalProperties: false
};


export const slugSchema = {
  type: 'object',
  properties: {
    slug: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      pattern: slugRegex,
      errorMessage: {
        type: "Slug must be a string",
        minLength: "Slug must be at least 3 characters",
        maxLength: "Slug cannot be longer than 20 characters",
        pattern: "Slug format is invalid"
      }
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
      pattern: slugRegex,
      errorMessage: {
        type: "Owner slug must be a string",
        minLength: "Owner slug must be at least 3 characters",
        maxLength: "Owner slug cannot be longer than 20 characters",
        pattern: "Owner slug format is invalid"
      }
    },
    tournamentId: {
      type: "number",
      minimum: 1,
      errorMessage: {
        type: "Tournament ID must be a number",
        minimum: "Tournament ID must be at least 1"
      }
    },
    tournamentName: {
      type: "string",
      minLength: 3,
      maxLength: 30,
      pattern: tournamentNameRegex,
      errorMessage: {
        type: "Tournament name must be a string",
        minLength: "Tournament name must be at least 3 characters",
        maxLength: "Tournament name cannot be longer than 30 characters",
        pattern: "Tournament name contains invalid characters"
      }
    },
    answer: {
      type: "string",
      enum: ["decline", "accept"],
      errorMessage: {
        type: "Answer must be a string",
        enum: "Answer must be either 'decline' or 'accept'"
      }
    },
  },
  required: ["ownerSlug", "tournamentId", "tournamentName", "answer"],
  additionalProperties: false
};

export const actionBodySchema = {
  type: "object",
  properties: {
	action: {
	  type: "string",
	  enum: ["logout", "markRead", "delete"],
	  errorMessage: {
		type: "Invalid action",
		enum: "Invalid action"
	    }
	  }
	},
	required: ["action"],
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
      pattern: usernameRegex,
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
      pattern: passwordRegex,
      errorMessage:
      {
        type: "Password must be a string",
        minLength: "Password must be at least 6 characters",
        maxLength: "Password cannot be longer than 15 characters",
        pattern: "Password needs at least one uppercase and lowercase letter, one number and one special character between #?+!@$%^&*=",
      },
    },
  },
  required: ["username", "password"],
  additionalProperties: false
};

export const nicknameSchema = {
  type: "object",
  properties: {
    nickname: {
      type: "string",
      minLength: 3,
      maxLength: 15,
      pattern: tournamentNameRegex,
      errorMessage: {
        type: "Nickname must be a string",
        minLength: "Nickname must be at least 3 characters",
        maxLength: "Nickname cannot be longer than 15 characters",
        pattern: "Nickname contains invalid characters"
      }
    }
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
      pattern: passwordRegex,
      errorMessage: {
        type: "Password must be a string",
        minLength: "Password must be at least 6 characters",
        maxLength: "Password cannot be longer than 15 characters",
        pattern: "Password needs at least one uppercase and lowercase letter, one number and one special character between #?+!@$%^&*="
      }
    }
  },
  required: ["password"],
  additionalProperties: false
};

export const usernameSchema = {
  type: "object",
  properties: {
    username: {
      type: "string",
      minLength: 3,
      maxLength: 15,
      pattern: usernameRegex,
      errorMessage: {
        type: "Username must be a string",
        minLength: "Username must be at least 3 characters",
        maxLength: "Username cannot be longer than 15 characters",
        pattern: "Username format is invalid"
      }
    }
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
      pattern: "^(?=.*[0-9])[0-9]+$",
      errorMessage: {
        type: "Code must be a string",
        minLength: "Code must be 6 digits",
        maxLength: "Code must be 6 digits",
        pattern: "Code must contain only numbers"
      }
    }
  },
  required: ["code"],
  additionalProperties: false
};

/*export const idUserSchema = {
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
};*/