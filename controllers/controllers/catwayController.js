// controllers/catwayController.js
const Catway = require('../models/Catway');

// @desc    Récupérer tous les catways
// @route   GET /api/catways
// @access  Privé
const getCatways = async (req, res) => {
  try {
    const catways = await Catway.find();
    res.status(200).json({ success: true, count: catways.length, data: catways });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des catways.' });
  }
};

// @desc    Récupérer un catway par son numéro
// @route   GET /api/catways/:id
// @access  Privé
const getCatway = async (req, res) => {
  try {
    // 'id' ici correspond au 'catwayNumber' dans le modèle
    const catway = await Catway.findOne({ catwayNumber: req.params.id });

    if (!catway) {
      return res.status(404).json({ success: false, message: `Catway numéro ${req.params.id} non trouvé.` });
    }

    res.status(200).json({ success: true, data: catway });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération du catway.' });
  }
};

// @desc    Créer un nouveau catway
// @route   POST /api/catways
// @access  Privé
const createCatway = async (req, res) => {
  try {
    const catway = await Catway.create(req.body);
    res.status(201).json({ success: true, data: catway });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) { // Code d'erreur MongoDB pour duplication unique
      return res.status(400).json({ success: false, message: `Un catway avec le numéro ${req.body.catwayNumber} existe déjà.` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la création du catway.' });
  }
};

// @desc    Modifier l'état d'un catway
// @route   PUT /api/catways/:id
// @access  Privé
const updateCatway = async (req, res) => {
  try {
    // On ne permet que la modification de 'catwayState'. On ignore toute autre tentative de modification.
    const { catwayState } = req.body;

    const catway = await Catway.findOneAndUpdate(
      { catwayNumber: req.params.id },
      { catwayState },
      { new: true, runValidators: true } // 'new: true' retourne le document modifié
    );

    if (!catway) {
      return res.status(404).json({ success: false, message: `Catway numéro ${req.params.id} non trouvé.` });
    }

    res.status(200).json({ success: true, data: catway });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour du catway.' });
  }
};

// @desc    Supprimer un catway
// @route   DELETE /api/catways/:id
// @access  Privé
const deleteCatway = async (req, res) => {
  try {
    const catway = await Catway.findOneAndDelete({ catwayNumber: req.params.id });

    if (!catway) {
      return res.status(404).json({ success: false, message: `Catway numéro ${req.params.id} non trouvé.` });
    }

    res.status(200).json({ success: true, message: `Catway numéro ${req.params.id} a été supprimé.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la suppression du catway.' });
  }
};

module.exports = {
  getCatways,
  getCatway,
  createCatway,
  updateCatway,
  deleteCatway
};