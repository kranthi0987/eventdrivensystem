"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
var apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  type Event {\n    id: ID!\n    name: String!\n    body: String!\n    timestamp: String!\n    brand: String!\n  }\n\n  input EventInput {\n    id: ID!\n    name: String!\n    body: String!\n    timestamp: String!\n    brand: String!\n  }\n\n  type Mutation {\n    createEvent(input: EventInput!): Event\n  }\n\n  type Query {\n    events: [Event]\n    event(id: ID!): Event\n  }\n"], ["\n  type Event {\n    id: ID!\n    name: String!\n    body: String!\n    timestamp: String!\n    brand: String!\n  }\n\n  input EventInput {\n    id: ID!\n    name: String!\n    body: String!\n    timestamp: String!\n    brand: String!\n  }\n\n  type Mutation {\n    createEvent(input: EventInput!): Event\n  }\n\n  type Query {\n    events: [Event]\n    event(id: ID!): Event\n  }\n"])));
exports.resolvers = {
    Query: {
        events: function () { return events; },
        event: function (_, _a) {
            var id = _a.id;
            return events.find(function (e) { return e.id === id; });
        }
    },
    Mutation: {
        createEvent: function (_, _a) {
            var input = _a.input;
            if (Math.random() < 0.2) {
                var delay_1 = Math.floor(Math.random() * 1000) + 500;
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        events.push(input);
                        resolve(input);
                    }, delay_1);
                });
            }
            events.push(input);
            return Promise.resolve(input);
        }
    }
};
var events = [];
var templateObject_1;
