
export default async function consumers(rabbitMq, config) {

    const trackingRelayQueue = config.rabbit.trackingRelayQueue;

    console.log('Ready for Consume messages in the %s queue...', trackingRelayQueue);
    rabbitMq.getInstance()
        .then(broker => {
            broker.subscribe(trackingRelayQueue, async (msg, ack) => {
                console.log(`Read Message...`)
                // await trackingService.HandleDeviceReceiveData(JSON.parse(msg.content.toString()));
               // ack()
            })
        })

}





