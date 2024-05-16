const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type Pays {
    id: String!
    nom: String!
    nbRestau: Int!  # Nombre de restaurants
    nomRestau: String!  # Nom du restaurant principal
  }

  type Restau {
    id: String!
    nom: String!
    nombre: Int!  # Nombre de sièges
    locale: String!  # Localisation du restaurant
  }

  type Query {
    pays(id: String!): Pays  # Obtenir un pays par ID
    paysList: [Pays]  # Obtenir tous les pays
    restau(id: String!): Restau  # Obtenir un restaurant par ID
    restaus: [Restau]  # Obtenir tous les restaurants
  }
  
  type Mutation {
    createPays(nom: String!, nbRestau: Int!, nomRestau: String!): Pays  # Créer un pays
    deletePays(id: String!): String  # Supprimer un pays par ID
    updatePays(id: String!, nom: String!, nbRestau: Int!, nomRestau: String!): Pays  # Mettre à jour un pays
    
    createRestau(nom: String!, nombre: Int!, locale: String!): Restau  # Créer un restaurant
    deleteRestau(id: String!): String  # Supprimer un restaurant par ID
    updateRestau(id: String!, nom: String!, nombre: Int!, locale: String!): Restau  # Mettre à jour un restaurant
  }
`;

module.exports = typeDefs;
