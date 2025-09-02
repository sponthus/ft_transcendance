import { setupRouter } from './core/router.js';
//import { checkLog } from "./api/check-log.js";
import { App } from './babylon/main.js';

console.log("JS loaded !");

const app = document.getElementById("app");
if (app) {
    // app.innerHTML = "<h1>Home page</h1>";
} else {
    console.warn("No div#app found !");
}

window.addEventListener('DOMContentLoaded', async () => {
    await setupRouter();
    // TODO = Check log ? Restore a session according to cookies ?
});
