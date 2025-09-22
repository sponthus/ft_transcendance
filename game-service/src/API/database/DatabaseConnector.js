import fp from "fastify-plugin";
import env from "../../../config/env.js";
import DatabaseEventHandler from "./DatabaseEventHandler.js";
import DatabaseHandler from "./DatabaseHandler.js";

async function DatabaseConnector(fastify, options) {
    const dbFile = env.gamesDbFile || "./games.db";
    const dbHandler = new DatabaseHandler(dbFile, { verbose: console.log });
    fastify.decorate('db', dbHandler);

    const dbEventHandler = new DatabaseEventHandler(dbHandler);
    fastify.decorate('dbEventHandler', dbEventHandler);

    fastify.addHook('onClose', (fastify, done) => {
        fastify.db.close();
        done();
    });

    console.log("✅ Database and games / tournaments tables created successfully");
}

export default fp(DatabaseConnector);