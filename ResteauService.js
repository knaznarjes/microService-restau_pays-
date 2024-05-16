const Restau = require('./restau'); // Modèle Mongoose pour les restaurants
const { sendRestauMessage } = require('./RestauProducer'); // Producteur Kafka pour les restaurants

// Créer un nouveau restaurant
const createRestau = async (nom, nombre, locale) => {
  const nouveauRestau = new Restau({ nom, nombre, locale });
  const restau = await nouveauRestau.save(); // Sauvegarder le restaurant

  // Envoyer un message Kafka pour la création du restaurant
  await sendRestauMessage('creation', { id: restau._id, nom, nombre, locale });

  return restau; // Retourner le restaurant créé
};

// Obtenir tous les restaurants
const getRestaus = async () => {
  return await Restau.find(); // Obtenir tous les restaurants
};

// Obtenir un restaurant par ID
const getRestauById = async (id) => {
  const restau = await Restau.findById(id); // Trouver un restaurant par son ID
  if (!restau) {
    throw new Error("Restaurant non trouvé"); // Si le restaurant n'existe pas
  }
  return restau; // Retourner le restaurant trouvé
};

// Supprimer un restaurant par ID
const deleteRestau = async (restauId) => {
  const restau = await Restau.findByIdAndDelete(restauId); // Supprimer un restaurant par ID
  if (!restau) {
    throw new Error("Restaurant non trouvé"); // Si le restaurant n'existe pas
  }

  // Envoyer un message Kafka pour la suppression d'un restaurant
  await sendRestauMessage('suppression', { id: restauId });

  return restau; // Retourner le restaurant supprimé
};

// Exporter les services
module.exports = {
  createRestau,
  getRestaus,
  getRestauById,
  deleteRestau,
};
