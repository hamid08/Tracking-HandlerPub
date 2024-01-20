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
function connection(redis, config) {
    const createRedisClient = function createRedisClient() {
        const client = redis.createClient({
            url: config.redis.uri
        });
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                var isOpen = client.isOpen;
                if (!isOpen) {
                    yield client.connect();
                }
            }
            catch (err) {
                console.log(err);
            }
        }))();
        return client;
    };
    createRedisClient().on('connect', () => {
        console.log('Connected to Redis!');
    });
    createRedisClient().on("error", (err) => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                var isOpen = createRedisClient().isOpen;
                if (!isOpen) {
                    yield createRedisClient().connect();
                }
            }
            catch (err) {
                console.log(err);
            }
        }))();
        console.log(`Redis Error:${err}`);
    });
    // Close the connection when there is an interrupt sent from keyboard
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);
    function cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            createRedisClient().quit();
            console.log('redis client quit');
        });
    }
    return {
        createRedisClient
    };
}
exports.default = connection;
