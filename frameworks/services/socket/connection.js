// const socketAckService = require('../services/SocketAckService')

export default function connection(io) {

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




    async function sendLocationsToCustomer(locations, latestLocation, customerId) {

        if (customerSockets[customerId]) {
            customerSockets[customerId].emit('receiveTrackingData', { locations, latestLocation });

        } else {
            console.log('customer ' + customerId + ' not found connection');
        }
    }

    return {
        sendLocationsToCustomer
    }
}
