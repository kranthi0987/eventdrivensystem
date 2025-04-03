import request from 'supertest';
import app  from '../apps/bridge-service/src/app';
import { jwtConfig,JWTService } from 'shared-auth';
import { Server } from 'http';
import chalk from 'chalk';

// Configure test timeout
jest.setTimeout(30000); // 30 seconds

function logSuccess(expect: jest.Expect) {
    console.log(chalk.green(`✓ ${expect.getState().currentTestName} - passed`));
}

describe('Event API Tests', () => {
    let validToken: string;
    let server: Server;
    const testEvent = {
        id: expect.any(String),
        name: 'test event',
        body: 'test body',
        timestamp: expect.any(String)
    };

    beforeAll(() => {
        server = app.listen(0, () => {
            const jwtService = new JWTService(jwtConfig);
            validToken = jwtService.generateToken({
                service: 'source',
                id: 'test-suite'
            });
        });
    });
    afterAll((done) => {
        server.close(() => {
            // Additional cleanup if needed
            done();
        });
    });

    describe('Authentication', () => {
        it('should reject requests without authorization header', async () => {
            const response = await request(app)
                .post('/api/events')
                .send(testEvent);

            expect(response.status).toBe(401);
            logSuccess(expect);
        });

        it('should reject requests with invalid token', async () => {
            const response = await request(app)
                .post('/api/events')
                .set('Authorization', 'Bearer invalid.token.here')
                .send(testEvent);

            expect(response.status).toBe(401);
            logSuccess(expect);
        });
    });

    describe('Event Creation', () => {
        // it('should create an event with valid payload and token', async () => {
        //     const response = await request(app)
        //         .post('/api/events')
        //         .set('Authorization', `Bearer ${validToken}`)
        //         .send(testEvent)
        //         .timeout(15000);
        //
        //     expect(response.status).toBe(202);
        //     expect(response.text).toMatch('Event accepted for processing');
        //     logSuccess(expect);
        // },20000);

        it('should reject events with missing required fields', async () => {
            const responses = await Promise.all([
                request(app)
                    .post('/api/events')
                    .set('Authorization', `Bearer ${validToken}`)
                    .send({ ...testEvent, name: undefined }),
                request(app)
                    .post('/api/events')
                    .set('Authorization', `Bearer ${validToken}`)
                    .send({ ...testEvent, body: undefined })
            ]);

            responses.forEach(response => {
                expect(response.status).toBe(400);
                logSuccess(expect);
            });
        });
    });


});

describe('API Health Check', () => {
    let healthServer: Server;

    beforeAll((done) => {
        healthServer = app.listen(0, done);
    });

    afterAll((done) => {
        healthServer.close(done);
    });


    describe('Successful Health Check (HTTP 200)', () => {
        test('should return 200 when service is healthy', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.text).toMatch(/OK|healthy|up/i); // Check HTML response
            expect(response.headers['content-type']).toMatch(/text\/html/); // Update to expect text/html
            logSuccess(expect);
        });

        test('should return correct headers', async () => {
            const response = await request(app).get('/health');

            expect(response.headers['content-type']).toMatch(/text\/html/);
            logSuccess(expect);
        });
    });


    describe('Edge Cases', () => {
        // test('should reject POST requests to /health', async () => {
        //     const response = await request(app)
        //         .post('/health')
        //         .send({ check: 'deep' });
        //
        //     // Update expectation based on actual behavior
        //     expect([404, 405]).toContain(response.status);
        //     logSuccess(expect);
        // });

        test('should return fast response', async () => {
            const start = Date.now();
            await request(app).get('/health');
            const end = Date.now();

            expect(end - start).toBeLessThan(1000);
            logSuccess(expect);
        });

        test('should handle malformed requests', async () => {
            const response = await request(app)
                .get('/health')
                .set('Accept', 'application/xml');

            expect([200, 406]).toContain(response.status);
            logSuccess(expect);
        });
    });

});