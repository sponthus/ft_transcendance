import crypto from "crypto"

export async function encrypt(secret2Fa)
{
    //AES : Advanced Encryption Standard //256: bits(32 otects)
    //ctr: mode de chiffrement qui fonctionne avec un compteur pour chiffrer des flux de données.
    const algorithm = "aes-256-ctr";
    const password = "Ceci_est_un_test"; //prendre la variable d'env
    const key = crypto.scryptSync(password, "salt", 32); // clé dérivée de manière sécurisée
    const iv = crypto.randomBytes(16); // IV unique pour chaque chiffrement

    //cipher == "chiffreur" permet de chiffrer la string
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const encrypted = Buffer.concat([
    cipher.update(secret2Fa, 'utf8'), //en 2 fois
    cipher.final()
    ]);
}

/*

const encrypted = Buffer.concat([cipher.update(secret2Fa, "utf8"), cipher.final()]);
return { iv: iv.toString("hex"), content: encrypted.toString("hex") };


iv : vecteur d'initialisation est une valeur aléatoire utilisée en cryptographie pour initialiser le processus de chiffrement
-->Il garantit que, même si on chiffre plusieurs fois le même texte clair avec la même clé, le résultat chiffré sera différent à chaque fois.
    Cela évite aux attaquants de repérer des motifs dans les données chiffrées.

--> habituellement transmis en clair

*/