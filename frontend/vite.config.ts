import { defineConfig } from 'vite';

const API_PORT = process.env.VITE_API_PORT ? Number(process.env.VITE_API_PORT) : undefined;
const VITE_PORT = process.env.VITE_PORT ? Number(process.env.VITE_PORT) : undefined;
const IP = process.env.VITE_IP;

// For dev mode
export default defineConfig({
    server: {
        port: VITE_PORT,
        host: `${IP}`,
        proxy: {
            '/api': {
                target: `http://api-gateway:${API_PORT}`,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'),
            },
            '/ws': {
                target: `ws://localhost:4443/ws`,
                ws: true,
                changeOrigin: true,
                secure: false,
            },
        },
    }
});
