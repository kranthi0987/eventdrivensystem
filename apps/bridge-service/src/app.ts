import express from 'express';
import cors from 'cors';
import eventQueue from './event-queue';
import { SourceEvent } from './types';
import { JWTService, jwtConfig } from 'shared-auth';

const jwtService = new JWTService(jwtConfig);

// Authentication middleware
function authenticateJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.error('Authentication failed: Missing authorization header');
        return res.status(401).send('Authorization header missing');
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwtService.verifyToken(token);
        if (payload.service !== 'source') {
            console.error(`Authentication failed: Invalid service token. Expected 'source', got '${payload.service}'`);
            return res.status(403).send('Invalid service token');
        }
        console.log(`Authentication successful for service: ${payload.service}, id: ${payload.id}`);
        next();
    } catch (err) {
        console.error('Authentication failed: Invalid or expired token', err);
        return res.status(401).send('Invalid or expired token');
    }
}

const app = express();

// Configure CORS to allow requests from the event-monitor app
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Apply JWT authentication to all routes except health check
app.use((req, res, next) => {
    if (req.path === '/health') {
        return next();
    }
    authenticateJWT(req, res, next);
});

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     description: Accepts an event and queues it for processing
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       202:
 *         description: Event accepted for processing
 *       400:
 *         description: Invalid event format
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - Invalid service token
 *       500:
 *         description: Internal server error
 */
app.post('/api/events', (req, res) => {
    const event = req.body as SourceEvent;

    if (!event.id || !event.name || !event.body || !event.timestamp) {
        console.error('Invalid event format received:', event);
        return res.status(400).send('Invalid event format');
    }

    console.log(`Received event: ${event.id}, name: ${event.name}, timestamp: ${event.timestamp}`);
    
    eventQueue.add(event)
        .then(() => {
            console.log(`Event ${event.id} successfully queued for processing`);
            res.status(202).send({
                message: 'Event accepted for processing',
                eventId: event.id,
                timestamp: new Date().toISOString()
            });
        })
        .catch((err: Error) => {
            console.error(`Error adding event ${event.id} to queue:`, err.message);
            res.status(500).send({
                message: 'Internal server error',
                error: err.message,
                eventId: event.id,
                timestamp: new Date().toISOString()
            });
        });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns OK if the service is running
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(3001, () => {
    console.log('Bridge service running on port 3001');
});
export default app;