import trackingDataRepositoryRedis from '../../frameworks/database/redis/trackingDataRepository';
import trackingDataRepositoryMongoDB from '../../frameworks/database/mongoDB/repositories/trackingDataRepository';
import generator from '../utils/generator.js'
import trackingDataModel from '../../entities/trackingData';
import webSocket from '../../frameworks/services/socket/connection';


function createTrackingDataModel(element: any, trackerInfo: any) {
    const uniqCode = generator().generateUniqueCode();

    return trackingDataModel(
        uniqCode,
        element.altitude,
        element.angle,
        trackerInfo.CustomerId,
        element.gsmSignal,
        element.hdop,
        element.imei,
        element.latitude,
        element.longitude,
        element.metaData,
        0,
        element.odometer,
        element.positionStatus,
        element.satelliteCount,
        false,
        element.speed,
        element.trafficDate
    );

}

export default function rabbitService() {

    async function saveTrackingData(data: any) {

        try {
            const _redisRepository = trackingDataRepositoryRedis();
            const _mongoRepository = trackingDataRepositoryMongoDB();
            const _webSocket = webSocket();

            //Check Is Not Null Locations
            if (data == null || data.locations.length < 1) return false;

            //CheckIMEI For Save
            var trackerInfo = await _redisRepository.getDevice(data.latestLocation.imei);
            if (trackerInfo == null || trackerInfo == undefined) return false;

            const newTrackingDataList: any[] = [];
            data.locations.forEach((element: any) => {

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
                }

                newTrackingDataList.push(newTrackingData);
            })

            try {
                await _mongoRepository.addRange(newTrackingDataList);
            } catch (err) {
                console.error(err);
                return false;
            }

            try {
                await _webSocket.sendLocationsToCustomer(newTrackingDataList, data.latestLocation, trackerInfo.CustomerId);
            } catch (err) {
                console.error(err);
                return false;
            }

            return true;

        }
        catch (err) {
            console.log(err)
            return false;
        }

    }

    return {
        saveTrackingData
    }
}
