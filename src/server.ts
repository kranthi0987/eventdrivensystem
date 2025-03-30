import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sendToQueue } from './queue';
import dotenv from 'dotenv';
import { Event } from "./interface/Event"
import {setupSwagger} from "../apidocs/swagger";
import { CONFIG } from "./config/config";

// Load environment variables
dotenv.config({ path: ['.env.dev', '.env'] }); // for development
dotenv.config(); // for Production

const app = express();
const PORT = CONFIG.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Set up Swagger
setupSwagger(app);


// Middleware for authentication (API Key validation)
app.use((req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== CONFIG.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});
/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - name
 *         - body
 *         - timestamp
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier of the event (optional, auto-generated if missing)
 *           example: "1234abcd"
 *         name:
 *           type: string
 *           description: The name of the event
 *           example: "test event"
 *         body:
 *           type: string
 *           description: The main content of the event
 *           example: "test body"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the event occurred
 *           example: "2025-03-28T12:34:56Z"
 *         brand:
 *           type: string
 *           description: Brand information (auto-added by system)
 *           example: "testBrand"
 */

/**
 * @swagger
 * /event:
 *   post:
 *     summary: Receive an event from the source application
 *     description: Receives an event, enhances it with a brand, and pushes it to the queue.
 *     tags: [Events]
 *     security:
 *         - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event received"
 *       400:
 *         description: Invalid event format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid event format"
 *       401:
 *         description: Unauthorized request (invalid API key)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
// Event Receiver API
app.post('/event', async (req: Request, res: Response) => {
    try {
        const { id, name, body, timestamp } = req.body;

        if (!name || !body || !timestamp) {
            return res.status(400).json({ error: 'Invalid event format' });
        }

        const enhancedEvent: Event = {
            id: id || uuidv4(),
            name,
            body,
            timestamp,
            brand: 'testBrand'
        };

        await sendToQueue(enhancedEvent);
        res.status(200).json({ message: 'Event received' });
    } catch (error) {
        console.error('Error processing event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({ message: 'Event received' });
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
