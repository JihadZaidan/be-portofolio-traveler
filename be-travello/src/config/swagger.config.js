const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TRAVELLO API Documentation',
      version: '1.0.0',
      description: 'API documentation for TRAVELLO - Travel and Copywriter Services Platform',
      contact: {
        name: 'TRAVELLO Support',
        email: 'support@travello.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:55435',
        description: 'Development server'
      },
      {
        url: 'https://api.travello.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'username'],
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            googleId: {
              type: 'string',
              description: 'Google OAuth ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            username: {
              type: 'string',
              description: 'Unique username'
            },
            displayName: {
              type: 'string',
              description: 'Display name'
            },
            profilePicture: {
              type: 'string',
              description: 'Profile picture URL'
            },
            provider: {
              type: 'string',
              enum: ['local', 'google', 'facebook'],
              description: 'Authentication provider'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            },
            address_city: {
              type: 'string',
              description: 'City of residence'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            }
          }
        },
        Experience: {
          type: 'object',
          required: ['title', 'description', 'price'],
          properties: {
            id: {
              type: 'string',
              description: 'Experience unique identifier'
            },
            title: {
              type: 'string',
              description: 'Experience title'
            },
            description: {
              type: 'string',
              description: 'Experience description'
            },
            price: {
              type: 'number',
              description: 'Experience price'
            },
            location: {
              type: 'string',
              description: 'Experience location'
            },
            duration: {
              type: 'string',
              description: 'Experience duration'
            },
            category: {
              type: 'string',
              description: 'Experience category'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Experience image URLs'
            }
          }
        },
        Transaction: {
          type: 'object',
          required: ['userId', 'type', 'amount'],
          properties: {
            id: {
              type: 'string',
              description: 'Transaction unique identifier'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            type: {
              type: 'string',
              enum: ['experience', 'copywriter', 'shop'],
              description: 'Transaction type'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount'
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'cancelled'],
              description: 'Transaction status'
            },
            paymentMethod: {
              type: 'string',
              description: 'Payment method'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction creation date'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        }
      }
    }
  },
  apis: [
    './src/controllers/*.js',
    './src/routes/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
