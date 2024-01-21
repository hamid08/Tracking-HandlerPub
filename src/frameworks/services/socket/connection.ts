import socketService from '../../../application/services/socketService.js';
import config from '../../../config/config'


let customerSockets: any = {};
export default function connection() {
    async function trySocket(io: any) {

        io.use((socket: any, next: any) => {
            try {
                const token = socket.handshake.auth.token;
                var customerId = socket.handshake.query.customerId;
                if (token !== config.socket.auth_token) {
                    console.log(`Authenticated Error Socket Customer`, customerId);
                    return new Error(`Authenticated Error Socket Customer ${customerId}`);
                }

                console.log(`Customer Authenticated Socket`, customerId);
                next();
            }
            catch (err) {
                console.log('Customer Authenticated Socket Error')
            }
        });




        io.on('connection', (socket: any) => {
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
            socket.on('trackingResponse', async (data: any) => {
                await socketService().HandleSocketResponse(data);

            });
        });
    }



    async function sendLocationsToCustomer(locations: any, latestLocation: any, customerId: any) {

        if (customerSockets[customerId]) {
            customerSockets[customerId].emit('receiveTrackingData', { locations, latestLocation });

        } else {
            console.log('customer ' + customerId + ' not found connection');
        }
    }

    return {
        sendLocationsToCustomer,
        trySocket
    }
}
