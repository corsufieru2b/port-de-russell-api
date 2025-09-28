// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Port de Russell - Gestion des Catways',
      version: '1.0.0',
      description: 'API privée pour la gestion des réservations de catways du port de plaisance de Russell',
      contact: {
        name: 'Support API',
        email: 'support@port-russell.fr'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur'
            },
            username: {
              type: 'string',
              description: 'Nom d\'utilisateur',
              minLength: 3
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email'
            },
            password: {
              type: 'string',
              description: 'Mot de passe',
              minLength: 6
            }
          }
        },
        Catway: {
          type: 'object',
          required: ['catwayNumber', 'catwayType', 'catwayState'],
          properties: {
            catwayNumber: {
              type: 'string',
              description: 'Numéro unique du catway'
            },
            catwayType: {
              type: 'string',
              enum: ['long', 'short'],
              description: 'Type de catway'
            },
            catwayState: {
              type: 'string',
              description: 'Description de l\'état du catway',
              maxLength: 500
            }
          }
        },
        Reservation: {
          type: 'object',
          required: ['catwayNumber', 'clientName', 'boatName', 'startDate', 'endDate'],
          properties: {
            catwayNumber: {
              type: 'string',
              description: 'Numéro du catway réservé'
            },
            clientName: {
              type: 'string',
              description: 'Nom du client'
            },
            boatName: {
              type: 'string',
              description: 'Nom du bateau'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Date de début de réservation'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Date de fin de réservation'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            data: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                token: { type: 'string' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Message d\'erreur'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Chemin vers les fichiers de routes
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };