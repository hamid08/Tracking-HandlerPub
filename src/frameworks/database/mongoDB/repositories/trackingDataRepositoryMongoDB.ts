import TrackingDataModel from '../models/trackingData.js';
import moment from 'moment'

function omit<T extends object, K extends keyof T>(obj: T, ...props: K[]): Omit<T, K> {
  const result = { ...obj } as T;
  props.forEach((prop) => delete result[prop]);
  return result;
}

export default function trackingDataRepositoryMongoDB() {
  const findAll = async (params: any) => await TrackingDataModel
    .find(omit(params, 'page', 'perPage'))
    .skip(params.perPage * params.page - params.perPage)
    .limit(params.perPage);

  const countAll = async (params: any) => await TrackingDataModel
    .countDocuments(omit(params, 'page', 'perPage'));

  const findById = async (id: string) => await TrackingDataModel
    .findById(id);

  const addRange = async (trackingDataEntities: any[]) => {
    var dateFormat = moment().format('YYYY-MM-DD HH:mm:ss');
    return await TrackingDataModel
      .insertMany(trackingDataEntities)
      .then(result => {
        console.log(`Locations Inserted:${result.length}, IMEI: ${trackingDataEntities[0].imei}, Date: ${dateFormat}`);
      })
  };

  const updateManyByCodeSuccessSent = async (codeList: string[]) => {
    await updateManyByCode(codeList, { $set: { sent: true } });
  }

  const updateManyByCodeFailedSent = async (codeList: string[]) => {
    await updateManyByCode(codeList, { $set: { sent: false }, $inc: { numSendingAttempts: 1 } });
  }

  const updateManyByCode = async (codeList: string[], query: any) => {
    var dateFormat = moment().format('YYYY-MM-DD HH:mm:ss');
    return await TrackingDataModel
      .updateMany({ code: { $in: codeList } }, query)
      .exec()
      .then(result => {
        console.log(`*** Socket Response *** ===> Update Tracking Data Status Successfully Completed!`, dateFormat);
      })
      .catch(err => {
        console.log(`*** Socket Response *** ===> Update Tracking Data Status Failed!`, err);
      });
  };

  const deleteManyByCustomerIdAndSentIsTrue = async (customerId: string) => {
    await deleteManyByQuery({ sent: true, customerId: customerId });
  }

  const deleteManyByCustomerIdAndSentIsTrueAndTrafficDate = async (customerId: String, allowDate: Date) => {
    await deleteManyByQuery({
      sent: true,
      customerId: customerId,
      TrafficDate: { $lte: allowDate }

    });
  }

  const deleteManyByQuery = async (query: any) => {
    var dateFormat = moment().format('YYYY-MM-DD HH:mm:ss');

    await TrackingDataModel.deleteMany(query).exec()
      .then(result => {
        console.log(`*** Run Delete Job *** ===> Remove Tracking Data Successfully Completed!`, dateFormat);
      })
      .catch(err => {
        console.log(`*** Run Delete Job *** ===> Remove Tracking Data Failed!`, err);
      });
  }

  return {
    findAll,
    countAll,
    findById,
    addRange,
    deleteManyByCustomerIdAndSentIsTrue,
    deleteManyByCustomerIdAndSentIsTrueAndTrafficDate,
    updateManyByCodeSuccessSent,
    updateManyByCodeFailedSent
  };
}



