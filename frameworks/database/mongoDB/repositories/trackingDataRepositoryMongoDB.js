import TrackingDataModel from '../models/trackingData.js';
import moment from 'moment'


// move it to a proper place
function omit(obj, ...props) {
  const result = { ...obj };
  props.forEach((prop) => delete result[prop]);
  return result;
}

export default function trackingDataRepositoryMongoDB() {
  const findAll = async (params) =>
    await TrackingDataModel.find(omit(params, 'page', 'perPage'))
      .skip(params.perPage * params.page - params.perPage)
      .limit(params.perPage);

  const countAll = async (params) =>
    await TrackingDataModel.countDocuments(omit(params, 'page', 'perPage'));

  const findById = async (id) => await TrackingDataModel.findById(id);

  const addRange = async (trackingDataEntities) => {
    var dateFormat = moment().format('YYYY-MM-DD HH:mm:ss');
    return await TrackingDataModel.insertMany(trackingDataEntities)
      .then(result => {
        console.log('Locations Inserted:', result.length, ` IMEI: ${trackingDataEntities[0].imei}`, ` Date: ${dateFormat}`);
      })
      .catch(err => {
        console.error('Error Inserting Locations:', err);
      })
  };

  const updateByCodeSuccessSent = (code) => {
    updateByCode({
      $set: {
        sent: true
      }
    });
  }

  const updateByCodeFailedSent = (code) => {
    updateByCode({
      $set: {
        sent: false
      },
      $inc: {
        numSendingAttempts: 1
      }
    });
  }

  const updateByCode = async (code, query) => {
    return await TrackingDataModel.findOneAndUpdate(
      { code: code },
      query,
      { new: true }
    );
  };

  const deleteManyByCustomerIdAndSentIsTrue = (customerId) => {
    deleteManyByQuery({
      sent: true,
      customerId: customerId
    });
  }

  const deleteManyByCustomerIdAndSentIsTrueAndTrafficDate = (customerId, allowDate) => {
    deleteManyByQuery({
      sent: true,
      customerId: customerId,
      TrafficDate: { $lte: allowDate }

    });
  }

  const deleteManyByQuery = async (query) => {
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
    updateByCodeSuccessSent,
    updateByCodeFailedSent
  };
}



