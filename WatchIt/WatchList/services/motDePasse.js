const crypto = require("crypto");

// scrypt est intégré à Node, pas besoin d'installer bcrypt

function hacherMotDePasse(motDePasse) {
    const sel = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(motDePasse, sel, 64).toString("hex");
    return `${sel}:${hash}`;
}

// À utiliser pour la connexion : renvoie true si le mot de passe correspond
function verifierMotDePasse(motDePasse, stocke) {
    const [sel, hash] = stocke.split(":");
    const essai = crypto.scryptSync(motDePasse, sel, 64);
    return crypto.timingSafeEqual(essai, Buffer.from(hash, "hex"));
}

module.exports = { hacherMotDePasse, verifierMotDePasse };
