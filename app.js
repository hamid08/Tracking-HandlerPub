const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const createError = require('http-errors')
const axios = require('axios');
require('dotenv').config()
require('./src/helpers/init_mongodb')
const routeManagement = require('./src/routeManagement');
const errorHandler = require("./src/middleware/errorHandler");
const app = express();
const server = require('http').createServer(app);
require('./src/jobs/trackingJob');
require('./src/rabbit/Consumers');

let socketIo = require("socket.io");


const ws = socketIo(server, {
  serveClient: true,
  // pingInterval: 60000,
  // pingTimeout: 60000000,
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 10,
  cors: {
    origin: "http://localhost:8484",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: [
    "websocket",
    "polling"
  ]
})

var socketHandler = require('./src/sockets/socket')
socketHandler.Handle(ws);




// Middleware
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded


// logging
app.use(function(req, res, next) {
  console.log('path: ' + req.path)
  console.log('query:')
  console.log(req.query)
  console.log('body:')
  console.log(req.body)
  console.log('----------------------------')
  next()
})



// Routes
app.get("/", (req, res) => {
  res.send("Hello World! ");
});

routeManagement.RegisterAllRoutes(app);

app.use(async (req, res, next) => {
  next(createError.NotFound('صفحه مورد نظر یافت نشد!'))
})

//Erro Handler
app.use(errorHandler);

// Start Server
const port = process.env.PORT || 3000;

server.listen(port, (err) => {

  if (err) throw new Error(err);

  console.log(`Server is running on port ${port}`);

});
