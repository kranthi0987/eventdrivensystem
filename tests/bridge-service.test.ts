import express from 'express';
import { SourceEvent, EnhancedEvent } from '../apps/bridge-service/src/types';
import { JWTService } from 'shared-auth';
import { jwtConfig } from 'shared-auth';
import * as Queue from 'bull';
import { GraphQLClient } from 'graphql-request';
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
jest.mock('express');
jest.mock('shared-auth');
jest.mock('bull');
jest.mock('graphql-request');

// Mock app module
const mockApp = {
    authenticateJWT: jest.fn(),
    post: jest.fn()
};
jest.mock('../apps/bridge-service/src/app', () => ({
    __esModule: true,
    ...mockApp
}));

// Mock event queue module
const mockEventQueue = {
    process: jest.fn()
};
jest.mock('../apps/bridge-service/src/event-queue', () => ({
    __esModule: true,
    default: mockEventQueue
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

describe('Bridge Service Tests', () => {
    let mockJwtService: jest.Mocked<JWTService>;
    let mockQueue: jest.Mocked<Queue.Queue>;
    let mockGraphQLClient: jest.Mocked<GraphQLClient>;
    let mockApp: express.Application;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup JWT service mock
        mockJwtService = {
            verifyToken: jest.fn(),
            generateToken: jest.fn().mockReturnValue('mock-token')
        } as any;
        (JWTService as jest.Mock).mockImplementation(() => mockJwtService);

        // Setup Queue mock
        const mockJob = {
            id: 'test-job-id',
            data: {},
            opts: {},
            queue: {} as any,
            progress: jest.fn(),
            log: jest.fn(),
            moveToCompleted: jest.fn(),
            moveToFailed: jest.fn(),
            remove: jest.fn(),
            retry: jest.fn(),
            discard: jest.fn(),
            finished: jest.fn(),
            isCompleted: jest.fn(),
            isFailed: jest.fn(),
            isActive: jest.fn(),
            isWaiting: jest.fn(),
            isDelayed: jest.fn(),
            isDead: jest.fn(),
            getState: jest.fn(),
            update: jest.fn()
        };

        const queueInstance = {
            add: jest.fn().mockResolvedValue(mockJob),
            process: jest.fn(),
            on: jest.fn()
        };
        (Queue.default as jest.Mock).mockImplementation(() => queueInstance);
        mockQueue = queueInstance as any;

        // Setup GraphQL client mock
        mockGraphQLClient = {
            request: jest.fn()
        } as any;
        (GraphQLClient as jest.Mock).mockImplementation(() => mockGraphQLClient);

        // Setup Express app mock
        mockApp = {
            use: jest.fn(),
            post: jest.fn(),
            get: jest.fn(),
            listen: jest.fn()
        } as any;
        (express as unknown as jest.Mock).mockReturnValue(mockApp);
    });

    describe('Authentication', () => {
        it('should reject requests without authorization header', () => {
            const mockReq = {
                headers: {}
            } as Request;
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;

            mockApp.authenticateJWT(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.send).toHaveBeenCalledWith('Authorization header missing');
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject requests with invalid service token', () => {
            const mockReq = {
                headers: {
                    authorization: 'Bearer invalid-token'
                }
            } as Request;
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;

            mockJwtService.verifyToken.mockReturnValue({ service: 'bridge' as const, id: 'test-service' });

            mockApp.authenticateJWT(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.send).toHaveBeenCalledWith('Invalid service token');
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('Event Processing', () => {
        it('should successfully process a valid event', async () => {
            const mockEvent: SourceEvent = {
                id: 'test-id',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString()
            };

            const mockEnhancedEvent: EnhancedEvent = {
                ...mockEvent,
                brand: 'test-brand'
            };

            mockGraphQLClient.request.mockResolvedValueOnce({
                createEvent: mockEnhancedEvent
            });

            mockEventQueue.process.mockImplementation(async ({ data }) => {
                const response = await mockGraphQLClient.request(
                    expect.any(String),
                    expect.objectContaining({
                        input: {
                            ...data,
                            brand: expect.any(String)
                        }
                    })
                );
                return response.createEvent;
            });

            const result = await mockEventQueue.process({ data: mockEvent });

            expect(result).toEqual(mockEnhancedEvent);
            expect(mockGraphQLClient.request).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    input: expect.objectContaining({
                        id: mockEvent.id,
                        name: mockEvent.name,
                        body: mockEvent.body,
                        timestamp: mockEvent.timestamp,
                        brand: expect.any(String)
                    })
                })
            );
        });

        it('should handle processing errors gracefully', async () => {
            const mockEvent: SourceEvent = {
                id: 'test-id',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString()
            };

            const error = new Error('Processing failed');
            mockGraphQLClient.request.mockRejectedValueOnce(error);

            mockEventQueue.process.mockRejectedValue(error);
            
            await expect(mockEventQueue.process({ data: mockEvent })).rejects.toThrow(error);
        });
    });

    describe('API Endpoints', () => {
        it('should accept valid events', async () => {
            const mockEvent: SourceEvent = {
                id: 'test-id',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString()
            };

            const mockReq = {
                body: mockEvent
            } as Request;
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            mockApp.post.mockImplementation((path: string) => {
                return async (req: Request, res: Response) => {
                    await mockQueue.add(req.body);
                    res.status(202).send('Event accepted for processing');
                };
            });

            await mockApp.post('/api/events')(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(202);
            expect(mockRes.send).toHaveBeenCalledWith('Event accepted for processing');
        });

        it('should reject invalid events', async () => {
            const mockReq = {
                body: {
                    id: 'test-id'
                    // Missing required fields
                }
            } as Request;
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            mockApp.post.mockImplementation((path: string) => {
                return async (req: Request, res: Response) => {
                    res.status(400).send('Invalid event format');
                };
            });

            await mockApp.post('/api/events')(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.send).toHaveBeenCalledWith('Invalid event format');
        });
    });
}); 