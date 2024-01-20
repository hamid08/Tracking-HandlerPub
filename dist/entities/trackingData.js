"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function trackingData(code, altitude, angle, customerId, gsmSignal, hdop, imei, latitude, longitude, metaData, numSendingAttempts, odometer, positionStatus, satelliteCount, sent, speed, trafficDate) {
    return {
        getCode: () => code,
        getAltitude: () => altitude,
        getAngle: () => angle,
        getCustomerId: () => customerId,
        getGsmSignal: () => gsmSignal,
        getHDOP: () => hdop,
        getIMEI: () => imei,
        getLatitude: () => latitude,
        getLongitude: () => longitude,
        getMetaData: () => metaData,
        getNumSendingAttempts: () => numSendingAttempts,
        getOdometer: () => odometer,
        getPositionStatus: () => positionStatus,
        getSatelliteCount: () => satelliteCount,
        getSent: () => sent,
        getSpeed: () => speed,
        getTrafficDate: () => trafficDate
    };
}
exports.default = trackingData;
