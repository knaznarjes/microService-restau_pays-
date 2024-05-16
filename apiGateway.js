const express = require('express'); // Framework Express
const bodyParser = require('body-parser'); // Pour traiter le JSON
const cors = require('cors'); // Pour autoriser les requêtes cross-origin

const connectDB = require('./database'); // Connexion à MongoDB
const Pays = require('./pays'); // Modèle pour Pays
const Restau = require('./restau'); // Modèle pour Restau
const { sendPaysMessage } = require('./PaysProducer'); // Producteur Kafka pour les pays
const { sendRestauMessage } = require('./RestauProducer'); // Producteur Kafka pour les restaurants

const app = express(); // Créer l'application Express

// Connexion à MongoDB
connectDB();

app.use(cors()); // Autoriser les requêtes cross-origin
app.use(bodyParser.json()); // Traiter le JSON

// Routes pour les pays
app.get('/pays', async (req, res) => {
  try {
    const pays = await Pays.find(); // Obtenir tous les pays
    res.json(pays);
  } catch (err) {
    res.status(500).send("Erreur lors de la recherche des pays: " + err.message);
  }
});

app.get('/pays/:id', async (req, res) => {
  try {
    const pays = await Pays.findById(req.params.id); // Obtenir le pays par ID
    if (!pays) {
      return res.status(404).send("Pays non trouvé");
    }
    res.json(pays);
  } catch (err) {
    res.status(500).send("Erreur lors de la recherche du pays: " + err.message);
  }
});

app.post('/pays', async (req, res) => {
  try {
    const { nom, nbRestau, nomRestau } = req.body; // Obtenir les données du corps de la requête
    const nouveauPays = new Pays({ nom, nbRestau, nomRestau });
    const pays = await nouveauPays.save(); // Sauvegarder le pays
    // Envoyer un message Kafka pour l'événement de création de pays
    await sendPaysMessage('creation', { id: pays._id, nom, nbRestau, nomRestau });
    res.json(pays); // Retourner le pays créé
  } catch (err) {
    res.status(500).send("Erreur lors de la création du pays: " + err.message);
  }
});

app.delete('/pays/:id', async (req, res) => {
  try {
    const paysId = req.params.id; // ID du pays à supprimer
    const pays = await Pays.findByIdAndDelete(paysId); // Supprimer par ID

    if (!pays) {
      return res.status(404).send("Pays non trouvé");
    }
    // Envoyer un message Kafka pour l'événement de suppression de pays
    await sendPaysMessage('suppression', { id: pays._id });
    res.send("Pays supprimé avec succès");
  } catch (err) {
    res.status(500).send("Erreur lors de la suppression du pays: " + err.message);
  }
});

// Routes pour les restaurants
app.get('/restau', async (req, res) => {
  try {
    const restaus = await Restau.find(); // Obtenir tous les restaurants
    res.json(restaus);
  } catch (err) {
    res.status(500).send("Erreur lors de la recherche des restaurants: " + err.message);
  }
});

app.get('/restau/:id', async (req, res) => {
  try {
    const restau = await Restau.findById(req.params.id); // Obtenir le restaurant par ID
    if (!restau) {
      return res.status(404).send("Restaurant non trouvé");
    }
    res.json(restau);
  } catch (err) {
    res.status(500).send("Erreur lors de la recherche du restaurant: " + err.message);
  }
});

app.post('/restau', async (req, res) => {
  try {
    const { nom, nombre, locale } = req.body; // Obtenir les données de la requête
    const nouveauRestau = new Restau({ nom, nombre, locale });
    const restau = await nouveauRestau.save(); // Sauvegarder le restaurant
    // Envoyer un message Kafka pour la création de restaurant
    await sendRestauMessage('creation', { id: restau._id, nom, nombre, locale });
    res.json(restau); // Retourner le restaurant créé
  } catch (err) {
    res.status(500).send("Erreur lors de la création du restaurant: " + err.message);
  }
});

app.delete('/restau/:id', async (req, res) => {
  try {
    const restauId = req.params.id; // ID du restaurant à supprimer
    const restau = await Restau.findByIdAndDelete(restauId); // Supprimer par ID

    if (!restau) {
      return res.status(404).send("Restaurant non trouvé");
    }
    // Envoyer un message Kafka pour la suppression de restaurant
    await sendRestauMessage('suppression', { id: restau._id });
    res.send("Restaurant supprimé avec succès");
  } catch (err) {
    res.status(500).send("Erreur lors de la suppression du restaurant: " + err.message);
  }
});
app.put('/pays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, nbRestau, nomRestau } = req.body; // Données de mise à jour
    const pays = await Pays.findByIdAndUpdate(
      id,
      { nom, nbRestau, nomRestau },
      { new: true } // Retourner le document mis à jour
    );

    if (!pays) {
      return res.status(404).send("Pays non trouvé");
    }

    // Envoyer un message Kafka pour la mise à jour de pays
    await sendPaysMessage('modification', { id: pays._id, nom, nbRestau, nomRestau });

    res.json(pays); // Retourner le pays mis à jour
  } catch (err) {
    res.status(500).send("Erreur lors de la mise à jour du pays: " + err.message);
  }
});

// Routes pour les restaurants
app.put('/restau/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, nombre, locale } = req.body; // Données de mise à jour
    const restau = await Restau.findByIdAndUpdate(
      id,
      { nom, nombre, locale },
      { new: true } // Retourner le document mis à jour
    );

    if (!restau) {
      return res.status(404).send("Restaurant non trouvé");
    }

    // Envoyer un message Kafka pour la mise à jour de restaurant
    await sendRestauMessage('modification', { id: restau._id, nom, nombre, locale });

    res.json(restau); // Retourner le restaurant mis à jour
  } catch (err) {
    res.status(500).send("Erreur lors de la mise à jour du restaurant: " + err.message);
  }
});

// Démarrer le serveur Express
const port = 3000; // Port par défaut
app.listen(port, () => {
  console.log(`API Gateway opérationnel sur le port ${port}`); // Message de confirmation
});
