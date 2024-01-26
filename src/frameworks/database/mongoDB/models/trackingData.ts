import mongoose from 'mongoose';

interface IMetaData extends mongoose.Document {
    key: string,
    value: string
}


const metaDataSchema = new mongoose.Schema<IMetaData>({
    key: { type: String, required: false },
    value: { type: String, required: false },
}, { _id: false });


interface ITrackingData extends mongoose.Document{
    code: { type: string,required: true},
    customerId: {type: string,required: true},
    insertDate: { type: Date,required: true},
    trafficDate: {type: Date,required: true},
    imei: {type: string,required: true,},
    positionStatus: {type: Boolean,required: false},
    altitude: {type:Number,required: true},
    angle: {type:Number,required: true},
    latitude: {type:Number,required: true},
    longitude: {type:Number,required: true},
    satelliteCount: {type:Number,required: true},
    speed: {type:Number,required: true},
    hdop: {type: Number,required: false},
    gsmSignal: {type: Number,required: false},
    odometer: {type: Number,required: false},
    numSendingAttempts: {type: Number,required: false},
    sent: {type: Boolean, required: true},
    metaData: IMetaData[],
}

const trackingDataSchema =  new mongoose.Schema<ITrackingData>({
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
    metaData: [metaDataSchema],
});


trackingDataSchema.index({ sent: 1, customerId: 1 });

const TrackingDataModel = mongoose.model('TrackingData', trackingDataSchema, 'TrackingData');

const createIndexes = async () => {
    try {
        await TrackingDataModel.createIndexes();
        console.log('Indexes TrackingDataModel created successfully');
    } catch (err) {
        console.error('Error TrackingDataModel creating indexes:', err);
    }
};

createIndexes();

export default TrackingDataModel;