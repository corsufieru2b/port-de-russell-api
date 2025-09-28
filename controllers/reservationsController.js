// controllers/reservationController.js
const Reservation = require('../models/Reservation');
const Catway = require('../models/Catway'); // Nous en aurons besoin pour vérifier l'existence du catway

// @desc    Récupérer toutes les réservations d'un catway
// @route   GET /api/catways/:id/reservations
// @access  Privé
const getReservations = async (req, res) => {
  try {
    // 'id' ici correspond au 'catwayNumber' passé dans l'URL
    const reservations = await Reservation.find({ catwayNumber: req.params.id });
    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des réservations.' });
  }
};

// @desc    Récupérer une réservation spécifique d'un catway
// @route   GET /api/catways/:id/reservations/:idReservation
// @access  Privé
const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.idReservation,
      catwayNumber: req.params.id // Double vérification : la réservation appartient bien au catway demandé
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: `Réservation ${req.params.idReservation} non trouvée pour le catway ${req.params.id}.` });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération de la réservation.' });
  }
};

// @desc    Créer une nouvelle réservation pour un catway
// @route   POST /api/catways/:id/reservations
// @access  Privé
const createReservation = async (req, res) => {
  try {
    // 1. Vérifier que le catway existe
    const catwayExists = await Catway.findOne({ catwayNumber: req.params.id });
    if (!catwayExists) {
      return res.status(404).json({ success: false, message: `Impossible de créer la réservation. Catway numéro ${req.params.id} non trouvé.` });
    }

    // 2. S'assurer que le numéro de catway dans le body correspond à celui dans l'URL
    // Cela évite de créer une réservation pour un catway A en passant par l'URL du catway B
    req.body.catwayNumber = req.params.id;

    // 3. Vérification simple des conflits de dates (amélioration possible)
    // const existingReservation = await Reservation.findOne({
    //   catwayNumber: req.params.id,
    //   $or: [
    //     { startDate: { $lte: new Date(req.body.endDate) }, endDate: { $gte: new Date(req.body.startDate) } }
    //   ]
    // });
    // if (existingReservation) {
    //   return res.status(400).json({ success: false, message: 'Conflit de réservation : ce catway est déjà réservé sur cette période.' });
    // }

    // 4. Créer la réservation
    const reservation = await Reservation.create(req.body);

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la création de la réservation.' });
  }
};

// @desc    Modifier une réservation
// @route   PUT /api/catways/:id/reservations/:idReservation
// @access  Privé
const updateReservation = async (req, res) => {
  try {
    // On empêche la modification du numéro de catway via le body
    if (req.body.catwayNumber) {
      delete req.body.catwayNumber;
    }

    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.idReservation, catwayNumber: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({ success: false, message: `Réservation ${req.params.idReservation} non trouvée pour le catway ${req.params.id}.` });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour de la réservation.' });
  }
};

// @desc    Supprimer une réservation
// @route   DELETE /api/catways/:id/reservations/:idReservation
// @access  Privé
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndDelete({
      _id: req.params.idReservation,
      catwayNumber: req.params.id
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: `Réservation ${req.params.idReservation} non trouvée pour le catway ${req.params.id}.` });
    }

    res.status(200).json({ success: true, message: `Réservation ${req.params.idReservation} a été supprimée.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la suppression de la réservation.' });
  }
};

module.exports = {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation
};