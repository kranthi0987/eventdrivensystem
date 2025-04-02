import { gql } from 'apollo-server-express';
import { Event, EventInput } from './types';

/**
 * @swagger
 * /graphql:
 *   post:
 *     summary: GraphQL API endpoint
 *     description: GraphQL API for event management
 *     tags: [GraphQL]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: GraphQL query string
 *               variables:
 *                 type: object
 *                 description: Query variables
 *     responses:
 *       200:
 *         description: Successful GraphQL response
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - Invalid service token
 */
export const typeDefs = gql`
  type Event {
    id: ID!
    name: String!
    body: String!
    timestamp: String!
    brand: String!
  }

  input EventInput {
    id: ID!
    name: String!
    body: String!
    timestamp: String!
    brand: String!
  }

  type Mutation {
    createEvent(input: EventInput!): Event
  }

  type Query {
    events: [Event]
    event(id: ID!): Event
  }
`;

export const resolvers = {
    Query: {
        events: (): Event[] => events,
        event: (_: unknown, { id }: { id: string }): Event | undefined =>
            events.find(e => e.id === id)
    },
    Mutation: {
        createEvent: (_: unknown, { input }: { input: EventInput }): Promise<Event> => {
            if (Math.random() < 0.2) {
                const delay = Math.floor(Math.random() * 1000) + 500;
                return new Promise(resolve => {
                    setTimeout(() => {
                        events.push(input);
                        resolve(input);
                    }, delay);
                });
            }

            events.push(input);
            return Promise.resolve(input);
        }
    }
};

const events: Event[] = [];