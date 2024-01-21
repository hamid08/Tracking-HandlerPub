import express from 'express';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import lodash from 'lodash';
import * as socketIO from 'socket.io';
import nodeCron from 'node-cron';


import expressConfig from './frameworks/webserver/express';
import routes from './frameworks/webserver/routes/index';
import serverConfig from './frameworks/webserver/server';
import mongoDbConnection from './frameworks/database/mongoDB/connection';
import redisConnection from './frameworks/database/redis/connection';
import rabbitMqConnection from './frameworks/services/rabbitMQ/connection';
import rabbitMqConsumer from './frameworks/services/rabbitMQ/consumers';
import socketConnection from './frameworks/services/socket/connection';
import jobManager from './frameworks/services/jobs/jobs';
import * as rmq from './frameworks/services/rabbitMQ/receiveMessage';


// middlewares
import errorHandlingMiddleware from './frameworks/webserver/middlewares/errorHandlingMiddleware';
import { createServer } from 'http';


const app = express();
const server = createServer(app);

// express.js configuration (middlewares etc.)
expressConfig(app);

// server configuration and start
serverConfig(app, server).startServer();


// DB configuration and connection create
mongoDbConnection().connectToMongo();


// Redis
const redisClient = redisConnection()
  .connectToRedis();



// routes for each endpoint
routes(app, express);


// Reconnect to RabbitMQ on container restart
const reconnect = () => {
  console.log("Reconnecting to RabbitMQ...");
  rmq.startReceiving(redisClient).catch((err) => {
    console.error("Error starting receiving: ", err);
    setTimeout(reconnect, 5000); // try to reconnect every 5 seconds
  });
};

// Start receiving messages
rmq.startReceiving(redisClient).catch((err) => {
  console.error("Error starting receiving: ", err);
  setTimeout(reconnect, 5000); // try to reconnect every 5 seconds
});




// rabbitMq Configuration
// const rabbitMq = rabbitMqConnection(amqp, lodash, config).createRabbitClient();
// rabbitMq.getInstance()
//   .then(broker => {
//     console.log('Connected to Rabbit!');
//   })
//   .catch(err => {
//     console.log(`Rabbit Error:${err}`);
//   })


// rabbitMqConsumer(rabbitMq, redisClient, config);


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


// job Configuration
// jobManager(nodeCron).run();



// error handling middleware
app.use(errorHandlingMiddleware);

// Expose app
export default app;




