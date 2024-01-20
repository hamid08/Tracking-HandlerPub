"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function connection(amqp, lodash, config) {
    /**
     * @var {Promise<MessageBroker>}
     */
    let instance;
    /**
     * Broker for async messaging
     */
    class MessageBroker {
        constructor() {
            this.queues = {};
            this.connection = null;
            this.channel = null;
        }
        /**
         * Initialize connection to rabbitMQ
         */
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                this.connection = yield amqp.connect(config.rabbit.uri);
                this.channel = yield this.connection.createChannel();
                return this;
            });
        }
        /**
         * Send message to queue
         * @param {String} queue Queue name
         * @param {Object} msg Message as Buffer
         */
        send(queue, msg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.connection) {
                    yield this.init();
                }
                yield this.channel.assertQueue(queue, {
                    durable: true, arguments: {
                        'x-queue-type': 'quorum'
                    }
                });
                this.channel.sendToQueue(queue, msg);
            });
        }
        /**
         * @param {String} queue Queue name
         * @param {Function} handler Handler that will be invoked with given message and acknowledge function (msg, ack)
         */
        subscribe(queue, handler) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.connection) {
                    yield this.init();
                }
                if (this.queues[queue]) {
                    const existingHandler = lodash.find(this.queues[queue], (h) => h === handler);
                    if (existingHandler) {
                        return () => this.unsubscribe(queue, existingHandler);
                    }
                    this.queues[queue].push(handler);
                    return () => this.unsubscribe(queue, handler);
                }
                yield this.channel.assertQueue(queue, {
                    durable: true, arguments: {
                        'x-queue-type': 'quorum'
                    }
                });
                this.queues[queue] = [handler];
                this.channel.consume(queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                    const ack = lodash.once(() => this.channel.ack(msg));
                    this.queues[queue].forEach((h) => h(msg, ack));
                }));
                return () => this.unsubscribe(queue, handler);
            });
        }
        unsubscribe(queue, handler) {
            return __awaiter(this, void 0, void 0, function* () {
                lodash.pull(this.queues[queue], handler);
            });
        }
    }
    /**
     * @return {Promise<MessageBroker>}
     */
    MessageBroker.getInstance = function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!instance) {
                const broker = new MessageBroker();
                instance = broker.init();
            }
            return instance;
        });
    };
    const createRabbitClient = function createRabbitClient() {
        return MessageBroker;
    };
    return {
        createRabbitClient
    };
}
exports.default = connection;
