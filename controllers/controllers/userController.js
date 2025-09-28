// controllers/userController.js
const User = require('../models/User');

// Fonction utilitaire pour exclure le password des réponses
const filterUserData = (user) => {
  const { _id, username, email, createdAt, updatedAt } = user;
  return { _id, username, email, createdAt, updatedAt };
};

// @desc    Récupérer tous les utilisateurs (sans les mots de passe)
// @route   GET /api/users
// @access  Privé
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclut le champ 'password'
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des utilisateurs.' });
  }
};

// @desc    Récupérer un utilisateur par son email
// @route   GET /api/users/:email
// @access  Privé
const getUser = async (req, res) => {
  try {
    // 'email' est passé en paramètre d'URL
    const user = await User.findOne({ email: req.params.email }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: `Utilisateur avec l'email ${req.params.email} non trouvé.` });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération de l\'utilisateur.' });
  }
};

// @desc    Créer un nouvel utilisateur (Inscription - Déjà fait dans authController)
//          Cette route peut être utile pour un admin qui crée des comptes.
// @route   POST /api/users
// @access  Privé
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà.' });
    }

    const user = await User.create({ username, email, password });
    // On ne renvoie PAS le mot de passe, même hashé
    const userWithoutPassword = filterUserData(user);

    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la création de l\'utilisateur.' });
  }
};

// @desc    Modifier un utilisateur
// @route   PUT /api/users/:email
// @access  Privé
const updateUser = async (req, res) => {
  try {
    // On ne permet pas la modification de l'email via cette route (clé unique)
    if (req.body.email) {
      delete req.body.email;
    }

    // Si un mot de passe est fourni, il sera hashé par le 'pre-save' hook du modèle
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true, runValidators: true } // 'new: true' retourne le document modifié
    ).select('-password'); // Exclut le password du résultat

    if (!user) {
      return res.status(404).json({ success: false, message: `Utilisateur avec l'email ${req.params.email} non trouvé.` });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour de l\'utilisateur.' });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:email
// @access  Privé
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ success: false, message: `Utilisateur avec l'email ${req.params.email} non trouvé.` });
    }

    // Renvoyer une confirmation sans données sensibles
    res.status(200).json({ success: true, message: `Utilisateur ${user.username} (${req.params.email}) a été supprimé.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la suppression de l\'utilisateur.' });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};