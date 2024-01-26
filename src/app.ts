import express from 'express';
import mongoose from 'mongoose';
import * as socketIO from 'socket.io';


import config from './config/config';
import expressConfig from './frameworks/webserver/express';
import routes from './frameworks/webserver/routes/index';
import serverConfig from './frameworks/webserver/server';
import mongoDbConnection from './frameworks/database/mongoDB/connection';
import redisConnection from './frameworks/database/redis/connection';
import mqConnection from './frameworks/services/rabbitMQ/connection';
import socketConnection from './frameworks/services/socket/connection';
import jobManager from './frameworks/services/jobs/jobs';



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
  connectTimeoutMS: 360000,
  socketTimeoutMS: 360000,
}).connectToMongo();


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
jobManager().run();


const runApplication = async () => {
  await mqConnection.connect();
  await redisConnection;

}

runApplication();


// error handling middleware
app.use(errorHandlingMiddleware);

// Expose app
export default app;