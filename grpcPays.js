const grpc = require('@grpc/grpc-js'); // Pour gRPC
const protoLoader = require('@grpc/proto-loader'); // Pour charger Protobuf

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

// Adresse du serveur gRPC
const serverAddress = 'localhost:50053';

// Créer un client gRPC
const client = new paysProto.PaysService(serverAddress, grpc.credentials.createInsecure());

// Fonction pour obtenir un pays par ID
function getPaysById(paysId) {
  const request = { pays_id: paysId };

  client.getPays(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la récupération du pays:', error.message);
      return;
    }
    console.log('Pays récupéré avec succès:', response.pays);
  });
}

// Fonction pour créer un nouveau pays
function createPays(nom, nbRestau, nomRestau) {
  const request = { nom, nbRestau, nomRestau };

  client.createPays(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la création du pays:', error.message);
      return;
    }
    console.log('Pays créé avec succès:', response.pays);
  });
}

// Fonction pour supprimer un pays par ID
function deletePaysById(paysId) {
  const request = { pays_id: paysId };

  client.deletePays(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la suppression du pays:', error.message);
      return;
    }
    console.log('Pays supprimé avec succès.');
  });
}

// Fonction pour mettre à jour un pays par ID
function updatePays(paysId, nom, nbRestau, nomRestau) {
  const request = { pays_id: paysId, nom, nbRestau, nomRestau };

  client.updatePays(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la mise à jour du pays:', error.message);
      return;
    }
    console.log('Pays mis à jour avec succès:', response.pays);
  });
}

// Exemple d'utilisation
const paysIdToFetch = '12345';
getPaysById(paysIdToFetch); // Obtenir un pays par ID

const newPaysName = 'tunisie';
const newNbRestau = 100;
const newNomRestau = 'Le Grand Restaurant,chaneb';

// Créer un nouveau pays
createPays(newPaysName, newNbRestau, newNomRestau);

// Mettre à jour un pays par ID
//const paysIdToUpdate = '12345';
//updatePays(paysIdToUpdate, 'Pays Mis à Jour', 120, 'Restaurant Mis à Jour');

// Supprimer un pays par ID
//const paysIdToDelete = '12345';
//deletePaysById(paysIdToDelete);
