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
        return callback(new Error("Restaurant non trouvé"));
      }

      callback(null, { restau }); // Retourner le restaurant trouvé
    } catch (err) {
      callback(new Error("Erreur lors de la recherche du restaurant: " + err.message));
    }
  },

  searchRestaus: async (call, callback) => {
    try {
      const restaus = await Restau.find(); // Obtenir tous les restaurants
      callback(null, { restaus });
    } catch (err) {
      callback(new Error("Erreur lors de la recherche des restaurants: " + err.message));
    }
  },

  createRestau: async (call, callback) => {
    try {
      const { nom, nombre, locale } = call.request; // Données pour créer un restaurant
      const nouveauRestau = new Restau({ nom, nombre, locale });
      const restau = await nouveauRestau.save(); // Sauvegarder le restaurant

      // Envoyer un événement Kafka pour la création d'un restaurant
      await sendRestauMessage('creation', restau);

      callback(null, { restau }); // Retourner le restaurant créé
    } catch (err) {
      callback(new Error("Erreur lors de la création du restaurant: " + err.message));
    }
  },

  updateRestau: async (call, callback) => {
    try {
      const { restau_id, nom, nombre, locale } = call.request;
      const restau = await Restau.findByIdAndUpdate(
        restau_id,
        { nom, nombre, locale },
        { new: true } // Retourner le restaurant mis à jour
      );

      if (!restau) {
        return callback(new Error("Restaurant non trouvé"));
      }

      // Envoyer un événement Kafka pour la mise à jour d'un restaurant
      await sendRestauMessage('modification', restau);

      callback(null, { restau }); // Retourner le restaurant mis à jour
    } catch (err) {
      callback(new Error("Erreur lors de la mise à jour du restaurant: " + err.message));
    }
  },

  deleteRestau: async (call, callback) => {
    try {
      const restauId = call.request.restau_id; // ID du restaurant à supprimer
      const restau = await Restau.findByIdAndDelete(restauId); // Supprimer par ID

      if (!restau) {
        return callback(new Error("Restaurant non trouvé"));
      }

      // Envoyer un événement Kafka pour la suppression d'un restaurant
      await sendRestauMessage('suppression', restau);

      callback(null, { message: "Restaurant supprimé avec succès" }); // Confirmation de suppression
    } catch (err) {
      callback(new Error("Erreur lors de la suppression du restaurant: " + err.message));
    }
  },
};

// Créer le serveur gRPC
const server = new grpc.Server();
server.addService(restauProto.RestauService.service, restauService); // Ajouter le service Restau

server.bindAsync('0.0.0.0:50054', grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
  if (err) {
    console.error("Échec de la liaison du serveur:", err);
    return;
  }
  server.start();
  console.log(`Service Restau opérationnel sur le port ${boundPort}`); // Confirmation de démarrage
});
