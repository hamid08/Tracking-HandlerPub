import express from 'express';
import mongoose from 'mongoose';
import redis from 'redis';
import config from './config/config.js';
import expressConfig from './frameworks/webserver/express.js';
import routes from './frameworks/webserver/routes/index.js';
import serverConfig from './frameworks/webserver/server.js';
import mongoDbConnection from './frameworks/database/mongoDB/connection.js';
import redisConnection from './frameworks/database/redis/connection.js';
// middlewares
import errorHandlingMiddleware from './frameworks/webserver/middlewares/errorHandlingMiddleware.js';
import http from 'http';


const app = express();
const server = http.createServer(app);


// express.js configuration (middlewares etc.)
expressConfig(app);

// server configuration and start
serverConfig(app, mongoose, server, config).startServer();

// DB configuration and connection create
mongoDbConnection(mongoose, config, {
  autoIndex: true,
  connectTimeoutMS: 1000
}).connectToMongo();

const redisClient = redisConnection(redis, config).createRedisClient();

// routes for each endpoint
routes(app, express, redisClient);

// error handling middleware
app.use(errorHandlingMiddleware);

// Expose app
export default app;