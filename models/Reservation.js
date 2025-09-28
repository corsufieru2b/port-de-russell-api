const mongoose = require ('mongoose');
const { start } = require('repl');

const reservationSchema = new mongoose.Schema({
    catwatNumber: {
        type: String, // Doit correspondre au type de catwayNumber dans Catway.js
        required : [true, 'Le numéro de catway réservé est requis'],
        //Ici on pourrait imaginer une référence au modèle catway pour valider son existence
        //ref: 'Catway'(Nous pourrons l'implenter plus tard pour plus de robustesse)
    },
    clientName: {
        type: String,
        required: [true, 'Le nom du client est requis'],
        trim: true,
    },
    boatName: {
        type: String,
        required: [true, 'Le nom du bateau est requis'],
        trim: true,
    },
    startDate: {
        type: Date,
        required: [true, 'La date de début de la réservation est requise'],
        validate: {
            // Validation personnalisée startDate doit être avant endDate
            validator: function(value) {
                // this permet d'accéder au document en cours de création
                return !this.endDate || value < this.endDate;
            },
            message: 'La date de début doit être antérieure à la date de fin'
        }
    },
    endDate: {
        type: Date,
        required: [true, 'La date de fin est requise'],
    }
}, {
    timestamps: true
});

//index pour potentiellement améliorer les performances sur les recherches de réservations
reservationSchema.index({ catwatNumber: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);