
export default function connection(amqp, lodash, config) {

  /**
   * @var {Promise<MessageBroker>}
   */
  let instance;

  /**
   * Broker for async messaging
   */
  class MessageBroker {
    /**
     * Trigger init connection method
     */
    constructor() {
      this.queues = {}
    }

    /**
     * Initialize connection to rabbitMQ
     */
    async init() {
      this.connection = await amqp.connect(config.rabbit.uri);
      this.channel = await this.connection.createChannel();
      return this
    }

    /**
     * Send message to queue
     * @param {String} queue Queue name
     * @param {Object} msg Message as Buffer
     */
    async send(queue, msg) {
      if (!this.connection) {
        await this.init();
      }
      await this.channel.assertQueue(queue, {
        durable: true, arguments: {
          'x-queue-type': 'quorum'
        }
      });
      this.channel.sendToQueue(queue, msg)
    }

    /**
     * @param {String} queue Queue name
     * @param {Function} handler Handler that will be invoked with given message and acknowledge function (msg, ack)
     */
    async subscribe(queue, handler) {
      if (!this.connection) {
        await this.init();
      }
      if (this.queues[queue]) {
        const existingHandler = lodash.find(this.queues[queue], h => h === handler)
        if (existingHandler) {
          return () => this.unsubscribe(queue, existingHandler)
        }
        this.queues[queue].push(handler)
        return () => this.unsubscribe(queue, handler)
      }

      await this.channel.assertQueue(queue, {
        durable: true, arguments: {
          'x-queue-type': 'quorum'
        }
      });
      this.queues[queue] = [handler]
      this.channel.consume(
        queue,
        async (msg) => {
          const ack = lodash.once(() => this.channel.ack(msg))
          this.queues[queue].forEach(h => h(msg, ack))
        }
      );
      return () => this.unsubscribe(queue, handler)
    }

    async unsubscribe(queue, handler) {
      lodash.pull(this.queues[queue], handler)
    }
  }

  /**
   * @return {Promise<MessageBroker>}
   */
  MessageBroker.getInstance = async function () {
    if (!instance) {
      const broker = new MessageBroker();
      instance = broker.init()
    }
    return instance;
  };

  const createRabbitClient = function createRabbitClient() {
    return MessageBroker;
  };

  return {
    createRabbitClient
  };
}
