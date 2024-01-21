import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MetaDataSchema = new Schema({
    key: String,
    value: String
}, { _id: false });

const TrackingDataSchema = new Schema({
    code: {
        type: String,
        unique: true,
        index: true
    },
    customerId: {
        type: String,
        index: true
    },
    insertDate: {
        type: Date,
        default: Date.now
    },
    trafficDate: {
        type: Date,
        required: true,
        index: true
    },
    imei: {
        type: String,
        required: true,
        index: true
    },
    positionStatus: {
        type: Boolean,
        default: false
    },
    altitude: Number,
    angle: Number,
    latitude: Number,
    longitude: Number,
    satelliteCount: Number,
    speed: Number,
    hdop: {
        type: Number,
        required: false
    },
    gsmSignal: {
        type: Number,
        required: false
    },
    odometer: {
        type: Number,
        required: false
    },
    numSendingAttempts: {
        type: Number,
        required: false,
        default: 0,
        index: true
    },
    sent: {
        type: Boolean,
        default: false,
        index: true
    },
    metaData: [MetaDataSchema],
});


TrackingDataSchema.index({ sent: 1, customerId: 1 });

const TrackingDataModel = mongoose.model('TrackingData', TrackingDataSchema, 'TrackingData');

// const createIndexes = async () => {
//     try {
//         await TrackingDataModel.createIndexes();
//         console.log('Indexes created successfully');
//     } catch (err) {
//         console.error('Error creating indexes:', err);
//     }
// };

// createIndexes();

export default TrackingDataModel;