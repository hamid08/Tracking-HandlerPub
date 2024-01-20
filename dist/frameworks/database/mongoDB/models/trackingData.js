"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
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
const TrackingDataModel = mongoose_1.default.model('TrackingData', TrackingDataSchema, 'TrackingData');
const createIndexes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield TrackingDataModel.createIndexes();
        console.log('Indexes created successfully');
    }
    catch (err) {
        console.error('Error creating indexes:', err);
    }
});
createIndexes();
exports.default = TrackingDataModel;
