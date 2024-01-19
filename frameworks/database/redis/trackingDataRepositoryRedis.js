export default function TrackingDataRepositoryRedis(redisClient) {

  async function getDevice(imei) {
    const trackerInfoRedis = await redisClient.hGetAll(`Device_${imei}`);
    if (trackerInfoRedis == null || trackerInfoRedis == undefined)
      return null;

    try {
      const trackerInfo = JSON.parse(trackerInfoRedis.data);
      return trackerInfo;
    }
    catch (err) {
      console.log(`Not Found Device_${imei} In Redis`)
      return null;
    }

  };

  return {
    getDevice
  }
}
