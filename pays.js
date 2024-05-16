
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma Mongoose pour le modèle Pays
const paysSchema = new Schema({
  nom: {
    type: String,
    required: true, // Le nom du pays est requis
  },
  nbRestau: {
    type: Number,
    required: true, // Le nombre de restaurants est requis
  },
  nomRestau: {
    type: String,
    required: true, // Le nom du restaurant principal est requis
  },
});

// Créer le modèle Mongoose pour les pays
const Pays = mongoose.model('Pays', paysSchema);

module.exports = Pays; // Exporter le modèle
