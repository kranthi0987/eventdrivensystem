"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
var swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
var swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Swagger definition
var swaggerOptions = {
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
var swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
var setupSwagger = function (app) {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
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
exports.setupSwagger = setupSwagger;
