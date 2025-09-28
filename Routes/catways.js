// routes/catways.js
const express = require('express');
const { protect } = require('../middleware/auth'); // Import the protect middleware
const {
    getCatways,
    createCatway,
    createCatway,
    updateCatway,
    deleteCatway
} = require('../controllers/catwayController');

const router = express.Router();

// Toutes les routes ci-dessous sont protégées par le middleware 'protect'
router.use(protect);

// On aligne les routes sur les exigences du brief :
// GET /catways - liste tous les catways
// GET /catways/:id - récupère un catway par son ID
// POST /catways - crée un nouveau catway
// PUT /catways/:id - Modifie l'état d'un catway
// DELETE /catways/:id - Supprime un catway

router.route('/')
    .get(getCatways)
    .post(createCatway);

router.route('/:id')
.get (getCatway)
.put(updateCatway)
.delete(deleteCatway);

module.exports = router;