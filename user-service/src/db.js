import fp from "fastify-plugin";
import Database from "better-sqlite3";
import env from "../config/env.js"; //ou c'est ? sert a quoi ?

// TODO refresh token

// Initializes database from a file spec. in env variables, default = ./blog.db
async function dbConnector(fastify, options)
{
    const dbFile = env.usersDbFile || "./users.db";
    const db = new Database(dbFile, { verbose: console.log });
   
    //FAIRE UNE TRANSACTION
    try
    {
        db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL COLLATE BINARY,
            slug TEXT UNIQUE NOT NULL,
            avatar TEXT NOT NULL,
            pw_hash TEXT NOT NULL,
            last_username_change DATETIME,
            nickname DEFAULT TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            twofa_enabled INTEGER DEFAULT 0 CHECK(twofa_enabled BETWEEN 0 AND 1),
            twofa_secret TEXT DEFAULT NULL
        );
    `);

        db.exec (`
        CREATE TABLE IF NOT EXISTS menu_state (
            menu_user_id INTEGER PRIMARY KEY,
            menu_game_state INTEGER DEFAULT 0,
            menu_x_pos INTEGER DEFAULT 0,
            menu_y_pos INTEGER DEFAULT 0,
            menu_z_pos INTEGER DEFAULT 0,
            menu_color_r INTEGER DEFAULT 0 CHECK(menu_color_r BETWEEN 0 AND 255),
            menu_color_g INTEGER DEFAULT 0 CHECK(menu_color_g BETWEEN 0 AND 255),
            menu_color_b INTEGER DEFAULT 0 CHECK(menu_color_b BETWEEN 0 AND 255),
            menu_asset_character INTEGER DEFAULT 0 CHECK(menu_asset_character BETWEEN 0 AND 18),
            menu_asset_npc INTERGER DEFAULT 0 CHECK(menu_asset_npc BETWEEN 0 AND 11),
            FOREIGN KEY (menu_user_id) REFERENCES users(id)
        );
    `); //status : 0 = en attente, 1 = accepté
        db.exec (`
        CREATE TABLE IF NOT EXISTS friends (
            frie_id INTEGER PRIMARY KEY AUTOINCREMENT,
            frie_user_id INTEGER NOT NULL,
            frie_friend_user_id INTEGER NOT NULL,
            frie_status INTEGER NOT NULL CHECK(frie_status BETWEEN 0 AND 1),
            FOREIGN KEY (frie_user_id) REFERENCES users(id),
            FOREIGN KEY (frie_friend_user_id) REFERENCES users(id)
        );
    `);
            //status : 0 = non lu, 1 = lu
        db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
            notif_id INTEGER PRIMARY KEY AUTOINCREMENT,
            notif_user_id INTEGER NOT NULL,
            notif_sender_id INTEGER NOT NULL,
            notif_type TEXT NOT NULL CHECK(notif_type IN ('friend_request', 'friend_accept', 'friend_reject')),
            notif_status INTEGER DEFAULT 0 CHECK(notif_status BETWEEN 0 AND 1),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (notif_user_id) REFERENCES users(id),
            FOREIGN KEY (notif_sender_id) REFERENCES users(id)
        );
    `);
    }
    catch (err)
    {
        console.log("Error : database init failed " + err.message);
        //si db pas creer que faire ?
    }
    fastify.decorate("db", db); // Makes db connection accessible throughout application as fastify.db

    fastify.addHook("onClose", (fastify, done) => {
        db.close();
        done();
    });
    console.log("Database and posts table created successfully");
}

export default fp(dbConnector);