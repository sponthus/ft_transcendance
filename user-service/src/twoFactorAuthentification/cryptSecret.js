import crypto from "crypto"
import { getSecret } from "../index.js";

const   algorithm = "aes-256-ctr";
const   key = getSecret('auth_key');
const   IV_LENGTH = 16;


export function encrypt(secret2Fa)
{
    //AES : Advanced Encryption Standard //256: bits(32 otects)
    //ctr: mode de chiffrement qui fonctionne avec un compteur pour chiffrer des flux de données.
    const derivedKey = crypto.scryptSync(key, "salt", 32); // clé dérivée de manière sécurisée
    const iv = crypto.randomBytes(IV_LENGTH); // IV unique pour chaque chiffrement

    //cipher == "chiffreur" permet de chiffrer la string
    const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);

    let encrypted = cipher.update(secret2Fa, 'utf8', 'hex'); //en 2 fois
    encrypted += cipher.final('hex');
    return (iv.toString("hex") + ":" + encrypted);
}

export function decrypt(encrypted)
{
  const derivedKey = crypto.scryptSync(key, "salt", 32);

  const [ivHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return (decrypted);
}

/*


iv : vecteur d'initialisation est une valeur aléatoire utilisée en cryptographie pour initialiser le processus de chiffrement
-->Il garantit que, même si on chiffre plusieurs fois le même texte clair avec la même clé, le résultat chiffré sera différent à chaque fois.
    Cela évite aux attaquants de repérer des motifs dans les données chiffrées.

--> habituellement transmis en clair

on obtient : <iv>

*/