import path from "path";
import envSchema from "env-schema"; // Allows change and validation of variables by confronting them to a JSON scheme

// Definition of JSON scheme, everything expected in .env
// required = mandatory variables
// properties defines expected types and default values if absent
const schema = {
    type: "object",
    required: ["DOMAIN_NAME", "IP", "API_PORT", "USER_PORT", "GAME_PORT", "UPLOAD_PORT", "SESSION_PORT", "STATUS_WS_PORT", "LOG_LEVEL", "NODE_ENV", "USERS_DB_FILE", "GAMES_DB_FILE"],
    properties: {
		DOMAIN_NAME: {
			type: "string",
			default: "localhost"
		},
		IP: {
			type: "string",
			default: "0.0.0.0"
		},
        API_PORT: {
            type: "number",
            default: 3000,
        },
		USER_PORT: {
            type: "number",
            default: 3001,
        },
		GAME_PORT: {
			type: "number",
            default: 3002,
		},
		UPLOAD_PORT: {
			type: "number",
			default: 3003
		},
		SESSION_PORT: {
			type: "number",
			default: 3004
		},
		STATUS_WS_PORT: {
			type: "number",
			default: 5000
		},
		GAME_WS_PORT: {
			type: "number",
			default: 4000
		},
        LOG_LEVEL: {
            type: "string",
            default: "info",
        }, // Level des logs affiches : en general info, mais on peut n'afficher que les erreurs
        NODE_ENV: {
            type: "string",
            default: "development",
            enum: ["development", "testing", "production"],
        },
        USERS_DB_FILE: {
            type: "string",
            default: "./users.db",
        },
        GAMES_DB_FILE: {
            type: "string",
            default: "./games.db",
        }
    },
};

// envSchema reads .env at the specified path
// path.join builds the path to .env from actual dir and applying ../../
// Then it applies default variables and checks them, otherwise an error is thrown
// Returns config object with typed validated values
const config = envSchema({
    schema: schema,
    dotenv: {
        path: path.join(import.meta.dirname, "../../.env"),
    },
});

// Transforms config object to give variable names more coherent to camelCase JS convention
const envConfig = {
	ip: config.IP,
	domain_name: config.DOMAIN_NAME,
    api_port: config.API_PORT,
	user_port: config.USER_PORT,
	game_port: config.GAME_PORT,
	upload_port: config.UPLOAD_PORT,
	session_port: config.SESSION_PORT,
	session_ws_port: config.SESSION_WS_PORT,
	game_ws_port: config.GAME_WS_PORT,
    logLevel: config.LOG_LEVEL,
    nodeEnv: config.NODE_ENV,
    usersDbFile: config.USERS_DB_FILE,
    gamesDbFile: config.GAMES_DB_FILE,
};

// envConfig becomes default export from env.js file
export default envConfig;
