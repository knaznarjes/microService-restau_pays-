const { ApolloError } = require('apollo-server'); // Pour gérer les erreurs Apollo
const Pays = require('./pays'); // Modèle Mongoose pour les pays
const Restau = require('./restau'); // Modèle Mongoose pour les restaurants
const { sendPaysMessage } = require('./PaysProducer'); // Producteur Kafka pour les pays
const { sendRestauMessage } = require('./RestauProducer'); // Producteur Kafka pour les restaurants

// Résolveurs GraphQL avec Kafka
const resolvers = {
  Query: {
    pays: async (_, { id }) => {
      try {
        const pays = await Pays.findById(id); // Trouver le pays par ID
        if (!pays) {
          throw new ApolloError("Pays non trouvé", "NOT_FOUND");
        }
        return pays; // Retourner le pays trouvé
      } catch (error) {
        throw new ApolloError(`Erreur lors de la recherche du pays: ${error.message}`, "INTERNAL_ERROR");
      }
    },

    paysList: async () => {
      try {
        return await Pays.find(); // Obtenir tous les pays
      } catch (error) {
        throw new ApolloError(`Erreur lors de la recherche des pays: ${error.message}`, "INTERNAL_ERROR");
      }
    },

    restau: async (_, { id }) => {
      try {
        const restau = await Restau.findById(id); // Trouver le restaurant par ID
        if (!restau) {
          throw new ApolloError("Restaurant non trouvé", "NOT_FOUND");
        }
        return restau; // Retourner le restaurant trouvé
      } catch (error) {
        throw new ApolloError(`Erreur lors de la recherche du restaurant: ${error.message}`, "INTERNAL_ERROR");
      }
    },

    restaus: async () => {
      try {
        return await Restau.find(); // Obtenir tous les restaurants
      } catch (error) {
        throw new ApolloError(`Erreur lors de la recherche des restaurants: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },

  Mutation: {
    createPays: async (_, { nom, nbRestau, nomRestau }) => {
      try {
        const nouveauPays = new Pays({ nom, nbRestau, nomRestau }); // Créer un nouveau pays
        const pays = await nouveauPays.save();
        await sendPaysMessage('creation', { id: pays._id, nom, nbRestau, nomRestau }); // Kafka
        return pays; // Retourner le pays créé
      } catch (error) {
        throw new ApolloError(`Erreur lors de la création du pays: ${error.message}`, "INTERNAL_ERROR");
      }
    },

    deletePays: async (_, { id }) => {
      try {
        const pays = await Pays.findByIdAndDelete(id); // Supprimer le pays par ID
        if (!pays) {
          throw new ApolloError("Pays non trouvé", "NOT_FOUND");
        }
        await sendPaysMessage('suppression', { id }); // Kafka
        return { message: "Pays supprimé avec succès" }; // Confirmation de suppression
      } catch (error) {
        throw new ApolloError(`Erreur lors de la suppression du pays: ${error.message}`, "INTERNAL_ERROR");
      }
    },

    updatePays: async (_, { id, nom, nbRestau, nomRestau }) => {
      try {
        const pays = await Pays.findByIdAndUpdate(
          id,
          { nom, nbRestau, nomRestau }, // Données de mise à jour
          { new: true } // Retourner le pays mis à jour
        );

        if (!pays) {
          throw new ApolloError("Pays non trouvé", "NOT_FOUND");
        }

        await sendPaysMessage('modification', { id: pays._id, nom, nbRestau, nomRestau }); // Kafka

        return pays; // Retourner le pays mis à jour
      } catch (error) {
        throw new ApolloError(`Erreur lors de la mise à jour du pays: ${error.message}`, "INTERNAL_ERROR");
      }
    },

    createRestau: async (_, { nom, nombre, locale }) => {
      try {
        const nouveauRestau = new Restau({ nom, nombre, locale });
        const restau = await nouveauRestau.save(); // Créer un restaurant
        await sendRestauMessage('creation', { id: restau._id, nom, nombre, locale }); // Kafka
        return restau; // Retourner le restaurant créé
      } catch (error) {
        throw new ApolloError(`Erreur lors de la création du restaurant: ${error.message}`, "INTERNAL_ERROR");
      }
    },

    deleteRestau: async (_, { id }) => {
      try {
        const restau = await Restau.findByIdAndDelete(id); // Supprimer par ID
        if (!restau) {
          throw new ApolloError("Restaurant non trouvé", "NOT_FOUND");
        }
        await sendRestauMessage('suppression', { id }); // Kafka
        return { message: "Restaurant supprimé avec succès" }; // Confirmation de suppression
      } catch (error) {
        throw new ApolloError(`Erreur lors de la suppression du restaurant: ${error.message}`, "INTERNAL_ERROR");
      }
    },

    updateRestau: async (_, { id, nom, nombre, locale }) => {
      try {
        const restau = await Restau.findByIdAndUpdate(
          id,
          { nom, nombre, locale }, // Données de mise à jour
          { new: true } // Retourner le restaurant mis à jour
        );

        if (!restau) {
          throw new ApolloError("Restaurant non trouvé", "NOT_FOUND");
        }

        await sendRestauMessage('modification', { id: restau._id, nom, nombre, locale }); // Kafka

        return restau; // Retourner le restaurant mis à jour
      } catch (error) {
        throw new ApolloError(`Erreur lors de la mise à jour du restaurant: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },
};

module.exports = resolvers; // Exporter les résolveurs GraphQL
