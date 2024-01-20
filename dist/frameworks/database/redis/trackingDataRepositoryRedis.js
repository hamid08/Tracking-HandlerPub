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
function TrackingDataRepositoryRedis(redisClient) {
    function getDevice(imei) {
        return __awaiter(this, void 0, void 0, function* () {
            const trackerInfoRedis = yield redisClient.hGetAll(`Device_${imei}`);
            if (trackerInfoRedis == null || trackerInfoRedis == undefined)
                return null;
            try {
                const trackerInfo = JSON.parse(trackerInfoRedis.data);
                return trackerInfo;
            }
            catch (err) {
                console.log(`Not Found Device_${imei} In Redis`);
                return null;
            }
        });
    }
    ;
    return {
        getDevice
    };
}
exports.default = TrackingDataRepositoryRedis;
