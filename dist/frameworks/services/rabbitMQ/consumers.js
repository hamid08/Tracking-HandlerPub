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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rabbitService_js_1 = __importDefault(require("../../../application/services/rabbitService.js"));
function consumers(rabbitMq, redisClient, config) {
    var _rabbitService = (0, rabbitService_js_1.default)(redisClient);
    const trackingRelayQueue = config.rabbit.trackingRelayQueue;
    try {
        console.log('Ready for Consume messages in the %s queue...', trackingRelayQueue);
        rabbitMq.getInstance()
            .then((broker) => {
            broker.subscribe(trackingRelayQueue, (msg, ack) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (msg == null && msg.content == null) {
                        const testMessage = JSON.parse(msg.content.toString());
                        return;
                    }
                    var result = yield _rabbitService.saveTrackingData(JSON.parse(msg.content.toString()));
                    if (result != undefined && result != false && result != null && result == true)
                        ack();
                }
                catch (err) {
                    return;
                }
            }));
        });
    }
    catch (err) {
        console.log(err);
    }
}
exports.default = consumers;
