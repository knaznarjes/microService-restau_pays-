const { Kafka } = require('kafkajs'); // Importer le module Kafka

// Configuration du client Kafka
const kafka = new Kafka({
  clientId: 'restau-consumer', // Identifiant du client Kafka pour les restaurants
  brokers: ['localhost:9092'], // Liste des brokers Kafka
});

// Création du consommateur Kafka
const consumer = kafka.consumer({ groupId: 'restau-group' }); // Groupe de consommateurs pour les restaurants

// Fonction pour exécuter le consommateur Kafka
const run = async () => {
  try {
    await consumer.connect(); // Connexion au broker Kafka
    await consumer.subscribe({ topic: 'restau-events', fromBeginning: true }); // S'abonner au topic des événements de restaurants
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString()); // Convertir le message en JSON
        console.log('Received restau event:', event); // Afficher le message reçu

        // Traiter l'événement de restaurant en fonction du type d'événement
        switch (event.eventType) {
          case 'creation':
            handleRestauCreation(event.restauData); // Gérer la création de restaurant
            break;
          case 'modification':
            handleRestauModification(event.restauData); // Gérer la modification de restaurant
            break;
          case 'suppression':
            handleRestauSuppression(event.restauData); // Gérer la suppression de restaurant
            break;
          default:
            console.warn('Event type not recognized:', event.eventType); // Avertir en cas de type inconnu
        }
      },
    });
  } catch (error) {
    console.error('Error with Kafka consumer:', error); // Gérer les erreurs
  }
};

// Logique pour gérer la création de restaurant
const handleRestauCreation = (restauData) => {
  console.log('Handling restau creation event:', restauData);
  // Ajoutez votre logique pour gérer la création de restaurant ici
};

// Logique pour gérer la modification de restaurant
const handleRestauModification = (restauData) => {
  console.log('Handling restau modification event:', restauData);
  // Ajoutez votre logique pour gérer la modification de restaurant ici
};

// Logique pour gérer la suppression de restaurant
const handleRestauSuppression = (restauData) => {
  console.log('Handling restau suppression event:', restauData);
  // Ajoutez votre logique pour gérer la suppression de restaurant ici
};

// Exécuter le consommateur Kafka
run().catch(console.error); // Gérer les erreurs globales
