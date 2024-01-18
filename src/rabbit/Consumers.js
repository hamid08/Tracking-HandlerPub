const rabbit = require('./RabbitMQ')

const trackingService = require('../services/trackingService');


 


console.log('Ready for Consume messages in the %s queue...', process.env.TRACKINGRELAY_QUEUE);

rabbit.getInstance()
    .then(broker => {
        broker.subscribe(process.env.TRACKINGRELAY_QUEUE, async (msg, ack) => {
            await trackingService.HandleDeviceReceiveData(JSON.parse(msg.content.toString()));
             ack()
        })
    })


