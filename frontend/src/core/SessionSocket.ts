/// <reference types="vite/client" />
import { refreshNotification } from "../Utils/notification";
import Ajv, { ErrorObject } from "ajv";
import { currentPage, navigate, WebPath } from "./router";
import { ErrorPopup } from "../pages/ErrorPage.js";
import { logoutUser } from "../api/user-service/connection/logoutUser.js";
import { Game } from "../babylon/main";
import { PageState } from "../pages/Game-Pages/Event";

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
			message: { type: ["string", "number"], minLength: 1, maxLength: 500 },
			sender: { type: ["string", "number"], minLength: 1, maxLength: 100 }
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
	const ajv = new Ajv({ allowUnionTypes: true });
	const validate = ajv.compile(schema);
	const valid = validate(message);
	return {
		valid,
		errors: validate.errors
	};
}

export class SessionSocket {
	static instance: null | SessionSocket = null;
	public sWS: WebSocket | null = null;
	private heartbeatInterval: number | null = null;
	private heartbeatTimeout: number | null = null;
	private pingInterval: number = 30000; // every 30s sends a ping
	private pongInterval: number = 30000; // 30s to recieve back pong

	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectDelay: number = 10000; // 10 seconds
	private shouldAttemptReconnect: boolean = true;

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
		if (!SessionSocket.instance) {
			SessionSocket.instance = new SessionSocket();
			alert("WebSocket session instance created");
			(window as any).GLOBAL_WEBSOCKET = SessionSocket.instance;
		}
		return SessionSocket.instance;
	}

	public connect() {
		if (!this.sWS) {
			this.sWS = new WebSocket(this.getStatusWsUrl());
			this.stopHeartbeat();
			this.clearHeartbeatTimeout();
			this.setupEventListeners();

		} else {
			if (this.isOpen() === false && this.sWS.readyState !== WebSocket.CONNECTING) {
				// console.log(this.sWS.readyState);
				this.sWS = null;
				this.sWS = new WebSocket(this.getStatusWsUrl());
				this.stopHeartbeat();
				this.clearHeartbeatTimeout();
				this.setupEventListeners();
			}
		}
	}

	private setupEventListeners() {
		if (!this.sWS) {
			console.error("No socket connection found to configurate");
			return;
		}

		this.sWS.onopen = () => {
			console.log("Connected to WebSocket session server");
			this.startHeartbeat();
		};

		this.sWS.onmessage = (event) => {
			let data: any;
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

		this.sWS.onerror = (error) => {
			console.error("Error Session WebSocket:", error);
		};

		this.sWS.onclose = async (event) => {
			console.log(`Connexion to Session WebSocket closed with code ${event.code} and reason: ${event.reason}`);
			this.stopHeartbeat();
			this.clearHeartbeatTimeout();
			if (event.code == 4002) {
				this.shouldAttemptReconnect = false;
				console.error("Websocket closed due to authentication error");
				await logoutUser();
				await ErrorPopup("Authentication error, please log in again");
				await navigate('/login');
			}
			else if (event.code == 4003) {
				this.shouldAttemptReconnect = false;
				console.error("WebSocket closed due to authentication failure");
				await logoutUser();
				await ErrorPopup("Session expired, please log in again");
				await navigate('/login');
			} else if (event.code != 4000 && event.code != 4010 && this.shouldAttemptReconnect) {
				this.reconnect();
			}
		};
	}

	private getStatusWsUrl(): string {
		const status = import.meta.env?.MODE;
		if (status === "development")
			return `ws://${import.meta.env.VITE_DOMAIN_NAME}:8080/s-ws/`;
		else
			return `wss://${window.location.host}/s-ws/`;
	}

	private startHeartbeat(): void {
		this.heartbeatInterval = window.setInterval(() => {
			if (this.sWS?.readyState === WebSocket.OPEN) {
				this.send(JSON.stringify({ type: 'ping' }));
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

	public send(data: string) {
		if (this.sWS && this.isOpen())
			this.sWS.send(data);
		else
			console.error("Session WebSocket is not open to send data", data);
	}

	private handleMessage(data: any) {
		if (data.type === 'pong') {
			this.clearHeartbeatTimeout();
			return;
		}
		else if (data.type === "message") {
			refreshNotification();
			if ((data.message === "friend_accept"  || data.message === "friend_reject" || data.message === "friend_request") && currentPage && WebPath && WebPath.startsWith('/user')) {
				currentPage.render();
			}
			if (data.message === "tournament_ready" || data.message === "tournament_cancel") {
				if (currentPage instanceof Game){
					if (currentPage.renderScene?.GamePage) {
						if (currentPage.renderScene.GamePage.IsWaiting.IsWaiting && currentPage.renderScene.GamePage.IsWaiting.idTournament === data.sender) {
							if (data.message === "tournament_ready") {
								currentPage.renderScene.GamePage._Event.setStatePage = PageState.BRACKET;
								currentPage.renderScene.GamePage.generateBracketTournament(data.sender);
							}
							else if (data.message === "tournament_cancel") {
								currentPage.renderScene.GamePage._Event.setStatePage = PageState.TOURNAMENT;
								currentPage.renderScene.GamePage.generateNewTournamentPage();
							}
						}
					} 
				}
			}
			return;
		} else if (data.type === "auth_success") {
			this.reconnectAttempts = 0;
			this.shouldAttemptReconnect = true;
			console.log("Authentication successful");
			return;
		}
	}

	public addEventListener(type: string, listener: (event: any) => void) {
		if (!this.sWS)
			return;
		this.sWS.addEventListener(type as any, listener);
	}

	public removeEventListener(type: string, listener: (event: any) => void) {
		if (!this.sWS)
			return;
		this.sWS.removeEventListener(type as any, listener);
	}

	public isOpen(): boolean {
		if (!this.sWS)
			return false;
		return this.sWS.readyState === WebSocket.OPEN;
	}

	public async reconnect(): Promise<void> {
		if (!this.shouldAttemptReconnect) {
			return;
		}
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error("Max reconnect attempts reached. Giving up.");
			this.shouldAttemptReconnect = false;
			this.close(3000, "Max reconnect attempts reached");
			await logoutUser();
			await ErrorPopup("Authentication error, please log in again");
			await navigate('/login');
			return;
		}
		this.reconnectAttempts++;
		console.log("Reconnecting to Session WebSocket server...");
		this.stopHeartbeat();
		const reconnectInterval = setInterval(() => {
			if (!this.isOpen()) {
				if (this.sWS && this.sWS.readyState == WebSocket.CONNECTING) {
					return;
				}
				try {
					console.log("Attempting to reconnect...");
					this.sWS = null;
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
		}, this.reconnectDelay); // Try to reconnect every x milliseconds
	}

	public close(code: number = -1, reason: string = ""): void {
		this.shouldAttemptReconnect = false;
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