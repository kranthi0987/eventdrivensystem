"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CONFIG = {
    PORT: process.env.PORT || 3000,
    API_KEY: process.env.API_KEY || "default-api-key",
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT || "https://example.com/graphql",
    AWS_REGION: process.env.AWS_REGION || "us-east-1",
    SQS_QUEUE_URL: process.env.SQS_QUEUE_URL || "https://example.com/graphql",
    JWT_SECRET: process.env.JWT_SECRET || "1234567890",
};
