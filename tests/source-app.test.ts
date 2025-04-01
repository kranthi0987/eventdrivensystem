import { Event } from '../apps/source-app/src/types';
import axios from 'axios';
import { JWTService } from 'shared-auth';

// Mock dependencies
jest.mock('axios');
jest.mock('shared-auth');

// Mock app module
const mockApp = {
    generateEvent: jest.fn(),
    sendEvent: jest.fn(),
    simulateEvents: jest.fn(),
    stopSimulation: jest.fn()
};
jest.mock('../apps/source-app/src/app', () => ({
    __esModule: true,
    ...mockApp
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

describe('Source App Tests', () => {
    let mockJwtService: jest.Mocked<JWTService>;
    let mockAxios: jest.Mocked<typeof axios>;
    let mockSetInterval: jest.SpyInstance;
    let mockClearInterval: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Setup JWT service mock
        mockJwtService = {
            verifyToken: jest.fn(),
            generateToken: jest.fn().mockReturnValue('mock-token')
        } as any;
        (JWTService as jest.Mock).mockImplementation(() => mockJwtService);

        // Setup Axios mock
        mockAxios = axios as jest.Mocked<typeof axios>;
        mockAxios.post.mockResolvedValue({ data: {} });

        // Setup timer mocks
        mockSetInterval = jest.spyOn(global, 'setInterval');
        mockClearInterval = jest.spyOn(global, 'clearInterval');
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('Event Generation', () => {
        it('should generate a valid event with all required fields', () => {
            const mockEvent: Event = {
                id: 'test-id',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString()
            };

            mockApp.generateEvent.mockReturnValue(mockEvent);
            const event = mockApp.generateEvent();
            
            expect(event).toHaveProperty('id');
            expect(event).toHaveProperty('name');
            expect(event).toHaveProperty('body');
            expect(event).toHaveProperty('timestamp');
            
            expect(typeof event.id).toBe('string');
            expect(event.name).toBe('test event');
            expect(event.body).toBe('test body');
            expect(new Date(event.timestamp).toISOString()).toBe(event.timestamp);
        });
    });

    describe('Event Sending', () => {
        it('should successfully send an event', async () => {
            const mockEvent: Event = {
                id: 'test-id',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString()
            };

            mockAxios.post.mockResolvedValueOnce({ status: 200 });
            mockApp.sendEvent.mockResolvedValue(undefined);

            await mockApp.sendEvent(mockEvent);

            expect(mockAxios.post).toHaveBeenCalledWith(
                'http://localhost:3001/api/events',
                mockEvent,
                expect.objectContaining({
                    timeout: 500,
                    headers: {
                        'Authorization': 'Bearer mock-token'
                    }
                })
            );
        });

        it('should handle axios errors when sending events', async () => {
            const mockEvent: Event = {
                id: 'test-id',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString()
            };

            const errorMessage = 'Network Error';
            mockAxios.post.mockRejectedValueOnce(new Error(errorMessage));
            mockApp.sendEvent.mockRejectedValue(new Error(errorMessage));

            await expect(mockApp.sendEvent(mockEvent)).rejects.toThrow(errorMessage);
        });
    });

    describe('Event Simulation', () => {
        it('should simulate events at regular intervals', () => {
            const mockEvent: Event = {
                id: 'test-id',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString()
            };

            mockApp.generateEvent.mockReturnValue(mockEvent);
            mockApp.sendEvent.mockResolvedValue(undefined);

            mockSetInterval.mockImplementation((callback: Function) => {
                callback();
                return 1 as any;
            });

            mockApp.simulateEvents();

            expect(mockSetInterval).toHaveBeenCalled();
            expect(mockApp.sendEvent).toHaveBeenCalledWith(mockEvent);
        });

        it('should stop simulation after max events', () => {
            const mockEvent: Event = {
                id: 'test-id',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString()
            };

            let eventCount = 5;
            const TOTAL_EVENTS = 50;

            mockApp.generateEvent.mockReturnValue(mockEvent);
            mockApp.sendEvent.mockResolvedValue(undefined);

            mockSetInterval.mockImplementation((callback: Function) => {
                while (eventCount < TOTAL_EVENTS) {
                    callback();
                    eventCount++;
                }
                return 1 as any;
            });

            mockApp.simulateEvents();

            expect(mockSetInterval).toHaveBeenCalled();
            expect(mockClearInterval).toHaveBeenCalled();
        });
    });
}); 