/// <reference types="vite/client" />

export class SessionSocket {
    static instance: null | SessionSocket = null;
    public ws: WebSocket;
    public sWS: WebSocket;
    private heartbeatInterval: number | null = null;
    private heartbeatTimeout: number | null = null;
    private pingInterval: number = 30000; // every 30s sends a ping
    private pongInterval: number = 5000; // 5s to recieve back pong
    private userId: number = 0;

    constructor(userId: number) {
        this.userId = userId;
		try {
			console.log("Creating new WebSocket connection");
			this.ws = new WebSocket(this.getGameWsUrl());
            this.sWS = new WebSocket(this.getStatusWsUrl());
			this.setupEventListeners();

		} catch (error) {
			console.error("Failed to create socket", error);
			throw error;
		}
    }

    static getInstance(userId: number = -1): SessionSocket {
        // console.log("=== Socket.getInstance DEBUG ===");
        // console.log("Current Socket.instance:", !!Socket.instance);
        // console.log("Global instance exists:", !!(window as any).GLOBAL_WEBSOCKET);

        if (!SessionSocket.instance) {
            console.log("Creating new Socket instance");
            SessionSocket.instance = new SessionSocket(userId);
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
            console.log("Connected to WebSocket server, sending auth with id " + this.userId);
            this.authenticate();
            this.startHeartbeat();
        };

        this.sWS.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
				console.log(data);
                if (data.type === 'pong') {
                    console.log('Received pong from server');
                    this.clearHeartbeatTimeout();
                    return;
                }

                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        this.sWS.onerror = (error) => {
            console.error("Error WebSocket:", error);
        };

        this.sWS.onclose = () => {
            console.log("Connexion WebSocket closed");
            this.stopHeartbeat();
            // delete (window as any).GLOBAL_WEBSOCKET;
        };
    }

    private getGameWsUrl(): string {
        console.log(import.meta.env?.MODE);
        const status = import.meta.env?.MODE;
        if (status === "development")
            return `ws://${import.meta.env.VITE_DOMAIN_NAME}:8080/g-ws/`;
        else
            return `wss://${import.meta.env.VITE_DOMAIN_NAME}/g-ws/`;
    }

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
        console.log('Received message:', data);
        // TODO Emma Add logic here, when recieving a friend request message
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

    close(): void {
        this.stopHeartbeat();
        if (!this.sWS)
            return;
        this.sWS.close(1000, 'Manual close');
    }
}