import express from 'express';
import mongoose from 'mongoose';
import redis from 'redis';
import amqp from 'amqplib';
import lodash from 'lodash';

import config from './config/config.js';
import expressConfig from './frameworks/webserver/express.js';
import routes from './frameworks/webserver/routes/index.js';
import serverConfig from './frameworks/webserver/server.js';
import mongoDbConnection from './frameworks/database/mongoDB/connection.js';
import redisConnection from './frameworks/database/redis/connection.js';
import rabbitMqConnection from './frameworks/services/rabbitMQ/connection.js';
import rabbitMqConsumer from './frameworks/services/rabbitMQ/consumers.js';



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


// rabbitMq Configuration
const rabbitMq = rabbitMqConnection(amqp, lodash, config).createRabbitClient();
rabbitMq.getInstance()
  .then(broker => {
    console.log('Connected to Rabbit!');
  })
  .catch(err => {
    console.log(`Rabbit Error:${err}`);
  })


rabbitMqConsumer(rabbitMq, config);

// error handling middleware
app.use(errorHandlingMiddleware);

// Expose app
export default app;