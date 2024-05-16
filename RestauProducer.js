const { Kafka } = require('kafkajs'); // Importez le module Kafka

// Configuration du client Kafka
const kafka = new Kafka({
  clientId: 'restau-producer', // Identifiant du client Kafka pour les restaurants
  brokers: ['localhost:9092'], // Adresse des brokers Kafka
});

const producer = kafka.producer(); // Créez le producteur Kafka

// Fonction pour envoyer des messages Kafka pour les événements liés aux restaurants
const sendRestauMessage = async (eventType, restauData) => {
  try {
    await producer.connect(); // Connectez-vous au broker Kafka
    await producer.send({
      topic: 'restau-events', // Le topic pour les événements des restaurants
      messages: [{ value: JSON.stringify({ eventType, restauData }) }], // Message sous forme de JSON
    });
    console.log('Message Kafka envoyé avec succès pour l\'événement:', eventType);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message Kafka:', error);
  } finally {
    await producer.disconnect(); // Déconnectez-vous du broker Kafka
  }
};

// Exporter la fonction pour envoyer des messages Kafka
module.exports = {
  sendRestauMessage,
};
