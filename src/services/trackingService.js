const Tracking = require('../models/Tracking');
const createError = require('http-errors')
const generator = require('../../application/utils/generator')
const socketServer = require('../sockets/socket');
var redisClient = require('../helpers/init_redis')
var moment = require('moment');


async function GetAllTracking(customerId, page, itemsPerPage) {
  page = page == '' || page == null || page == undefined ? 1 : page;
  itemsPerPage = itemsPerPage == '' || itemsPerPage == null || itemsPerPage == undefined ? 10 : itemsPerPage;


  var result = await Tracking.find({ CustomerId: customerId })
    .skip((page - 1) * itemsPerPage)
    .limit(itemsPerPage)
    .exec();

  const trackingList = result.map(tracking => ({
    TrafficDate: tracking.TrafficDate,
    IMEI: tracking.IMEI,
    Latitude: tracking.Latitude,
    Longitude: tracking.Longitude,
    Speed: tracking.Speed,
    Altitude: tracking.Altitude,
    PositionStatus: tracking.PositionStatus,
    SatelliteCount: tracking.Satellites,
    Angle: tracking.Angle,
    HDOP: tracking.HDOP,
    GsmSignal: tracking.GsmSignal,
    Odometer: tracking.Odometer,
    MetaData: tracking.MetaData,
    Code: tracking.Code
  }));



  return trackingList;
}



async function HandleMobileReceiveData(data) {

  const { imei, Data } = data;

  //Check Is Not Null Locations
  if (Data == null || Data.length < 1) return;


  //CheckIMEI For Save
  var trackerInfo = await GetImeiFromRedis(imei);
  if (trackerInfo == null || trackerInfo == undefined) return;


  var locations = GenerateLocationsByMobileData(Data, imei);

  //Check Repeat Locations
  var validLocations = await GetValidLocationsByTrafficDate(locations);


  //SaveLocation
  var locationsForSend = await SaveAllLocations(validLocations, trackerInfo);

  if (locationsForSend.length < 1 || locationsForSend == undefined || locationsForSend == null) return;

  //Sort
  locationsForSend.sort((a, b) => new Date(b.TrafficDate) - new Date(a.TrafficDate));


  //SendLocationsToCustomer
  await socketServer.SendLocationsToCustomer(locationsForSend, locationsForSend[0]);

}


function GenerateLocationsByMobileData(data, imei) {

  var locations = [];

  data.forEach((element) => {

    var location = {
      trafficDate: new Date(1000 * element.timeStamp),
      imei: imei,
      latitude: element.lat,
      longitude: element.long,
      speed: element.speed,
      altitude: element.altitude,
      satelliteCount: element.sateliteCount,
      angle: element.angle,
    };

    locations.push(location);
  })

  return locations;

}


async function HandleDeviceReceiveData(data) {

  //Check Is Not Null Locations
  if (data == null || data.locations.length < 1) return;

  //CheckIMEI For Save
  var trackerInfo = await GetImeiFromRedis(data.latestLocation.imei);
  if (trackerInfo == null || trackerInfo == undefined) return;

  //Check Repeat Locations
  var validLocations = await GetValidLocationsByTrafficDate(data.locations);


  //SaveLocation
  var locationsForSend = await SaveAllLocations(validLocations, trackerInfo);

  if (locationsForSend.length < 1 || locationsForSend == undefined || locationsForSend == null) return;

  //SendLocationsToCustomer
  await socketServer.SendLocationsToCustomer(locationsForSend, data.latestLocation, trackerInfo.CustomerId);

}

async function SaveAllLocations(locations, trackerInfo) {

  var imei = '';
  var listTrackingModel = [];
  var listTrackingModelForSend = [];


  locations.forEach((element) => {

    imei = element.imei;
    var unitCode = generator.generateUniqueCode();


    var model = new Tracking({
      InsertDate: Date.now(),
      TrafficDate: element.trafficDate,
      IMEI: element.imei,
      Latitude: element.latitude,
      Longitude: element.longitude,
      Speed: element.speed,
      Altitude: element.altitude,
      PositionStatus: element.positionStatus,
      SatelliteCount: element.satelliteCount,
      Angle: element.angle,
      HDOP: element.hdop,
      GsmSignal: element.gsmSignal,
      Odometer: element.odometer,
      MetaData: element.metaData,
      CustomerId: trackerInfo.CustomerId,
      Code: unitCode
    });

    listTrackingModel.push(model);

    var modelForSend = {
      TrafficDate: element.trafficDate,
      IMEI: element.imei,
      Latitude: element.latitude,
      Longitude: element.longitude,
      Speed: element.speed,
      Altitude: element.altitude,
      PositionStatus: element.positionStatus,
      SatelliteCount: element.satelliteCount,
      Angle: element.angle,
      HDOP: element.hdop,
      GsmSignal: element.gsmSignal,
      Odometer: element.odometer,
      MetaData: element.metaData,
      Code: unitCode,
      DeviceIdentity: trackerInfo.DeviceIdentity,
      DeviceTerminalNo: trackerInfo.DeviceTerminalNo,
      CustomerTerminalNo: trackerInfo.CustomerTerminalNo,
    };



    listTrackingModelForSend.push(modelForSend);
  });

  if (listTrackingModel.length < 1 || listTrackingModel == null) return listTrackingModelForSend;

  var dateFormat = moment().format('YYYY-MM-DD HH:mm:ss');

  await Tracking.insertMany(listTrackingModel)
    .then(result => {
      console.log('Locations inserted:', result.length, ` IMEI: ${imei}`, ` Date: ${dateFormat}`);
    })
    .catch(err => {
      console.error('Error inserting locations:', err);
    })
    .finally(() => {
      console.error(`------------------------------------------------------------------------------`);
    });

  return listTrackingModelForSend;

}


