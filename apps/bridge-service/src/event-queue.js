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
var bull_1 = __importDefault(require("bull"));
var graphql_request_1 = require("graphql-request");
var utils_1 = require("./utils");
var shared_auth_1 = require("shared-auth");
var TARGET_API_URL = 'http://localhost:4000/graphql';
var jwtService = new shared_auth_1.JWTService(shared_auth_1.jwtConfig);
var client = new graphql_request_1.GraphQLClient(TARGET_API_URL, {
    headers: {
        'Authorization': "Bearer ".concat(jwtService.generateToken({
            service: 'bridge',
            id: 'bridge-service'
        }))
    }
});
var eventQueue = new bull_1.default('events', {
    limiter: {
        max: 5,
        duration: 1000
    }
});
var mutation = "\n  mutation CreateEvent($input: EventInput!) {\n    createEvent(input: $input) {\n      id\n      name\n      body\n      timestamp\n      brand\n    }\n  }\n";
eventQueue.process(function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var event, enhancedEvent, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                event = job.data;
                enhancedEvent = (0, utils_1.enhanceEvent)(event);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.request(mutation, {
                        input: enhancedEvent
                    })];
            case 2:
                data = _a.sent();
                console.log("Event ".concat(event.id, " successfully processed by target API"));
                return [2 /*return*/, data];
            case 3:
                error_1 = _a.sent();
                console.error("Error processing event ".concat(event.id, ":"), error_1 instanceof Error ? error_1.message : 'Unknown error');
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); });
eventQueue.on('failed', function (job, err) {
    console.error("Job ".concat(job.id, " failed after retries:"), err.message);
});
exports.default = eventQueue;
