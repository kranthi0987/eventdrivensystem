import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schema';
import {jwtConfig, JWTService} from "shared-auth";

const jwtService = new JWTService(jwtConfig);

const app = express();
app.use(express.json());

// Generate a token for the target app
const targetAppToken = jwtService.generateToken({
    service: 'target',
    id: 'target-app'
});

// Middleware to add the JWT token to all requests
app.use((req, res, next) => {
    req.headers.authorization = `Bearer ${targetAppToken}`;
    next();
});

async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            // Verify token for GraphQL requests
            const token = req.headers.authorization?.split(' ')[1] || '';
            try {
                const payload = jwtService.verifyToken(token);
                return { user: payload };
            } catch (err) {
                throw new Error('Invalid or expired token');
            }
        }
    });

    await server.start();

    server.applyMiddleware({ app: app as any });

    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    app.listen(3002, () => {
        console.log('Target app running on port 3002');
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
});