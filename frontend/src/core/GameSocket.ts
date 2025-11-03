/// <reference types="vite/client" />
import Ajv, { ErrorObject } from "ajv";
import { ErrorPopup } from "../pages/ErrorPage.js"; 
import { navigate } from "./router.js";
import { logoutUser } from "../api/user-service/connection/logoutUser.js";

export interface WebSocketMessage {
	type: string;
	gameId?: number; // For auth_success messages
	gameState?: any; // For game state updates
	winner?: string; // For game end messages
	scoreA?: number; // For game end messages
	scoreB?: number; // For game end messages
	playerA?: string;
	playerB?: string;
}

export interface FormatCheckResult {
	valid: boolean;
	errors: ErrorObject[] | null | undefined;
}

// Checks the format of the message recieved via the websocket
// It will contain exactly what's expected of be rejected
export function checkWebSocketMessageFormat(message: WebSocketMessage): FormatCheckResult {
	const schema = {
		type: "object",
		properties: {
			type: { type: "string", minLength: 3 },
			gameId: { type: "number", minimum: 1 },
			gameState: { 
				type: "object", 
				properties: {
					paddle1: { 
						type: "object",
						properties: {
							x: { type: "number" }
						}
					},
					paddle2: { 
						type: "object",
						properties: {
							x: { type: "number" }
						}
					},
					ball: { 
						type: "object",
						properties: {
							x: { type: "number" },
							z: { type: "number" }
						}
					},
					score: { 
						type: "object", 
						properties: {
							s1: { type: "number", minimum: 0 },
							s2: { type: "number", minimum: 0 }
						}
					},
					spell1: { 
						type: "object",
						properties: {
							x: { type: "number" },
							y: { type: "number" },
							z: { type: "number" }
						}
					},
					spell2: { 
						type: "object",
						properties: {
							x: { type: "number" },
							y: { type: "number" },
							z: { type: "number" }
						}
					},
					specialCooldown1: { type: "number" },
					specialCooldown2: { type: "number" },
					die1: { type: "boolean" },
					die2: { type: "boolean" },
					ispaused: { type: "boolean" },
					timePauseBegin: { type: "number" },
					gameOption: { type: "number"}
				},
				required: ["paddle1", "paddle2", "ball", "score", "spell1", "spell2", "specialCooldown1", "specialCooldown2", "die1", "die2", "ispaused", "timePauseBegin"],
				additionalProperties: false
			},
			winner: { 
				type: "string", 
				minLength: 1, 
				maxLength: 21,
				pattern: "^(?!@?[_-])(?!.*[_-]$)(?!^\\s)(?!.*\\s$)(?!.*\\s{2})(?!.*(?:\\s.*){3})(?=.*[A-Za-z])(?!@?[0-9_-]+$)@?[A-Za-z0-9 _-]+$" // Updated pattern 
			},
			scoreA: { type: "number", minimum: 0 },
			scoreB: { type: "number", minimum: 0 },
			playerA: { 
				type: "string", 
				minLength: 3,
				maxLength: 21,
				pattern: "^(?!@?[_-])(?!.*[_-]$)(?!^\\s)(?!.*\\s$)(?!.*\\s{2})(?!.*(?:\\s.*){3})(?=.*[A-Za-z])(?!@?[0-9_-]+$)@?[A-Za-z0-9 _-]+$" // Updated pattern
			},
			playerB: { 
				type: "string", 
				minLength: 3,
				maxLength: 21,
				pattern: "^(?!@?[_-])(?!.*[_-]$)(?!^\\s)(?!.*\\s$)(?!.*\\s{2})(?!.*(?:\\s.*){3})(?=.*[A-Za-z])(?!@?[0-9_-]+$)@?[A-Za-z0-9 _-]+$" // Updated pattern
			}
		},
		additionalProperties: false,
		required: ["type"],
		allOf: [
			{
				if: { properties: { type: { const: "auth_success" } } },
				then: {
					required: ["type", "gameId", "playerA", "playerB"],
				}
			},
			{
				if: { properties: { type: { const: "ping" } } },
				then: {
					required: ["type"],
				}
			},
			{
				if: { properties: { type: { const: "stateUpdate" } } },
				then: {
					required: ["type", "gameState"],
				}
			},
			{
				if : { properties: { type: { const: "endGame" } } },
				then: {
					required: ["type", "winner", "scoreA", "scoreB"],
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

export class GameSocket {
	public ws: WebSocket;

	private gameId: number;
	private heartbeatInterval: number | null = null;
    private heartbeatTimeout: number | null = null;
    private pingInterval: number = 30000; // every 30s sends a ping
    private pongInterval: number = 10000; // 10s to recieve back pong

	public playing: boolean = false;

	constructor(gameId: number) {
		try {
			if (!gameId || gameId == 0)
				throw new Error('No gameID provided');
			this.gameId = gameId;
			this.ws = new WebSocket(this.getGameWsUrl());
			this.setupEventListeners();

		} catch (error) {
			console.error("Failed to create socket", error);
			throw new Error("Failed to create socket");
		}
    }

	public setPlaying(playing: boolean) {
		this.playing = playing;
	}
	
	private getGameWsUrl(): string {
        const status = import.meta.env?.MODE;
        if (status === "development")
            return `ws://${import.meta.env.VITE_DOMAIN_NAME}:8080/g-ws/`;
        else
            return `wss://${window.location.host}/g-ws/`;
    }

	private setupEventListeners() {
        if (!this.ws) {
            console.error("No socket connection found to configurate");
            return;
        }

        this.ws.onopen = () => {
            this.authenticate();
            this.startHeartbeat();
        };

        this.ws.onmessage = (event) => {
            let data = null;
			try {
                data = JSON.parse(event.data);
            } catch (error) {
				console.error('Error parsing JSON message.');
				this.close(3000, 'Invalid message format');
				return;
            }
			const checkFormat = checkWebSocketMessageFormat(data);
			if (checkFormat.valid === false) {
				console.error("Invalid WebSocket message format:", checkFormat.errors);
				this.close(3000, 'Invalid message format');
				return;
			}
			this.handleMessage(data);
        };

        this.ws.onerror = (error) => {
            console.error("Error Game WebSocket:", error);
        };

        this.ws.onclose = async (event) => {
            this.stopHeartbeat();
			if (event.code == 4002) {
				console.warn("Websocket closed due to authentication error");
				await logoutUser();
				await ErrorPopup("Authentication error, please log in again");
				await navigate('/login');
			}
			else if (event.code == 4003) {
				console.warn("WebSocket closed due to expired session");
				await logoutUser();
				await ErrorPopup("Session expired, please log in again");
				await navigate('/login');
			} else if (this.playing === true) {
				await ErrorPopup("Disconnected from game server");
			}
        };
    }

	private startHeartbeat(): void {
        this.heartbeatInterval = window.setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.send(JSON.stringify({type: 'ping'}));
                this.heartbeatTimeout = window.setTimeout(() => {
                    console.warn("No pong received, closing connection");
                    this.ws?.close(1000, 'No pong received');
                }, this.pongInterval)
            }
        }, this.pingInterval);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        this.clearHeartbeatTimeout();
    }

    public clearHeartbeatTimeout(): void {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

	public  send(data: string) {
        if (this.ws && this.isOpen())
            this.ws.send(data);
        else
            console.error("Game WebSocket is not open to send data", data);
    }

	private authenticate() {
        this.send(JSON.stringify({
            type: "auth",
			gameId: this.gameId
        }));
    }

	private handleMessage(data: any) {
		if (data.type === 'pong') {
			this.clearHeartbeatTimeout();
			return;
		}
    }

	public isOpen(): boolean {
        if (!this.ws)
            return false;
        return this.ws.readyState === WebSocket.OPEN;
    }

    public close(code: number = -1, reason: string = ""): void {
        this.stopHeartbeat();
        if (!this.ws)
            return;
        if (code > 0 && reason.length > 0)
			this.ws.close(code, reason);
		else if (code > 0)
			this.ws.close(code);
		else
			this.ws.close();
    }
}