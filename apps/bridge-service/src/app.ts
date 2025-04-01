import express from 'express';
import eventQueue from './event-queue';
import { SourceEvent } from './types';
import { JWTService, jwtConfig } from 'shared-auth';

const jwtService = new JWTService(jwtConfig);

// Authentication middleware
function authenticateJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Authorization header missing');
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwtService.verifyToken(token);
        if (payload.service !== 'source') {
            return res.status(403).send('Invalid service token');
        }
        next();
    } catch (err) {
        return res.status(401).send('Invalid or expired token'+err);
    }
}

const app = express();
app.use(express.json());

// Apply JWT authentication to all routes except health check
app.use((req, res, next) => {
    if (req.path === '/health') {
        return next();
    }
    authenticateJWT(req, res, next);
});

app.post('/api/events', (req, res) => {
    const event = req.body as SourceEvent;

    if (!event.id || !event.name || !event.body || !event.timestamp) {
        return res.status(400).send('Invalid event format');
    }

    eventQueue.add(event)
        .then(() => {
            res.status(202).send('Event accepted for processing');
        })
        .catch((err: Error) => {
            console.error('Error adding to queue:', err.message);
            res.status(500).send('Internal server error');
        });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(3001, () => {
    console.log('Bridge service running on port 3001');
});