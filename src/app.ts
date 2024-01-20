import express from 'express';
import mongoose from 'mongoose';
import * as redis from 'redis';
import amqp from 'amqplib';
import lodash from 'lodash';
import  * as socketIO from 'socket.io';

import config from './config/config';
import expressConfig from './frameworks/webserver/express';
import routes from './frameworks/webserver/routes/index';
import serverConfig from './frameworks/webserver/server';
import mongoDbConnection from './frameworks/database/mongoDB/connection';
import redisConnection from './frameworks/database/redis/connection';
import rabbitMqConnection from './frameworks/services/rabbitMQ/connection';
import rabbitMqConsumer from './frameworks/services/rabbitMQ/consumers';
import socketConnection from './frameworks/services/socket/connection';



// middlewares
import errorHandlingMiddleware from './frameworks/webserver/middlewares/errorHandlingMiddleware';
import { createServer } from 'http';


const app = express();
const server = createServer(app);

// express.js configuration (middlewares etc.)
expressConfig(app);

// server configuration and start
serverConfig(app, mongoose, server, config).startServer();


// DB configuration and connection create
mongoDbConnection(mongoose, config, {
  autoIndex: false,
  maxPoolSize: 50,
  wtimeoutMS: 2500,
  useNewUrlParser: true, // feel free to remove, no longer used by the driver.
  connectTimeoutMS: 360000,
  socketTimeoutMS: 360000,
}).connectToMongo();

const redisClient = redisConnection(redis, config).createRedisClient();

// routes for each endpoint
routes(app, express, redisClient);


// rabbitMq Configuration
const rabbitMq = rabbitMqConnection(amqp, lodash, config).createRabbitClient();
rabbitMq.getInstance()
  .then(broker => {
    console.log('Connected to Rabbit!');
  })
  .catch(err => {
    console.log(`Rabbit Error:${err}`);
  })


rabbitMqConsumer(rabbitMq, redisClient, config);


// socket-io Configuration

socketConnection().trySocket(new socketIO.Server(server, {
  serveClient: true,
  pingInterval: 60000,
  pingTimeout: 60000000,
  ...(<any>({ reconnection: true })), // type assertion to suppress the error
  reconnectionDelay: 500,
  reconnectionAttempts: 10,
  cors: {
    origin: "http://localhost:8485",
    methods: ["GET", "POST"] as const,
    credentials: true,
  },
  transports: ["websocket", "polling"] as const,
}));



// error handling middleware
app.use(errorHandlingMiddleware);

// Expose app
export default app;