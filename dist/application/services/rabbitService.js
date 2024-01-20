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
const trackingDataRepositoryRedis_1 = __importDefault(require("../../frameworks/database/redis/trackingDataRepositoryRedis"));
const trackingDataRepositoryMongoDB_1 = __importDefault(require("../../frameworks/database/mongoDB/repositories/trackingDataRepositoryMongoDB"));
const generator_js_1 = __importDefault(require("../utils/generator.js"));
const trackingData_1 = __importDefault(require("../../entities/trackingData"));
const connection_1 = __importDefault(require("../../frameworks/services/socket/connection"));
function createTrackingDataModel(element, trackerInfo) {
    const uniqCode = (0, generator_js_1.default)().generateUniqueCode();
    return (0, trackingData_1.default)(uniqCode, element.altitude, element.angle, trackerInfo.CustomerId, element.gsmSignal, element.hdop, element.imei, element.latitude, element.longitude, element.metaData, 0, element.odometer, element.positionStatus, element.satelliteCount, false, element.speed, element.trafficDate);
}
function rabbitService(redisClient) {
    function saveTrackingData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _redisRepository = (0, trackingDataRepositoryRedis_1.default)(redisClient);
                const _mongoRepository = (0, trackingDataRepositoryMongoDB_1.default)();
                const _webSocket = (0, connection_1.default)();
                //Check Is Not Null Locations
                if (data == null || data.locations.length < 1)
                    return;
                //CheckIMEI For Save
                var trackerInfo = yield _redisRepository.getDevice(data.latestLocation.imei);
                if (trackerInfo == null || trackerInfo == undefined)
                    return false;
                const newTrackingDataList = [];
                data.locations.forEach((element) => {
                    const trackingDataEntity = createTrackingDataModel(element, trackerInfo);
                    var newTrackingData = {
                        code: trackingDataEntity.getCode(),
                        altitude: trackingDataEntity.getAltitude(),
                        angle: trackingDataEntity.getAngle(),
                        customerId: trackingDataEntity.getCustomerId(),
                        gsmSignal: trackingDataEntity.getGsmSignal(),
                        hdop: trackingDataEntity.getHDOP(),
                        imei: trackingDataEntity.getIMEI(),
                        latitude: trackingDataEntity.getLatitude(),
                        longitude: trackingDataEntity.getLongitude(),
                        metaData: trackingDataEntity.getMetaData(),
                        numSendingAttempts: trackingDataEntity.getNumSendingAttempts(),
                        odometer: trackingDataEntity.getOdometer(),
                        positionStatus: trackingDataEntity.getPositionStatus(),
                        satelliteCount: trackingDataEntity.getSatelliteCount(),
                        sent: trackingDataEntity.getSent(),
                        speed: trackingDataEntity.getSpeed(),
                        trafficDate: trackingDataEntity.getTrafficDate(),
                        // just For send
                        deviceIdentity: trackerInfo.DeviceIdentity,
                        deviceTerminalNo: trackerInfo.DeviceTerminalNo,
                        customerTerminalNo: trackerInfo.CustomerTerminalNo,
                    };
                    newTrackingDataList.push(newTrackingData);
                });
                yield _mongoRepository.addRange(newTrackingDataList);
                yield _webSocket.sendLocationsToCustomer(newTrackingDataList, data.latestLocation, trackerInfo.CustomerId);
                return true;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    return {
        saveTrackingData
    };
}
exports.default = rabbitService;
