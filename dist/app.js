"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const redis = __importStar(require("redis"));
const amqplib_1 = __importDefault(require("amqplib"));
const lodash_1 = __importDefault(require("lodash"));
const socketIO = __importStar(require("socket.io"));
const config_1 = __importDefault(require("./config/config"));
const express_2 = __importDefault(require("./frameworks/webserver/express"));
const index_1 = __importDefault(require("./frameworks/webserver/routes/index"));
const server_1 = __importDefault(require("./frameworks/webserver/server"));
const connection_1 = __importDefault(require("./frameworks/database/mongoDB/connection"));
const connection_2 = __importDefault(require("./frameworks/database/redis/connection"));
const connection_3 = __importDefault(require("./frameworks/services/rabbitMQ/connection"));
const consumers_1 = __importDefault(require("./frameworks/services/rabbitMQ/consumers"));
const connection_4 = __importDefault(require("./frameworks/services/socket/connection"));
// middlewares
const errorHandlingMiddleware_1 = __importDefault(require("./frameworks/webserver/middlewares/errorHandlingMiddleware"));
const http_1 = require("http");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// express.js configuration (middlewares etc.)
(0, express_2.default)(app);
// server configuration and start
(0, server_1.default)(app, mongoose_1.default, server, config_1.default).startServer();
// DB configuration and connection create
(0, connection_1.default)(mongoose_1.default, config_1.default, {
    autoIndex: false,
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    useNewUrlParser: true, // feel free to remove, no longer used by the driver.
    connectTimeoutMS: 360000,
    socketTimeoutMS: 360000,
}).connectToMongo();
const redisClient = (0, connection_2.default)(redis, config_1.default).createRedisClient();
// routes for each endpoint
(0, index_1.default)(app, express_1.default, redisClient);
// rabbitMq Configuration
const rabbitMq = (0, connection_3.default)(amqplib_1.default, lodash_1.default, config_1.default).createRabbitClient();
rabbitMq.getInstance()
    .then(broker => {
    console.log('Connected to Rabbit!');
})
    .catch(err => {
    console.log(`Rabbit Error:${err}`);
});
(0, consumers_1.default)(rabbitMq, redisClient, config_1.default);
// socket-io Configuration
(0, connection_4.default)().trySocket(new socketIO.Server(server, Object.assign(Object.assign({ serveClient: true, pingInterval: 60000, pingTimeout: 60000000 }, ({ reconnection: true })), { reconnectionDelay: 500, reconnectionAttempts: 10, cors: {
        origin: "http://localhost:8485",
        methods: ["GET", "POST"],
        credentials: true,
    }, transports: ["websocket", "polling"] })));
// error handling middleware
app.use(errorHandlingMiddleware_1.default);
// Expose app
exports.default = app;
