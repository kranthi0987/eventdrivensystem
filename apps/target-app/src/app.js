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
var apollo_server_express_1 = require("apollo-server-express");
var schema_1 = require("./schema");
var shared_auth_1 = require("shared-auth");
var jwtService = new shared_auth_1.JWTService(shared_auth_1.jwtConfig);
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var app, server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, express_1.default)();
                    // Authentication middleware
                    app.use(function (req, res, next) {
                        if (req.path === '/health')
                            return next();
                        var authHeader = req.headers.authorization;
                        if (!authHeader) {
                            return res.status(401).send('Authorization header missing');
                        }
                        var token = authHeader.split(' ')[1];
                        try {
                            var payload = jwtService.verifyToken(token);
                            if (payload.service !== 'bridge') {
                                return res.status(403).send('Invalid service token');
                            }
                            next();
                        }
                        catch (err) {
                            return res.status(401).send('Invalid or expired token');
                        }
                    });
                    server = new apollo_server_express_1.ApolloServer({
                        typeDefs: schema_1.typeDefs,
                        resolvers: schema_1.resolvers,
                        context: function (_a) {
                            var _b;
                            var req = _a.req;
                            // Verify token for GraphQL requests
                            var token = ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1]) || '';
                            try {
                                var payload = jwtService.verifyToken(token);
                                return { user: payload };
                            }
                            catch (err) {
                                throw new Error('Invalid or expired token');
                            }
                        }
                    });
                    return [4 /*yield*/, server.start()];
                case 1:
                    _a.sent();
                    server.applyMiddleware({ app: app });
                    app.get('/health', function (req, res) {
                        res.status(200).send('OK');
                    });
                    app.listen(4000, function () {
                        console.log("Target GraphQL API running at http://localhost:4000".concat(server.graphqlPath));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
startServer().catch(function (err) {
    console.error('Failed to start server:', err);
});
