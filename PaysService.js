const grpc = require('@grpc/grpc-js'); // Pour gRPC
const protoLoader = require('@grpc/proto-loader'); // Pour charger Protobuf
const mongoose = require('mongoose'); // Pour MongoDB
const Restau = require('./restau'); // Modèle Mongoose pour les restaurants
const { sendRestauMessage } = require('./RestauProducer'); // Producteur Kafka pour les restaurants

// Chemin vers le fichier Protobuf des restaurants
const restauProtoPath = './restau.proto'; 

// Charger le Protobuf
const restauProtoDefinition = protoLoader.loadSync(restauProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger le service Restau du package gRPC
const restauProto = grpc.loadPackageDefinition(restauProtoDefinition).restau;

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/restau_pays') // Connexion à MongoDB
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1); // Quitter si la connexion échoue
  });

// Implémentation du service gRPC pour les restaurants
const restauService = {
  getRestau: async (call, callback) => {
    try {
      const restauId = call.request.restau_id; // Identifier le restaurant par ID
      const restau = await Restau.findById(restauId); // Trouver le restaurant par ID

      if (!restau) {
        return callback(new Error("Restaurant non trouvé")); // Gérer le cas où le restaurant n'est pas trouvé
      }

      callback(null, { restau }); // Retourner le restaurant trouvé
    } catch (err) {
      callback(new Error("Erreur lors de la recherche du restaurant: " + err.message)); // Gérer les erreurs
    }
  },

  searchRestaus: async (call, callback) => {
    try {
      const restaus = await Restau.find(); // Obtenir tous les restaurants
      callback(null, { restaus }); // Retourner la liste des restaurants
    } catch (err) {
      callback(new Error("Erreur lors de la recherche des restaurants: " + err.message)); // Gérer les erreurs
    }
  },

  createRestau: async (call, callback) => {
    try {
      const { nom, nombre, locale } = call.request; // Obtenir les données pour créer un restaurant
      const nouveauRestau = new Restau({ nom, nombre, locale });
      const restau = await nouveauRestau.save(); // Créer le restaurant

      // Envoyer un événement Kafka pour la création d'un restaurant
      await sendRestauMessage('creation', restau);

      callback(null, { restau }); // Retourner le restaurant créé
    } catch (err) {
      callback(new Error("Erreur lors de la création du restaurant: " + err.message)); // Gérer les erreurs
    }
  },

  updateRestau: async (call, callback) => {
    try {
      const { restau_id, nom, nombre, locale } = call.request;
      const restau = await Restau.findByIdAndUpdate(
        restau_id, // ID du restaurant à mettre à jour
        { nom, nombre, locale }, // Nouvelles données
        { new: true } // Retourner le restaurant mis à jour
      );

      if (!restau) {
        return callback(new Error("Restaurant non trouvé"));
      }

      // Envoyer un événement Kafka pour la modification d'un restaurant
      await sendRestauMessage('modification', restau);

      callback(null, { restau }); // Retourner le restaurant mis à jour
    } catch (err) {
      callback(new Error("Erreur lors de la mise à jour du restaurant: " + err.message)); // Gérer les erreurs
    }
  },

  deleteRestau: async (call, callback) => {
    try {
      const restauId = call.request.restau_id; // ID du restaurant à supprimer
      const restau = await Restau.findByIdAndDelete(restauId); // Supprimer par ID

      if (!restau) {
        return callback(new Error("Restaurant non trouvé")); // Gérer le cas où le restaurant n'est pas trouvé
      }

      // Envoyer un événement Kafka pour la suppression d'un restaurant
      await sendRestauMessage('suppression', restau);

      callback(null, { message: "Restaurant supprimé avec succès" }); // Confirmation de la suppression
    } catch (err) {
      callback(new Error("Erreur lors de la suppression du restaurant: " + err.message)); // Gérer les erreurs
    }
  },
};

// Créer le serveur gRPC
const server = new grpc.Server(); // Créer un serveur gRPC
server.addService(restauProto.RestauService.service, restauService); // Ajouter le service Restau

server.bindAsync('0.0.0.0:50054', grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
  if (err) {
    console.error("Échec de la liaison du serveur:", err);
    return;
  }
  server.start();
  console.log(`Service Restau opérationnel sur le port ${boundPort}`); // Confirmation du démarrage
});
