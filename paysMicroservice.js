const grpc = require('@grpc/grpc-js'); // Pour gRPC
const protoLoader = require('@grpc/proto-loader'); // Pour charger Protobuf
const mongoose = require('mongoose'); // Pour MongoDB
const Pays = require('./pays'); // Modèle Mongoose pour les pays
const { sendPaysMessage } = require('./PaysProducer'); // Producteur Kafka pour les pays

// Chemin vers le fichier Protobuf des pays
const paysProtoPath = './pays.proto'; 

// Charger le Protobuf
const paysProtoDefinition = protoLoader.loadSync(paysProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger le service Pays du package gRPC
const paysProto = grpc.loadPackageDefinition(paysProtoDefinition).pays;

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/restau_pays') // Connexion à MongoDB
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1); // Quitter si la connexion échoue
  });

// Implémentation du service gRPC pour les pays
const paysService = {
  getPays: async (call, callback) => {
    try {
      const paysId = call.request.pays_id; // Identifier le pays par ID
      const pays = await Pays.findById(paysId); // Trouver le pays par ID

      if (!pays) {
        return callback(new Error("Pays non trouvé")); // Gérer le cas où le pays n'est pas trouvé
      }

      callback(null, { pays }); // Retourner le pays trouvé
    } catch (err) {
      callback(new Error("Erreur lors de la recherche du pays: " + err.message)); // Gérer les erreurs
    }
  },

  searchPays: async (call, callback) => {
    try {
      const pays = await Pays.find(); // Obtenir tous les pays
      callback(null, { pays });
    } catch (err) {
      callback(new Error("Erreur lors de la recherche des pays: " + err.message));
    }
  },

  createPays: async (call, callback) => {
    try {
      const { nom, nbRestau, nomRestau } = call.request; // Données à créer
      const nouveauPays = new Pays({ nom, nbRestau, nomRestau }); // Nouveau pays
      const pays = await nouveauPays.save(); // Sauvegarder le pays

      // Envoyer un événement Kafka pour la création d'un pays
      await sendPaysMessage('creation', pays);

      callback(null, { pays });
    } catch (err) {
      callback(new Error("Erreur lors de la création du pays: " + err.message));
    }
  },

  updatePays: async (call, callback) => {
    try {
      const { pays_id, nom, nbRestau, nomRestau } = call.request;
      const pays = await Pays.findByIdAndUpdate(
        pays_id, // ID du pays à mettre à jour
        { nom, nbRestau, nomRestau }, // Nouvelles données
        { new: true } // Retourner le pays mis à jour
      );

      if (!pays) {
        return callback(new Error("Pays non trouvé"));
      }

      // Envoyer un événement Kafka pour la modification d'un pays
      await sendPaysMessage('modification', pays);

      callback(null, { pays }); // Retourner le pays mis à jour
    } catch (err) {
      callback(new Error("Erreur lors de la mise à jour du pays: " + err.message));
    }
  },

  deletePays: async (call, callback) => {
    try {
      const paysId = call.request.pays_id; // Obtenir l'ID du pays à supprimer
      const pays = await Pays.findByIdAndDelete(paysId); // Supprimer le pays

      if (!pays) {
        return callback(new Error("Pays non trouvé")); // Gérer le cas où le pays n'est pas trouvé
      }

      // Envoyer un événement Kafka pour la suppression d'un pays
      await sendPaysMessage('suppression', pays);

      callback(null, { message: "Pays supprimé avec succès" }); // Confirmation de la suppression
    } catch (err) {
      callback(new Error("Erreur lors de la suppression du pays: " + err.message)); // Gérer les erreurs
    }
  },
};

// Créer le serveur gRPC
const server = new grpc.Server();
server.addService(paysProto.PaysService.service, paysService); // Ajouter le service Pays

server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
  if (err) {
    console.error("Échec de la liaison du serveur:", err);
    return;
  }
  server.start();
  console.log(`Service Pays opérationnel sur le port ${boundPort}`); // Confirmation du démarrage
});
