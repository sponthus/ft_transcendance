import { defineConfig } from 'vite';

const DOMAIN_NAME = process.env.VITE_DOMAIN_NAME;
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
                target: `ws://${DOMAIN_NAME}:4443/ws`,
                ws: true,
                changeOrigin: true,
                secure: false,
            },
        },
    }
});
