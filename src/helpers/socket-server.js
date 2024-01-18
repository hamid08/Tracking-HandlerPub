const io = require('socket.io')();
const socketAckService = require('../services/SocketAckService')
var redisClient = require('../helpers/init_redis')




//#region Config Socket Client And Authentication

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token !== process.env.AuthToken) {
        return next(new Error('Authentication error'));
    }

    next();
});


var customerSockets = {};

io.on('connection', (socket) => {
    socket.emit('authenticated');

    // Get the user's ID from the socket handshake data.
    var customerId = socket.handshake.query.customerId;

    // Store the reference to this socket by the user's ID.
    customerSockets[customerId] = socket;

    console.log('customer ' + customerId + ' Socket connected');

    socket.on('disconnect', () => {
        // Remove the reference to this socket when the user disconnects.
        delete customerSockets[customerId];
        console.log('customer ' + customerId + ' Socket disconnected');
    });

    //Customer Event Response
    socket.on('trackingResponse', async (data) => {
        await socketAckService.HandleAckData(data);

    });
});

//#endregion


//#region Events
async function SendLocationsToCustomer(locations, latestLocation) {
    var customerId = await GetCustomerId(latestLocation.imei);

    if (customerSockets[customerId]) {
        customerSockets[customerId].emit('receiveTrackingData', { locations, latestLocation });

    } else {
        console.log('customer ' + customerId + ' not found connection');
    }
}


async function GetCustomerId(imei) {
    try{
    const trackerInfoRedis = await redisClient.hGetAll(`Device_${imei}`);
    const trackerInfo = JSON.parse(trackerInfoRedis.data);
    if (trackerInfo == null || trackerInfo == undefined || trackerInfo.CustomerId == '') return null;

    return trackerInfo.CustomerId;
    }
    catch(err){
        return '0';
    }
}

//#endregion



module.exports = {
    SendLocationsToCustomer, io
};
