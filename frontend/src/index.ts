import { setupRouter } from './core/router.js';

const app = document.getElementById("app");

if (!app)
    console.warn("No div#app found !");

window.addEventListener('DOMContentLoaded', async () => {
    await setupRouter();
});




