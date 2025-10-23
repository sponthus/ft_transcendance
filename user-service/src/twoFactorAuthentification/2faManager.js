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
            length: 20, //TODO ENLEVER COMMMS Les standards TOTP/HOTP sont pensés pour 20 bytes minimum (SHA-1 digest length).
            symbols: false //plus facile a taper
        });
        //stocker la cle encrypte ici, utilise crypto ? TODO PLUS TARD
        console.log('Secret 2fa : ', secret.base32);
        const encryptSecret = encrypt(secret.base32);
        db.prepare(    "UPDATE \
                            users \
                        SET \
                            twofa_secret = ? \
                        WHERE \
                            id = ?").run(encryptSecret, idUser);

        //secret.ascii --> juste des caractères ASCII, peu utilisé pour 2FA.
        //secret.hex --> format hexa
        //secret.base32 --> format standard pour TOTP
        //secret.otpauth_url --> pour generer QR code 
        
        const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url) ;

        //si je veux une saisie manuelle je dois envoyer la cle secret en clair pause un pb de secu*/

        const qrAscii = await qrcode.toString(secret.otpauth_url, {type: 'terminal'}); //temporaire, permet de tester 
        console.log(`QR Ascii generated`);
        //console.debug(qrAscii); //TODO enlever

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

        /*const codeServer = speakeasy.totp({
         secret: row.twofa_secret,
        encoding: "base32"
        });

        console.log("💡 Server code:", codeServer);*/ //voir le code du serveur

        const   secret = decrypt(row.twofa_secret);
        console.log('SSSecret 2fa : ', secret);
        const   codeVerified = speakeasy.totp.verify(
        {
            secret: secret,
            encoding: "base32",
            token: code,
            window: 1 //si il ya de la latence ou un decalage avec l' heure du user c'est 30s + 30s ??
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
            // TODO mettre same site
        }).send();
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Servor Error" });
    } 
}

/* TODO remove ? Change key 
secret contient : 
{
  ascii: 'ABCDEFG...', --> cle TOTP generer differement
  hex: '1f2e3d4c...', --> pareil
  base32: 'JBSWY3DPEHPK3PXP', --> "vraie" cle TOTP
  otpauth_url: 'otpauth://totp/IslandWord:username?secret=JBSWY3DPEHPK3PXP&issuer=Transcendance'
}
*/
