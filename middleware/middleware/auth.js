//middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

//Middleware pour protéger les routes et vérifier le token JWT
const auth = async (req, res, next) => {
    try {
        // 1. Récupérer les token du header "authorization" de la requête
        const token = req.header('Authorization').replace('Bearer ', '');

        // 2. si le token n'existe pas, renvoyer une erreur
        if (!token) {
            return res.status(401).json({ message: 'Accès refusé. Pas de token fourni.' });
        }

        // 3. vérifier la validité du token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Chercher l'utilisateur dans la base de données grâce à l'ID décodé dans le token
        const user = await user.findById(decoded.id).select('-password'); // Exclure le mot de passe pour des raisons de sécurité

        // 5. si l'utilisateur n'existe pas, le token est invalide
        if (!user) {
            return res.status(401).json({ message: 'Token invalide.' });
        }

        // 6. si tout est bon, on ajoute les informations de l'utilisateur à l'objet req
          // pour que les controllers suivants puissent y accéder
        req.user = user;

        // 7. passer au prochain middleware ou controller
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token invalide.' });
    }
};

module.exports = auth;