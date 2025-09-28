import crypto from "crypto"

const   algorithm = "aes-256-ctr";
const   password = "Ceci_est_un_test"; //prendre variavle env
const   IV_LENGTH = 16;


export function encrypt(secret2Fa)
{
    //AES : Advanced Encryption Standard //256: bits(32 otects)
    //ctr: mode de chiffrement qui fonctionne avec un compteur pour chiffrer des flux de données.
    const key = crypto.scryptSync(password, "salt", 32); // clé dérivée de manière sécurisée
    const iv = crypto.randomBytes(IV_LENGTH); // IV unique pour chaque chiffrement

    //cipher == "chiffreur" permet de chiffrer la string
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(secret2Fa, 'utf8', 'hex'); //en 2 fois
    encrypted += cipher.final('hex');
    return (iv.toString("hex") + ":" + encrypted);
}

export function decrypt(encrypted)
{
  const key = crypto.scryptSync(password, "salt", 32);

  const [ivHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

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