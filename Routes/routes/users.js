// routes/users.js
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Toutes les routes ci-dessous sont protégées
router.use(protect);

// On aligne les routes sur les exigences du brief :
// GET /users/          -> Liste tous les utilisateurs
// GET /users/:email    -> Récupère un utilisateur par son email
// POST /users/         -> Crée un nouvel utilisateur (version "admin")
// PUT /users/:email    -> Modifie un utilisateur
// DELETE /users/:email -> Supprime un utilisateur

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:email')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;