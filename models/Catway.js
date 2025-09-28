const { trim } = require('lodash');
const mongoose = require('mongoose');

const CatwaySchema = new mongoose.Schema({
catwayNumber: { 
    type: String, // Ou Number, selon le format dans votre fichier JSON
    required: [true, ' Un numéro de catway est requis'],
    unique: true,
    trim: true
},
catwayType: {
    type: String,
    required: [true, ' Un type de catway est requis'],
    enum: {
        values: ['long', 'short'],
        message: ' Le type de catway doit étre "long" ou "short"'
    }
},
catwayState: {
    type: String,
    required: [true, ' une description de l\'état est requise'],
    trim: true,
    maxlength: [500, ' La description de l\'état ne doit pas dépasser 500 caractères']
}
}, {
    timestamps: true
});

module.exports = mongoose.model('Catway', CatwaySchema);