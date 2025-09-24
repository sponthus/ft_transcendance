import speakeasy from "speakeasy";
import qrcode from 'qrcode';
import { checkCodeFormat } from "../tools/checkFormat.js";

export async function activateTwoFa(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
         const stmt = db.prepare("  SELECT \
                                        twofa_secret \
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(idUser);
        console.log('popo :', stmt.twofa_secret);
        if ( stmt.twofa_secret)
            return reply.code(400).send({ error: "2FA setup already activated" });

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
            length: 20, //Les standards TOTP/HOTP sont pensés pour 20 bytes minimum (SHA-1 digest length).
            symbols: false //plus facile a taper
        });
        //stocker la cle encrypte ici, utilise crypto ? PLUS TARD

        db.prepare(    "UPDATE \
                            users \
                        SET \
                            twofa_secret = ? \
                        WHERE \
                            id = ?").run(secret.base32, idUser);

        //secret.ascii --> juste des caractères ASCII, peu utilisé pour 2FA.
        //secret.hex --> format hexa
        //secret.base32 --> format standard pour TOTP
        //secret.otpauth_url --> pour generer QR code 
        
        const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

        //si je veux une saisie manuelle je dois envoyer la cle secret en clair pause un pb de secu*/

        const qrAscii = await qrcode.toString(secret.otpauth_url, {type: 'terminal'}); //temporaire, permet de tester 
        console.log(qrAscii);

        return reply.code(200).send({ qrCode: qrDataUrl });
    }
    catch (err)
    {   
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}

export async function checkTwoFaCode(request, reply)
{
    if (checkCodeFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for 2FA code "} );

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
        //decrypter cle secret 2fa
        if (!row || !row.twofa_secret)
            return reply.code(400).send({ error: "No 2FA setup found" });

        /*const codeServer = speakeasy.totp({
         secret: row.twofa_secret,
        encoding: "base32"
        });

        console.log("💡 Code serveur:", codeServer);*/ //voir le code du serveur

    
        const   codeVerified = speakeasy.totp.verify(
        {
            secret: row.twofa_secret,
            encoding: "base32",
            token: code,
            window: 1 //si il ya de la latence ou un decalage avec l' heure du user c'est 30s + 30s ??
        });
        if (!codeVerified)
            return reply.code(401).send({ error: "Invalid 2FA code" });
       
        if (row.twofa_enabled === 0)
        {
             db.prepare( "  UPDATE \
                                users \
                            SET \
                                twofa_enabled = 1 \
                            WHERE \
                                id = ?").run(idUser);
        }
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}
//validate2Fa
//--> passer 2fa_activated a 1;