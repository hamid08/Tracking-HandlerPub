import amqp from "amqplib/callback_api";
import rabbitService from '../../../application/services/rabbitService.js';


const receiveMessage = (redisClient: any): Promise<any> => {
    var _rabbitService = rabbitService(redisClient);
    return new Promise((resolve, reject) => {
        amqp.connect("amqp://guest:guest@localhost:5672", function (error0, connection) {
            if (error0) {
                reject(error0);
            }

            connection.on("error", function (err) {
                console.error(`Error in RabbitMQ connection: ${err}`);
            });

            connection.on("close", function () {
                console.error("Connection closed");
            });


            connection.createChannel(function (error1, channel) {
                if (error1) {
                    reject(error0);
                }
                const queue = 'Tracking.Relay.TrackingData';

                channel.assertQueue(queue, {
                    durable: true, arguments: {
                        'x-queue-type': 'quorum'
                    }
                });
                channel.prefetch(1);
                console.log(
                    "Waiting for message in " +
                    queue
                );
                channel.consume(
                    queue,
                    async function (msg: any) {
                        resolve(msg);
                        try {
                            if (msg == null && msg.content == null) {
                                const testMessage = JSON.parse(msg.content.toString());
                                channel.nack(msg);
                            }

                            var result = await _rabbitService.saveTrackingData(JSON.parse(msg.content.toString()));
                            if (result != undefined && result != false && result != null && result == true)
                                channel.ack(msg); // send ack
                        }
                        catch (err) {
                            console.error("Error processing message in rabbitMQ: ", err);
                            channel.nack(msg);
                        }
                    }, {
                    noAck: false
                }
                );
            });
        });
    });
};

export const startReceiving = async (redisClient: any): Promise<void> => {
    const response = await receiveMessage(redisClient);
}
