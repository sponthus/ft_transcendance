import { Agent } from "undici";

const tlsAgent = new Agent({
    connect: {
        rejectUnauthorized: false
    }
});

export default tlsAgent;