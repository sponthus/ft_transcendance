import speakeasy from "speakeasy";
import qrcode from 'qrcode';

export async function activateTwoFa(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    console.log("ici activer 2FA");
    try
    {
        const row = db.prepare("  SELECT \
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

export async function validate2FaTwoFa(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    if (checkCodeFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for 2FA code "} );

}
//validate2Fa
//--> passer 2fa_activated a 1;