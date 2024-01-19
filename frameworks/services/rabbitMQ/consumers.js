import rabbitService from '../../../application/services/rabbitService.js';



export default function consumers(rabbitMq, redisClient, config) {

    var _rabbitService = rabbitService(redisClient);
    const trackingRelayQueue = config.rabbit.trackingRelayQueue;

    console.log('Ready for Consume messages in the %s queue...', trackingRelayQueue);
    rabbitMq.getInstance()
        .then(broker => {
            broker.subscribe(trackingRelayQueue, async (msg, ack) => {
                var result = await _rabbitService.saveTrackingData(JSON.parse(msg.content.toString()));
                if (result != undefined && result != false && result != null && result == true)
                    ack()
            })
        })

}





