const { Kafka } = require('kafkajs'); // Importez le module Kafka

const kafka = new Kafka({
  clientId: 'pays-producer', // Identifiant du client Kafka pour les pays
  brokers: ['localhost:9092'], // Adresse des brokers Kafka
});

const producer = kafka.producer(); // Créez le producteur Kafka

// Fonction pour envoyer un message Kafka pour les événements liés aux pays
const sendPaysMessage = async (eventType, paysData) => {
  try {
    await producer.connect(); // Connectez-vous au broker Kafka
    await producer.send({
      topic: 'pays-events', // Le topic pour les événements de pays
      messages: [{ value: JSON.stringify({ eventType, paysData }) }], // Message sous forme de JSON
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
  sendPaysMessage,
};
