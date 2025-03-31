"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var event_queue_1 = __importDefault(require("./event-queue"));
var shared_auth_1 = require("shared-auth");
var app = (0, express_1.default)();
app.use(express_1.default.json());
var jwtService = new shared_auth_1.JWTService(shared_auth_1.jwtConfig);
// Authentication middleware
function authenticate(req, res, next) {
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Authorization header missing');
    }
    var token = authHeader.split(' ')[1];
    try {
        var payload = jwtService.verifyToken(token);
        if (payload.service !== 'source') {
            return res.status(403).send('Invalid service token');
        }
        next();
    }
    catch (err) {
        return res.status(401).send('Invalid or expired token');
    }
}
app.post('/api/events', authenticate, function (req, res) {
    var event = req.body;
    if (!event.id || !event.name || !event.body || !event.timestamp) {
        return res.status(400).send('Invalid event format');
    }
    event_queue_1.default.add(event)
        .then(function () {
        res.status(202).send('Event accepted for processing');
    })
        .catch(function (err) {
        console.error('Error adding to queue:', err.message);
        res.status(500).send('Internal server error');
    });
});
// ... rest of the code remains the same ...
app.get('/health', function (req, res) {
    res.status(200).send('OK');
});
app.listen(3001, function () {
    console.log('Bridge service running on port 3001');
});
