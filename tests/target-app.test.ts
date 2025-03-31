import { ApolloServer } from 'apollo-server-express';
import { gql } from 'apollo-server-express';
import { JWTService } from 'shared-auth';
import { Event } from '../apps/target-app/src/types';
import { DocumentNode, ObjectTypeDefinitionNode, InputObjectTypeDefinitionNode } from 'graphql';

// Mock dependencies
jest.mock('apollo-server-express');
jest.mock('shared-auth');

// Mock resolvers
const mockResolvers = {
    Query: {
        events: jest.fn(),
        event: jest.fn()
    },
    Mutation: {
        createEvent: jest.fn()
    }
};
jest.mock('../apps/target-app/src/resolvers', () => ({
    __esModule: true,
    default: mockResolvers
}));

// Mock console to prevent noise during tests
const originalConsole = { ...console };
beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
});

describe('Target App Tests', () => {
    let mockJwtService: jest.Mocked<JWTService>;
    let mockApolloServer: jest.Mocked<ApolloServer>;

    const typeDefs = gql`
        type Event {
            id: ID!
            name: String!
            body: String!
            timestamp: String!
            brand: String
        }

        input EventInput {
            id: ID!
            name: String!
            body: String!
            timestamp: String!
            brand: String
        }

        type Query {
            events: [Event!]!
            event(id: ID!): Event
        }

        type Mutation {
            createEvent(input: EventInput!): Event!
        }
    `;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup JWT service mock
        mockJwtService = {
            verifyToken: jest.fn(),
            generateToken: jest.fn().mockReturnValue('mock-token')
        } as any;
        (JWTService as jest.Mock).mockImplementation(() => mockJwtService);

        // Setup Apollo server mock
        mockApolloServer = {
            listen: jest.fn(),
            stop: jest.fn(),
            createHandler: jest.fn()
        } as any;
        (ApolloServer as unknown as jest.Mock).mockImplementation(() => mockApolloServer);
    });

    describe('GraphQL Schema', () => {
        it('should define Event type with correct fields', () => {
            const schema = (typeDefs as DocumentNode).definitions.find(
                (def): def is ObjectTypeDefinitionNode =>
                    def.kind === 'ObjectTypeDefinition' && def.name?.value === 'Event'
            );
            expect(schema).toBeDefined();

            const fields = schema?.fields?.map(field => field.name.value);
            expect(fields).toEqual(['id', 'name', 'body', 'timestamp', 'brand']);
        });

        it('should define EventInput type with correct fields', () => {
            const schema = (typeDefs as DocumentNode).definitions.find(
                (def): def is InputObjectTypeDefinitionNode =>
                    def.kind === 'InputObjectTypeDefinition' && def.name?.value === 'EventInput'
            );
            expect(schema).toBeDefined();

            const fields = schema?.fields?.map(field => field.name.value);
            expect(fields).toEqual(['id', 'name', 'body', 'timestamp', 'brand']);
        });
    });

    describe('GraphQL Resolvers', () => {
        const mockEvent: Event = {
            id: 'test-id',
            name: 'test event',
            body: 'test body',
            timestamp: new Date().toISOString(),
            brand: 'test-brand'
        };

        beforeEach(() => {
            mockResolvers.Query.events.mockReset();
            mockResolvers.Query.event.mockReset();
            mockResolvers.Mutation.createEvent.mockReset();
        });

        it('should query all events', async () => {
            const mockEvents = [mockEvent];
            mockResolvers.Query.events.mockResolvedValue(mockEvents);

            const mockContext = {
                dataSources: {
                    eventAPI: {
                        getAllEvents: jest.fn().mockResolvedValue(mockEvents)
                    }
                }
            };

            const result = await mockResolvers.Query.events(null, {}, mockContext);
            expect(result).toEqual(mockEvents);
            expect(mockContext.dataSources.eventAPI.getAllEvents).toHaveBeenCalled();
        });

        it('should query single event by id', async () => {
            mockResolvers.Query.event.mockResolvedValue(mockEvent);

            const mockContext = {
                dataSources: {
                    eventAPI: {
                        getEventById: jest.fn().mockResolvedValue(mockEvent)
                    }
                }
            };

            const result = await mockResolvers.Query.event(null, { id: 'test-id' }, mockContext);
            expect(result).toEqual(mockEvent);
            expect(mockContext.dataSources.eventAPI.getEventById).toHaveBeenCalledWith('test-id');
        });

        it('should create new event', async () => {
            mockResolvers.Mutation.createEvent.mockResolvedValue(mockEvent);

            const mockContext = {
                dataSources: {
                    eventAPI: {
                        createEvent: jest.fn().mockResolvedValue(mockEvent)
                    }
                }
            };

            const result = await mockResolvers.Mutation.createEvent(null, { input: mockEvent }, mockContext);
            expect(result).toEqual(mockEvent);
            expect(mockContext.dataSources.eventAPI.createEvent).toHaveBeenCalledWith(mockEvent);
        });
    });

    describe('Authentication', () => {
        it('should validate service token in context', async () => {
            const mockToken = 'valid-token';
            const mockReq = {
                headers: {
                    authorization: `Bearer ${mockToken}`
                }
            };

            mockJwtService.verifyToken.mockReturnValue({ service: 'source', id: 'test-service' });

            const context = require('../apps/target-app/src/context').default;
            const result = await context({ req: mockReq });

            expect(result.token).toBe(mockToken);
            expect(mockJwtService.verifyToken).toHaveBeenCalledWith(mockToken);
        });

        it('should reject invalid token in context', async () => {
            const mockReq = {
                headers: {
                    authorization: 'Bearer invalid-token'
                }
            };

            mockJwtService.verifyToken.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const context = require('../apps/target-app/src/context').default;
            await expect(context({ req: mockReq })).rejects.toThrow('Invalid token');
        });
    });
}); 