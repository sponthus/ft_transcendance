import speakeasy from "speakeasy";
import qrcode from 'qrcode';
import env from '../../config/env.js';
import { decrypt, encrypt,  } from "./cryptSecret.js";

export async function activateTwoFa(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
	
	console.debug(`Activate 2FA for user ID: ${idUser}`);
    try
    {
         const stmt = db.prepare("  SELECT \
                                        twofa_secret, twofa_enabled \
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(idUser);
        if (stmt.twofa_secret && stmt.twofa_enabled === 1)
            return reply.code(400).send({ message: "2FA setup already activated" });

        const row = db.prepare("    SELECT \
                                        username \
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(idUser);
        const secret = speakeasy.generateSecret(
        {
            name: `Island Word: ${row.username}`,
            issuer: "Transcendance",
            length: 20, // Les standards sont pensés pour 20 bytes minimum.
            symbols: false //plus facile a taper
        });
        const encryptSecret = encrypt(secret.base32);
        db.prepare(    "UPDATE \
                            users \
                        SET \
                            twofa_secret = ? \
                        WHERE \
                            id = ?").run(encryptSecret, idUser);

        const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url) ;
        return reply.code(200).send({ qrCode: qrDataUrl });
    }
    catch (err)
    {   
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}

export async function checkTwoFaCode(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   code = request.body.code;

    try
    {
        const row = db.prepare("    SELECT \
                                        twofa_secret, twofa_enabled \
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(idUser);
        
        if (!row || !row.twofa_secret)
            return reply.code(400).send({ message: "No 2FA setup found" });

        const   secret = decrypt(row.twofa_secret);
        console.log('SSSecret 2fa : ', secret);
        const   codeVerified = speakeasy.totp.verify(
        {
            secret: secret,
            encoding: "base32",
            token: code,
            window: 1
        });
        if (!codeVerified)
            return reply.code(401).send({ message: "Invalid 2FA code" });
       
        let status = "2FA verified"
        if (row.twofa_enabled === 0)
        {
             db.prepare( "  UPDATE \
                                users \
                            SET \
                                twofa_enabled = 1 \
                            WHERE \
                                id = ?").run(idUser);
            status = "2FA enabled";   
        }
        else if (row.twofa_enabled === 1)
        {
            const userInfo = db.prepare("   SELECT \
                                                username, slug \
                                            FROM \
                                                users \
                                            WHERE \
                                                id = ?").get(idUser);
            const token = await reply.jwtSign({ idUser: idUser, username: userInfo.username, slug: userInfo.slug }, {expiresIn: '1h'});
            console.log('Token de la 2fa', token);
            let secure = false;
            if (env.nodeEnv === 'production')
                secure = true;
            return reply.code(200).setCookie('token', token,
                {
                    httpOnly: true, 
                    signed: true,
                    secure: secure, 
                    path: '/', 
                    maxAge: 3600000
                }).send({ status: status});
        }
        return reply.code(200).send({ status: status });
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" + err.message});
    }
}

export async function desactivateTwoFa(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    
    try
    {
        const row = db.prepare("    SELECT \
                                        twofa_secret, twofa_enabled \
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(idUser);
         if (!row || row.twofa_enabled === 0)
            return reply.code(400).send({ message: "2FA is not active" });
        db.prepare("    UPDATE \
                            users \
                        SET \
                            twofa_secret = NULL, \
                            twofa_enabled = 0 \
                        WHERE \
                            id = ?").run(idUser);
        return reply.code(200).send({ status: "2FA deactivated" });
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}

export async function deleteToken (request, reply)
{
    try
    {
        return reply.code(200).clearCookie('token',
        {
            httpOnly: true,
            signed: true,
            secure: false,
            path: '/',
            maxAge: 3600000
        }).send();
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Servor Error" });
    } 
}