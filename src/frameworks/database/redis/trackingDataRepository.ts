import redisConnection from "./connection";


export default function TrackingDataRepositoryRedis() {

  if (!redisConnection.connection)
    redisConnection.connect();
  const redisClient = redisConnection.connection;

  async function getDevice(imei: any) {
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

  async function getAllCustomer() {
    const customerInfoRedis = await redisClient.hGetAll(`Customers`);
    if (customerInfoRedis == null || customerInfoRedis == undefined)
      return null;

    try {
      const trackerInfo = JSON.parse(customerInfoRedis.data);
      return trackerInfo;
    }
    catch (err) {
      console.log(`Not Found Customer In Redis`)
      return null;
    }

  };



  return {
    getDevice,
    getAllCustomer
  }
}
