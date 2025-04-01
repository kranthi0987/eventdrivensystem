import Queue from 'bull';
import { GraphQLClient } from 'graphql-request';
import { SourceEvent } from './types';
import { enhanceEvent } from './utils';
import {jwtConfig, JWTService} from "shared-auth";



const TARGET_API_URL = 'http://localhost:3002/graphql';
const jwtService = new JWTService(jwtConfig);

const client = new GraphQLClient(TARGET_API_URL, {
    headers: {
        'Authorization': `Bearer ${jwtService.generateToken({
            service: 'bridge',
            id: 'bridge-service'
        })}`
    }
});

const eventQueue = new Queue<SourceEvent>('events', {
    limiter: {
        max: 5,
        duration: 1000
    }
});

const mutation = `
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      id
      name
      body
      timestamp
      brand
    }
  }
`;

eventQueue.process(async (job) => {
    const event = job.data;
    const enhancedEvent = enhanceEvent(event);

    try {
        const data = await client.request(mutation, {
            input: enhancedEvent
        });
        console.log(`Event ${event.id} successfully processed by target API`);
        return data;
    } catch (error) {
        console.error(`Error processing event ${event.id}:`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            eventId: event.id,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
});

eventQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed after retries:`, err.message);
});

export default eventQueue;