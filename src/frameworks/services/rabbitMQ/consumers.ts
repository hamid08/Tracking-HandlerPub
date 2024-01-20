import rabbitService from '../../../application/services/rabbitService.js';



export default function consumers(rabbitMq:any, redisClient:any, config:any) {

    var _rabbitService = rabbitService(redisClient);
    const trackingRelayQueue = config.rabbit.trackingRelayQueue;
    try {
        console.log('Ready for Consume messages in the %s queue...', trackingRelayQueue);
        rabbitMq.getInstance()
            .then((broker: { subscribe: (arg0: any, arg1: (msg: any, ack: any) => Promise<void>) => void; }) => {
                broker.subscribe(trackingRelayQueue, async (msg, ack) => {
                    var result = await _rabbitService.saveTrackingData(JSON.parse(msg.content.toString()));
                    if (result != undefined && result != false && result != null && result == true)
                        ack()
                })
            })
    }
    catch (err) {
        console.log(err)
    }
}





