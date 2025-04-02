import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {jwtConfig, JWTService} from "shared-auth";
import {Event } from './types'

const jwtService = new JWTService(jwtConfig);
const app = express();
app.use(express.json());

const BRIDGE_SERVICE_URL = 'http://localhost:3001/api/events';
const EVENT_INTERVAL = 300;
const TOTAL_EVENTS = 50;

// Generate a token for the source app
const sourceAppToken = jwtService.generateToken({
    service: 'source',
    id: 'source-app'
});

// Middleware to add the JWT token to all requests
app.use((req, res, next) => {
    req.headers.authorization = `Bearer ${sourceAppToken}`;
    next();
});

export function generateEvent(): Event {
    return {
        id: uuidv4(),
        name: 'test event',
        body: 'test body',
        timestamp: new Date().toISOString()
    };
}

export async function sendEvent(event: Event): Promise<void> {
    console.log(event);
    try {
        const response = await axios.post(BRIDGE_SERVICE_URL, event, {
            timeout: 500,
            headers: {
                'Authorization': `Bearer ${sourceAppToken}`
            }
        });
        console.log(`Event ${event.id} sent successfully. Status: ${response.status}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Failed to send event ${event.id}:`, error.message);
        } else {
            console.error(`Unexpected error sending event ${event.id}:`, error);
        }
    }
}

export function simulateEvents(): void {
    let eventCount = 0;
    const intervalId = setInterval(() => {
        if (eventCount >= TOTAL_EVENTS) {
            clearInterval(intervalId);
            console.log('Finished sending events');
            return;
        }

        const event = generateEvent();
        console.log(`Sending event ${event.id}`);
        sendEvent(event);
        eventCount++;
    }, EVENT_INTERVAL);
}

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

app.listen(3000, () => {
    console.log('Source app running on port 3000');
    simulateEvents();
});