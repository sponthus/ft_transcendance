/// <reference types="vite/client" />

export class Socket {
    static instance: null | Socket = null;
    public ws: WebSocket | null = null;
    private heartbeatInterval: number | null = null;
    private heartbeatTimeout: number | null = null;
    private pingInterval: number = 30000; // every 30s sends a ping
    private pongInterval: number = 5000; // 5s to recieve back pong
    private userId: number = 0;

    constructor(userId: number) {
        this.userId = userId;
        this.connect();
    }

    private connect() {
        try {
            console.log("Creating new WebSocket connection");
            this.ws = new WebSocket(this.getWsUrl());
            this.setupEventListeners();
        } catch (error) {
            console.error("Failed to create socket", error);
            throw error;
        }
    }

    static getInstance(userId: number): Socket {
        // console.log("=== Socket.getInstance DEBUG ===");
        // console.log("Current Socket.instance:", !!Socket.instance);
        // console.log("Global instance exists:", !!(window as any).GLOBAL_WEBSOCKET);

        if (!Socket.instance) {
            console.log("Creating new Socket instance");
            Socket.instance = new Socket(userId);
            // (window as any).GLOBAL_WEBSOCKET = Socket.instance;
        }

        // console.log("=== END Socket.getInstance DEBUG ===");
        return Socket.instance;
    }

    private setupEventListeners() {
        if (!this.ws) {
            console.error("No socket connection found to configurate");
            return;
        }

        this.ws.onopen = () => {
            console.log("Connected to WebSocket server, sending auth with id " + this.userId);
            this.authenticate();
            this.startHeartbeat();
        };

        this.ws.onmessage = (event) => {
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

        this.ws.onerror = (error) => {
            console.error("Error WebSocket:", error);
        };

        this.ws.onclose = () => {
            console.log("Connexion WebSocket closed");
            this.stopHeartbeat();
            // delete (window as any).GLOBAL_WEBSOCKET;
        };
    }
    private getWsUrl(): string {
        console.log(import.meta.env?.MODE);
        const status = import.meta.env?.MODE;
        if (status === "development")
            return 'ws://localhost:8080/ws/';
        else
            return `wss://${window.location.host}/ws/`;
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

    private authenticate() {
        this.send(JSON.stringify({
            type: "auth",
            userId: this.userId
        }));
    }

    public  send(data: string) {
        if (this.ws && this.isOpen())
            this.ws.send(data);
        else
            console.error("WebSocket is not open to send data", data);
    }

    private handleMessage(data: any) {
        console.log('Received message:', data);
        // TODO Add logic here
    }

    public  addEventListener(type: string, listener: (event: any) => void) {
        if (!this.ws)
            return;
        this.ws.addEventListener(type as any, listener);
    }

    public  removeEventListener(type: string, listener: (event: any) => void) {
        if (!this.ws)
            return;
        this.ws.removeEventListener(type as any, listener);
    }

    public isOpen(): boolean {
        if (!this.ws)
            return false;
        return this.ws.readyState === WebSocket.OPEN;
    }

    close(): void {
        this.stopHeartbeat();
        if (!this.ws)
            return;
        this.ws.close(1000, 'Manual close');
    }
}