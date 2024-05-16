const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma Mongoose pour le modèle Restau
const restauSchema = new Schema({
  nom: {
    type: String,
    required: true, // Le nom est requis
  },
  nombre: {
    type: Number,
    required: true, // Le nombre de sièges est requis
  },
  locale: {
    type: String,
    required: true, // La localisation est requise
  },
});

// Créer le modèle Mongoose pour les restaurants
const Restau = mongoose.model('Restau', restauSchema); 

// Exporter le modèle pour utilisation dans d'autres parties de l'application
module.exports = Restau;