async function GetValidLocationsByTrafficDate(locations) {
  let uniqueTrafficDate = [];
  let uniqueLocations = [];


  //Check In Memory
  locations.forEach(item => {
    if (!uniqueTrafficDate.includes(item.trafficDate)) {
      uniqueTrafficDate.push(item.trafficDate);
      uniqueLocations.push(item);
    }
  });

  if (uniqueLocations.length < 1) return uniqueLocations;

  //Check In MongoDb
  uniqueLocations.forEach(async item => {
    var trackingInDb = await GetTrackingByTrafficDate(item.trafficDate);
    if (trackingInDb != null || trackingInDb != undefined) {
      uniqueLocations = uniqueLocations.filter(c => c !== item);
    }
  });
  return uniqueLocations;

}

async function GetTrackingByTrafficDate(trafficDate) {
  var trackingInDb = await Tracking.findOne({ TrafficDate: trafficDate }).exec();

  return trackingInDb;
}

async function GetImeiFromRedis(imei) {


  try {
    const trackerInfoRedis = await redisClient.hGetAll(`Device_${imei}`);
    var isOpen = redisClient.isOpen;
    if (!isOpen) {
      console.warn("redis connection is close!");
      return null;
    }
    if (trackerInfoRedis == null || trackerInfoRedis == undefined) return null;

    const trackerInfo = JSON.parse(trackerInfoRedis.data);

    if (trackerInfo == null || trackerInfo == undefined || trackerInfo.CustomerId == '') return null;

    return trackerInfo;
  }
  catch (err) {
    console.log(`not found Device_${imei} in redis`)
    return null;
  }
}

async function GetAllCustomerFromRedis() {
  const customerInfoRedis = await redisClient.hGetAll(`Customers`);
  const customerInfo = JSON.parse(customerInfoRedis.data);


  if (customerInfo == null || customerInfo == undefined) return null;

  return customerInfo;
}


//Job
async function HandleTrackingJob() {

  //For Remove Old Data
  var customers = await GetAllCustomerFromRedis();

  if (customers.length >= 1 || customers == null || customers == undefined) {
    customers.forEach(async (customer) => {
      await RemoveTrackingSentIsTrue(customer);
    })
  }

  //For resend Data
  await ResendTrackingSentIsFalse();
}

async function ResendTrackingSentIsFalse() {
  var trackingList = await GetAllTrackingSentIsFalse();

  if (trackingList.length < 1 || trackingList == null) return;

  for (var i = 0; i < trackingList.length; i++) {
    console.log(`Resend in job!`)

    var trackerInfo = await GetImeiFromRedis(trackingList[i].IMEI);
    if (trackerInfo == null || trackerInfo == undefined) continue;


    var latestLocation = {
      trafficDate: trackingList[i].TrafficDate,
      imei: trackingList[i].IMEI,
      latitude: trackingList[i].Latitude,
      longitude: trackingList[i].Longitude,
      speed: trackingList[i].Speed,
      altitude: trackingList[i].Altitude,
      positionStatus: trackingList[i].PositionStatus,
      satelliteCount: trackingList[i].SatelliteCount,
      angle: trackingList[i].Angle,
      hdop: trackingList[i].HDOP,
      gsmSignal: trackingList[i].GsmSignal,
      odometer: trackingList[i].Odometer,
      metaData: trackingList[i].MetaData
    }

    var modelForSend = {
      TrafficDate: trackingList[i].TrafficDate,
      IMEI: trackingList[i].IMEI,
      Latitude: trackingList[i].Latitude,
      Longitude: trackingList[i].Longitude,
      Speed: trackingList[i].Speed,
      Altitude: trackingList[i].Altitude,
      PositionStatus: trackingList[i].PositionStatus,
      SatelliteCount: trackingList[i].SatelliteCount,
      Angle: trackingList[i].Angle,
      HDOP: trackingList[i].HDOP,
      GsmSignal: trackingList[i].GsmSignal,
      Odometer: trackingList[i].Odometer,
      MetaData: trackingList[i].MetaData,
      Code: trackingList[i].Code,
      DeviceIdentity: trackerInfo.DeviceIdentity,
      DeviceTerminalNo: trackerInfo.DeviceTerminalNo,
      CustomerTerminalNo: trackerInfo.CustomerTerminalNo,
    };



    await socketServer.SendLocationsToCustomer([modelForSend], latestLocation);
  }
}

async function GetAllTrackingSentIsFalse() {
  var trackings = await Tracking.find({ Sent: false, NumSendingAttempts: { $lte: 500 } }).exec();
  return trackings;
}

async function RemoveTrackingSentIsTrue(customer) {

  var defaultQuery = {
    Sent: true,
    CustomerId: customer.CustomerId
  };

  var query = defaultQuery;

  if (!customer.StoreData || customer.DataStoreDays == null || customer.DataStoreDays == 0) {
    query = defaultQuery;
  }
  else {
    var validCurrentDate = new Date().addDays(-customer.DataStoreDays)
    query = {
      Sent: true,
      CustomerId: customer.CustomerId,
      TrafficDate: { $lte: validCurrentDate }
    };

  }

  Tracking.deleteMany(query)
    .exec()
    .then(result => {
      console.log('tracking(s) data deleted in run job');
    })
    .catch(err => {
      console.error(`cannot Deleted tracking in run job`);
    });

}


module.exports = { HandleDeviceReceiveData, HandleMobileReceiveData, HandleTrackingJob, GetAllTracking };
