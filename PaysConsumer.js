const { Kafka } = require('kafkajs'); // Importer le module Kafka

// Configuration du client Kafka
const kafka = new Kafka({
  clientId: 'pays-consumer', // Identifiant du client Kafka pour les pays
  brokers: ['localhost:9092'], // Liste des brokers Kafka
});

// Création du consommateur Kafka
const consumer = kafka.consumer({ groupId: 'pays-group' }); // Groupe de consommateurs pour les pays

// Fonction pour exécuter le consommateur Kafka
const run = async () => {
  try {
    await consumer.connect(); // Connexion au broker Kafka
    await consumer.subscribe({ topic: 'pays-events', fromBeginning: true }); // S'abonner au topic des événements de pays
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString()); // Convertir le message en JSON
        console.log('Received pays event:', event); // Afficher le message reçu

        // Traiter l'événement de pays en fonction du type d'événement
        switch (event.eventType) {
          case 'creation':
            handlePaysCreation(event.paysData); // Gérer la création de pays
            break;
          case 'modification':
            handlePaysModification(event.paysData); // Gérer la modification de pays
            break;
          case 'suppression':
            handlePaysSuppression(event.paysData); // Gérer la suppression de pays
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

// Logique pour gérer la création de pays
const handlePaysCreation = (paysData) => {
  console.log('Handling pays creation event:', paysData);
  // Ajoutez votre logique pour gérer la création de pays ici
};

// Logique pour gérer la modification de pays
const handlePaysModification = (paysData) => {
  console.log('Handling pays modification event:', paysData);
  // Ajoutez votre logique pour gérer la modification de pays ici
};

// Logique pour gérer la suppression de pays
const handlePaysSuppression = (paysData) => {
  console.log('Handling pays suppression event:', paysData);
  // Ajoutez votre logique pour gérer la suppression de pays ici
};

// Exécuter le consommateur Kafka
run().catch(console.error); // Gérer les erreurs globales
