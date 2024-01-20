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
const terminus_1 = require("@godaddy/terminus");
function serverConfig(app, mongoose, serverInit, config) {
    function healthCheck() {
        // ERR_CONNECTING_TO_MONGO
        if (mongoose.connection.readyState === 0 ||
            mongoose.connection.readyState === 3) {
            return Promise.reject(new Error('Mongoose has disconnected'));
        }
        // CONNECTING_TO_MONGO
        if (mongoose.connection.readyState === 2) {
            return Promise.reject(new Error('Mongoose is connecting'));
        }
        // CONNECTED_TO_MONGO
        return Promise.resolve();
    }
    function onSignal() {
        console.log('server is starting cleanup');
        return new Promise((resolve, reject) => {
            mongoose
                .disconnect(false)
                .then(() => {
                console.info('Mongoose has disconnected');
                resolve();
            })
                .catch(reject);
        });
    }
    function beforeShutdown() {
        return new Promise((resolve) => {
            setTimeout(resolve, 15000);
        });
    }
    function onShutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('cleanup finished, server is shutting down');
        });
    }
    function startServer() {
        (0, terminus_1.createTerminus)(serverInit, {
            logger: console.log,
            signal: 'SIGINT',
            healthChecks: {
                '/healthcheck': healthCheck
            },
            onSignal,
            onShutdown,
            beforeShutdown
        }).listen(config.port, config.ip, () => {
            console.log('Express server listening on http://%s:%d, in %s mode', config.ip, config.port, app.get('env'));
        });
    }
    return {
        startServer
    };
}
exports.default = serverConfig;
