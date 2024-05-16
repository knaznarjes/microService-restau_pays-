const grpc = require('@grpc/grpc-js'); // Pour gRPC
const protoLoader = require('@grpc/proto-loader'); // Pour charger Protobuf

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

// Adresse du serveur gRPC
const serverAddress = 'localhost:50054';

// Créer un client gRPC
const client = new restauProto.RestauService(serverAddress, grpc.credentials.createInsecure());

// Fonction pour obtenir un restaurant par ID
function getRestauById(restauId) {
  const request = { restau_id: restauId };

  client.getRestau(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la récupération du restaurant:', error.message);
      return;
    }
    console.log('Restaurant récupéré avec succès:', response.restau);
  });
}

// Fonction pour créer un nouveau restaurant
function createRestau(nom, nombre, locale) {
  const request = { nom, nombre, locale };

  client.createRestau(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la création du restaurant:', error.message);
      return;
    }
    console.log('Restaurant créé avec succès:', response.restau);
  });
}

// Fonction pour supprimer un restaurant par ID
function deleteRestauById(restauId) {
  const request = { restau_id: restauId };

  client.deleteRestau(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la suppression du restaurant:', error.message);
      return;
    }
    console.log('Restaurant supprimé avec succès.');
  });
}

// Fonction pour mettre à jour un restaurant par ID
function updateRestau(restauId, nom, nombre, locale) {
  const request = { restau_id: restauId, nom, nombre, locale };

  client.updateRestau(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la mise à jour du restaurant:', error.message);
      return;
    }
    console.log('Restaurant mis à jour avec succès:', response.restau);
  });
}

// Exemple d'utilisation
const restauIdToFetch = '12345';
getRestauById(restauIdToFetch); // Obtenir un restaurant par ID

const newRestauName = 'Nouveau Restaurant';
const newSeats = 50;
const newLocale = 'Paris';

// Créer un nouveau restaurant
createRestau(newRestauName, newSeats, newLocale);

// Mettre à jour un restaurant par ID
//const restauIdToUpdate = '12345';
//updateRestau(restauIdToUpdate, 'Restaurant Mis à Jour', 60, 'Lyon');

// Supprimer un restaurant par ID
//const restauIdToDelete = '12345';
//deleteRestauById(restauIdToDelete);
