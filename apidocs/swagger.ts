import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Swagger definition
const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Driven System API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Event Driven System including Source App, Bridge Service, and Target App',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Source App Server'
            },
            {
                url: 'http://localhost:3001',
                description: 'Bridge Service Server'
            },
            {
                url: 'http://localhost:3002',
                description: 'Target App Server (GraphQL)'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token required for authentication'
                },
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'API key required for authentication'
                }
            },
            schemas: {
                Event: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Unique identifier of the event'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the event'
                        },
                        body: {
                            type: 'string',
                            description: 'Event body content'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Event creation timestamp'
                        },
                        brand: {
                            type: 'string',
                            description: 'Brand associated with the event'
                        }
                    },
                    required: ['id', 'name', 'body', 'timestamp', 'brand']
                },
                EventInput: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Unique identifier of the event'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the event'
                        },
                        body: {
                            type: 'string',
                            description: 'Event body content'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Event creation timestamp'
                        },
                        brand: {
                            type: 'string',
                            description: 'Brand associated with the event'
                        }
                    },
                    required: ['id', 'name', 'body', 'timestamp', 'brand']
                }
            }
        },
        security: [
            {
                BearerAuth: []
            }
        ]
    },
    apis: ['./src/*.ts'], // Adjust this path to match your project structure
};

// Initialize Swagger docs
const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            authAction: {
                BearerAuth: {
                    name: "Bearer",
                    schema: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    },
                    value: "your-jwt-token-here" // Default JWT token for testing
                }
            }
        }
    }));

    console.log('Swagger Docs available at: http://localhost:3000/api-docs');
};