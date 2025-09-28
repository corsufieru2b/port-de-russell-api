// routes/reservations.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { create } = require('domain');
const {
    getReservations,
    getReservation,
    createReservation,
    updateReservation,
    deleteReservation
} = require('../controllers/reservation');

const router = express.Router({ mergeParams: true }); // mergeParams pour acceder a catwayId

// Toutes les routes ci-dessous sont protégées
router.use(protect);

// Les routes sont définies comme demandé dans le brief :
// GET /catways/:id/reservations - liste des réservations pour un catway
//GET /catways/:id/reservations/:reservationId - récupére une réservation spécifique
// POST /catways/:id/reservations - crée une nouvelle réservation pour un catway
// PUT /catways/:id/reservations/:reservationId - modidies une réservation
// DELETE /catways/:id/reservations/:reservationId - supprime une réservation

router.route('/')
    .get(getReservations) // liste des réservations pour un catway
    .post(createReservation); // crée une nouvelle réservation pour un catway

router.route('/:reservationId')
    .get(getReservation) // récupére une réservation spécifique
    .put(updateReservation) // modidies une réservation
    .delete(deleteReservation); // supprime une réservation

module.exports = router;