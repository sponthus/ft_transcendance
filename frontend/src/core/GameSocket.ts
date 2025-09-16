export class GameSocket {
	public ws: WebSocket;

	private gameId: number;
	private heartbeatInterval: number | null = null;
    private heartbeatTimeout: number | null = null;
    private pingInterval: number = 30000; // every 30s sends a ping
    private pongInterval: number = 5000; // 5s to recieve back pong

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
            try {
                const data = JSON.parse(event.data);
				// TODO Check data contains "type"
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
}