"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    port: process.env.PORT || 3000,
    ip: process.env.HOST || '127.0.0.1',
    mongo: {
        uri: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracking-data-handler'
    },
    redis: {
        uri: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    rabbit: {
        uri: process.env.RABBITMQ_URL || 'amqp://localhost',
        trackingRelayQueue: 'Tracking.Relay.TrackingData',
    }
};
