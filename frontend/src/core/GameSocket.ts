/// <reference types="vite/client" />
import Ajv, { ErrorObject } from "ajv";

export interface WebSocketMessage {
	type: string;
	gameId?: number; // For auth_success messages
	gameState?: any; // For game state updates
	winner?: string; // For game end messages
	scoreA?: number; // For game end messages
	scoreB?: number; // For game end messages
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
					timePauseBegin: { type: "number" }
				},
				required: ["paddle1", "paddle2", "ball", "score", "spell1", "spell2", "specialCooldown1", "specialCooldown2", "die1", "die2", "ispaused", "timePauseBegin"],
				additionalProperties: false
			},
			winner: { 
				type: "string", 
				minLength: 1, 
				maxLength: 100,
				pattern: "^(?=.*[a-zA-ZÀ-ÿ0-9])[a-zA-ZÀ-ÿ0-9 \\-]+$" 
			},
			scoreA: { type: "number", minimum: 0 },
			scoreB: { type: "number", minimum: 0 }
		},
		additionalProperties: false,
		required: ["type"],
		allOf: [
			{
				if: { properties: { type: { const: "auth_success" } } },
				then: {
					required: ["type", "gameId"],
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
    private pongInterval: number = 5000; // 5s to recieve back pong
	private playing: boolean = false;

	// Call this when the game actually starts
	public setPlaying(state: boolean) {
		this.playing = state;
	}

	constructor(gameId: number) {
		if (!gameId || gameId == 0) {
			// TODO make me an error
			alert("No gameID provided");
		}
		this.gameId = gameId;
		try {
			console.log("Creating new WebSocket connection");
			this.ws = new WebSocket(this.getGameWsUrl());
			this.setupEventListeners();

		} catch (error) {
			console.error("Failed to create socket", error);
			throw error;
		}
    }

	private getGameWsUrl(): string {
        console.log(import.meta.env?.MODE);
        const status = import.meta.env?.MODE;
        if (status === "development")
            return `ws://${import.meta.env.VITE_DOMAIN_NAME}:8080/g-ws/`;
        else
            return `wss://${import.meta.env.VITE_DOMAIN_NAME}/g-ws/`;
    }

	private setupEventListeners() {
        if (!this.ws) {
            console.error("No socket connection found to configurate");
            return;
        }

        this.ws.onopen = () => {
            console.log("Connected to WebSocket server");
            this.authenticate();
            this.startHeartbeat();
        };

        this.ws.onmessage = (event) => {
            let data = null;
			try {
                data = JSON.parse(event.data);
            } catch (error) {
				console.error('Error parsing JSON message.');
				// TODO Add logic here, when recieving an invalid message format
				// Websocket will be closed (someone exterior sent a wrong message to the websocket, normally it's impossible)
				this.close(3000, 'Invalid message format');
				return;
            }
			const checkFormat = checkWebSocketMessageFormat(data);
			if (checkFormat.valid === false) {
				console.error("Invalid WebSocket message format:", checkFormat.errors);
				// TODO Add logic here, when recieving an invalid message format
				// Websocket will be closed (someone exterior sent a wrong message to the websocket, normally it's impossible)
				this.close(3000, 'Invalid message format');
				return;
			}
			this.handleMessage(data);
        };

        this.ws.onerror = (error) => {
            console.error("Error WebSocket:", error);
        };

        this.ws.onclose = () => {
            console.log("Connexion WebSocket closed");
            this.stopHeartbeat();
			// TODO Complete logic here, when the websocket is closed
			if (this.playing === false)
				this.reconnect();
			// Do we reconnect on close if playing ? Websocket can also be closed if backend recompiles
        };
    }

	private startHeartbeat(): void {
        console.log("Starting heartbeat");
        this.heartbeatInterval = window.setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                console.log("Ping sent to server");
                this.send(JSON.stringify({type: 'ping'}));
                this.heartbeatTimeout = window.setTimeout(() => {
                    console.error("No pong recieved, closing connection");
                    this.ws?.close(1000, 'No pong recieved');
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
            console.error("WebSocket is not open to send data", data);
    }

	private authenticate() {
        const token = localStorage.getItem("token");
		if (!token) {
			console.error("Impossible to authenticate for the session websocket, no token.");
			return ;
		}
        this.send(JSON.stringify({
            type: "auth",
            token: token,
			gameId: this.gameId
        }));
    }

	private handleMessage(data: any) {
        console.log('Received message:', data);
		if (data.type === 'pong') {
			console.log('Received pong from server');
			this.clearHeartbeatTimeout();
			return;
		}
    }

	public isOpen(): boolean {
        if (!this.ws)
            return false;
        return this.ws.readyState === WebSocket.OPEN;
    }

	public reconnect(): void {
		console.log("Reconnecting to WebSocket server...");
		this.stopHeartbeat();
		const reconnectInterval = setInterval(() => {
			if (!this.isOpen()) {
				try {
					console.log("Attempting to reconnect...");
					this.ws = new WebSocket(this.getGameWsUrl());
					console.log("Reconnected successfully!");
					this.setupEventListeners();
					this.startHeartbeat();
					clearInterval(reconnectInterval);
				} catch (error) {
					console.error("Reconnection attempt failed:", error);
				}
			} else {
				clearInterval(reconnectInterval);
			}
		}, 10000); // Try to reconnect every 5 seconds
		this.ws.close();
		
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