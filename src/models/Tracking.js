const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const metaData = new Schema({
    Key: String,
    Value: String
}, { _id : false });

const trackingDataSchema = new mongoose.Schema({
    Code: String,
    CustomerId: String,
    InsertDate: Date,
    TrafficDate: { type: Date, required: true },
    IMEI: String,
    PositionStatus: { type: Boolean, default: false },
    Altitude: Number,
    Angle: Number,
    Latitude: Number,
    Longitude: Number,
    SatelliteCount: Number,
    Speed: Number,
    HDOP: { type: Number, required: false },
    GsmSignal: { type: Number, required: false },
    Odometer: { type: Number, required: false },
    NumSendingAttempts: { type: Number, required: false, default: 0 },
    Sent: { type: Boolean, default: false },
    MetaData: [metaData],
});

trackingDataSchema.index({ TrafficDate: 1 }, { unique: true });

module.exports = mongoose.model('TrackingData', trackingDataSchema, 'TrackingData');