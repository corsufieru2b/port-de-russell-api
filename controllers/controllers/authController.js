//controlers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc  Connecter un utilisateur et obtenir un token
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
    try {
         const { email, password } = req.body;

         // 1. vérifier que l'email et le mot de passe sont fournis
            if (!email || !password) {
                return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe' });
            }

            // 2. Recherche de l'utilisateur par son email (+ on sélectionne le mot de passe qui est normalement exclu par défaut)
            const user = await User.findOne({ email }).select('+password');

            // 3. vérification si l'utilisateur existe ET si le mot de passe est correspond
            if (!user || !(await user.correctPassword(password, user.password))) {
                // messsage volontairement flou pour ne pas indiquer si l'email existe ou pas
                return res.status(401).json({ message: 'Identifiants incorrects' });
            }

            //4. Si les identifiants sont bons, générer un token JWT
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' }); // le token expire dans 24h

            // 5. renvoyer une réponse de succès avec le token et les infos utilisateur (sans le mot de passe)
            res.status(200).json({
                message: 'connexion réussie !',
                token, // A stocker côté client (frontend)
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                }
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
    }
};

// @desc  Déconnecter un utilisateur (côté client, il suffit de supprimer le token)
// @route POST /api/auth/logout
// @access Privé (mais la logique est surtout côté client)
const logout = (req, res) => {
    // comme JWT est 'stateless', la déconnexion se fait côté client en supprimant le token
    // cette route peut être utilisée pour logger la déconnexion côté serveur si besoin
    res.status(200).json({ message: 'Déconnexion réussie.' });
};

module.exports = {
    login,
    logout
};