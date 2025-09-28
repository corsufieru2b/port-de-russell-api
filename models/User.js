const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { lowerCase } = require('lodash');
const { match } = require('assert');

const userSchema = new mongoose.Schema({
 username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true, // supprime les espaces en debut et fin de chaine
        minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowerCase: true, // stocke l'email en minuscule
        match: [/\S+@\S+\.\S+/, 'Veuillez entrer une adresse email valide'], // Validation basique d'email
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],}

}, { timestamps: true }); // Ajoute automatiquement createdAt et updatedAt});

//Middleware ("pre-save hook") qui hash le mot de passse AVANT de sauvegarder l'utilisateur
userSchema.pre('save', async function(next) { // Si le mot de passe n'a pas été modifié, on passe à la suite
    if (!this.isModified('password')) return next();
});

// méthode pour comparer le mot de passe entré avec le hash stocké en base
// Sera utilisée dans le controleur de login 
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);