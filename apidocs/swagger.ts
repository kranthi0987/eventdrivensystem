import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Swagger definition
const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Driven API',
            version: '1.0.0',
            description: 'API documentation for the Event Driven System',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Development Server'
            }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'API key required for authentication'
                }
            }
        },
        security: [
            {
                ApiKeyAuth: []
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
                ApiKeyAuth: {
                    name: "x-api-key",
                    schema: {
                        type: "apiKey",
                        in: "header",
                        name: "x-api-key",
                    },
                    value: "your-api-key-here" // Default API key for testing
                }
            }
        }
    }));

    console.log('Swagger Docs available at: http://localhost:3000/api-docs');
};