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
const socketService_js_1 = __importDefault(require("../../../application/services/socketService.js"));
let customerSockets = {};
function connection() {
    const _socketService = (0, socketService_js_1.default)();
    function trySocket(io) {
        return __awaiter(this, void 0, void 0, function* () {
            io.on('connection', (socket) => {
                socket.emit('authenticated');
                // Get the user's ID from the socket handshake data.
                var customerId = socket.handshake.query.customerId;
                // Store the reference to this socket by the user's ID.
                customerSockets[customerId] = socket;
                console.log('customer ' + customerId + ' Socket connected');
                socket.on('disconnect', () => {
                    // Remove the reference to this socket when the user disconnects.
                    delete customerSockets[customerId];
                    console.log('customer ' + customerId + ' Socket disconnected');
                });
                //Customer Event Response
                socket.on('trackingResponse', (data) => __awaiter(this, void 0, void 0, function* () {
                    yield _socketService.HandleSocketResponse(data);
                }));
            });
        });
    }
    function sendLocationsToCustomer(locations, latestLocation, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (customerSockets[customerId]) {
                customerSockets[customerId].emit('receiveTrackingData', { locations, latestLocation });
            }
            else {
                console.log('customer ' + customerId + ' not found connection');
            }
        });
    }
    return {
        sendLocationsToCustomer,
        trySocket
    };
}
exports.default = connection;
