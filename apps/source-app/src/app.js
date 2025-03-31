"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var axios_1 = __importDefault(require("axios"));
var uuid_1 = require("uuid");
var shared_auth_1 = require("shared-auth");
var app = (0, express_1.default)();
app.use(express_1.default.json());
var BRIDGE_SERVICE_URL = 'http://localhost:3001/api/events';
var EVENT_INTERVAL = 300;
var TOTAL_EVENTS = 100;
var jwtService = new shared_auth_1.JWTService(shared_auth_1.jwtConfig);
function generateEvent() {
    return {
        id: (0, uuid_1.v4)(),
        name: 'test event',
        body: 'test body',
        timestamp: new Date().toISOString()
    };
}
function sendEvent(event) {
    return __awaiter(this, void 0, void 0, function () {
        var token, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = jwtService.generateToken({
                        service: 'source',
                        id: event.id
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(BRIDGE_SERVICE_URL, event, {
                            timeout: 450,
                            headers: {
                                'Authorization': "Bearer ".concat(token)
                            }
                        })];
                case 2:
                    response = _a.sent();
                    console.log("Event ".concat(event.id, " sent successfully. Status: ").concat(response.status));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    if (axios_1.default.isAxiosError(error_1)) {
                        console.error("Failed to send event ".concat(event.id, ":"), error_1.message);
                    }
                    else {
                        console.error("Unexpected error sending event ".concat(event.id, ":"), error_1);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// ... rest of the code remains the same ...
function simulateEvents() {
    var eventCount = 0;
    var intervalId = setInterval(function () {
        if (eventCount >= TOTAL_EVENTS) {
            clearInterval(intervalId);
            console.log('Finished sending events');
            return;
        }
        var event = generateEvent();
        console.log("Sending event ".concat(event.id));
        sendEvent(event);
        eventCount++;
    }, EVENT_INTERVAL);
}
app.get('/health', function (req, res) {
    res.status(200).send('OK');
});
app.listen(3000, function () {
    console.log('Source application running on port 3000');
    simulateEvents();
});
