/// <reference types="vite/client" />
import { refreshNotification } from "../Utils/notification";
import Ajv, { ErrorObject } from "ajv";

export interface WebSocketMessage {
	type: string;
	message?: string; // Pour les messages de type "message"
	sender?: string; // Pour les messages de type "message"
}

export interface FormatCheckResult {
	valid: boolean;
	errors: ErrorObject[] | null | undefined;
}

export function checkWebSocketMessageFormat(message: WebSocketMessage): FormatCheckResult {
	const schema = {
		type: "object",
		properties: {
			type: { type: "string", minLength: 3 },
			message: { type: "string", minLength: 1, maxLength: 500 },
			sender: { type: "string", minLength: 1, maxLength: 100 }
		},
		additionalProperties: false,
		required: ["type"],
		allOf: [
			{
				if: { properties: { type: { const: "auth_success" } } },
				then: {
					required: ["type"],
				}
			},
			{
				if: { properties: { type: { const: "ping" } } },
				then: {
					required: ["type"],
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

export class SessionSocket {
    static instance: null | SessionSocket = null;
    // public ws: WebSocket;
    public sWS: WebSocket;
    private heartbeatInterval: number | null = null;
    private heartbeatTimeout: number | null = null;
    private pingInterval: number = 30000; // every 30s sends a ping
    private pongInterval: number = 5000; // 5s to recieve back pong

    constructor() {
		try {
			console.log("Creating new WebSocket connection");
            this.sWS = new WebSocket(this.getStatusWsUrl());
			this.setupEventListeners();

		} catch (error) {
			console.error("Failed to create socket", error);
			throw error;
		}
    }

    static getInstance(): SessionSocket {
        // console.log("=== Socket.getInstance DEBUG ===");
        // console.log("Current Socket.instance:", !!Socket.instance);
        // console.log("Global instance exists:", !!(window as any).GLOBAL_WEBSOCKET);

        if (!SessionSocket.instance) {
            console.log("Creating new Socket instance");
            SessionSocket.instance = new SessionSocket();
            // (window as any).GLOBAL_WEBSOCKET = Socket.instance;
        }

        // console.log("=== END Socket.getInstance DEBUG ===");
        return SessionSocket.instance;
    }

    private setupEventListeners() {
        if (!this.sWS) {
            console.error("No socket connection found to configurate");
            return;
        }

        this.sWS.onopen = () => {
            console.log("Connected to WebSocket server");
            this.authenticate();
            this.startHeartbeat();
        };

        this.sWS.onmessage = (event) => {
            let data: any;
			try {
				data = JSON.parse(event.data);
            } catch (error) {
                console.error('Error parsing JSON message.');
				// TODO Emma Add logic here, when recieving an invalid message format
				// Websocket will be closed (someone exterior sent a wrong message to the websocket, normally it's impossible)
				this.close(3000, 'Invalid message format');
				return;
            }
			const checkFormat = checkWebSocketMessageFormat(data);
			if (checkFormat.valid === false) {
				console.error("Invalid WebSocket message format:", checkFormat.errors);
				// TODO Emma Add logic here, when recieving an invalid message format
				// Websocket will be closed (someone exterior sent a wrong message to the websocket, normally it's impossible)
				this.close(3000, 'Invalid message format');
				return;
			}
			this.handleMessage(data);
        };

        this.sWS.onerror = (error) => {
            console.error("Error WebSocket:", error);
        };

        this.sWS.onclose = () => {
            console.log("Connexion WebSocket closed");
            this.stopHeartbeat();
            // TODO Emma Add logic here, when the websocket is closed
			this.reconnect(); // Do we reconnect on close ? Websocket can also be closed if backend recompiles
        };
    }

    // private getGameWsUrl(): string {
    //     console.log(import.meta.env?.MODE);
    //     const status = import.meta.env?.MODE;
    //     if (status === "development")
    //         return `ws://${import.meta.env.VITE_DOMAIN_NAME}:8080/g-ws/`;
    //     else
    //         return `wss://${import.meta.env.VITE_DOMAIN_NAME}/g-ws/`;
    // }

    private getStatusWsUrl(): string {
        console.log(import.meta.env?.MODE);
        const status = import.meta.env?.MODE;
        if (status === "development")
            return `ws://${import.meta.env.VITE_DOMAIN_NAME}:8080/s-ws/`;
        else
            return `wss://${import.meta.env.VITE_DOMAIN_NAME}/s-ws/`;
    }

    private startHeartbeat(): void {
        console.log("Starting heartbeat");
        this.heartbeatInterval = window.setInterval(() => {
            if (this.sWS?.readyState === WebSocket.OPEN) {
                console.log("Ping sent to server");
                this.send(JSON.stringify({type: 'ping'}));
                this.heartbeatTimeout = window.setTimeout(() => {
                    console.error("No pong recieved, closing connection");
                    this.sWS?.close(1000, 'No pong recieved');
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

    private authenticate() {
        const token = localStorage.getItem("token");
		if (!token) {
			console.error("Impossible to authenticate for the session websocket, no token.");
			return ;
		}
        this.send(JSON.stringify({
            type: "auth",
            token: token
        }));
    }

    public  send(data: string) {
        if (this.sWS && this.isOpen())
            this.sWS.send(data);
        else
            console.error("WebSocket is not open to send data", data);
    }

    private handleMessage(data: any) {
        console.log('➡️ Received message:', data);
		if (data.type === 'pong') {
			// console.log('Received pong from server');
			this.clearHeartbeatTimeout();
			return;
		}
		else if (data.type === "message") {
			console.log("receive friend request frome data.type message");
			refreshNotification();
			return ;
			// TODO Emma Add logic here, when recieving a friend request message
		}
    }

    public  addEventListener(type: string, listener: (event: any) => void) {
        if (!this.sWS)
            return;
        this.sWS.addEventListener(type as any, listener);
    }

    public  removeEventListener(type: string, listener: (event: any) => void) {
        if (!this.sWS)
            return;
        this.sWS.removeEventListener(type as any, listener);
    }

    public isOpen(): boolean {
        if (!this.sWS)
            return false;
        return this.sWS.readyState === WebSocket.OPEN;
    }

	public reconnect(): void {
		console.log("Reconnecting to WebSocket server...");
		this.stopHeartbeat();
		const reconnectInterval = setInterval(() => {
			if (!this.isOpen()) {
				try {
					console.log("Attempting to reconnect...");
					this.sWS = new WebSocket(this.getStatusWsUrl());
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
		this.sWS.close();
		
	}

    public close(code: number = -1, reason: string = ""): void {
        this.stopHeartbeat();
        if (!this.sWS)
            return;
        if (code > 0 && reason.length > 0)
			this.sWS.close(code, reason);
		else if (code > 0)
			this.sWS.close(code);
		else
			this.sWS.close();
    }
}