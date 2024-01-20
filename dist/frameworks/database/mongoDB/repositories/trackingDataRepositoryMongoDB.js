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
const trackingData_js_1 = __importDefault(require("../models/trackingData.js"));
const moment_1 = __importDefault(require("moment"));
function omit(obj, ...props) {
    const result = Object.assign({}, obj);
    props.forEach((prop) => delete result[prop]);
    return result;
}
function trackingDataRepositoryMongoDB() {
    const findAll = (params) => __awaiter(this, void 0, void 0, function* () {
        return yield trackingData_js_1.default
            .find(omit(params, 'page', 'perPage'))
            .skip(params.perPage * params.page - params.perPage)
            .limit(params.perPage);
    });
    const countAll = (params) => __awaiter(this, void 0, void 0, function* () {
        return yield trackingData_js_1.default
            .countDocuments(omit(params, 'page', 'perPage'));
    });
    const findById = (id) => __awaiter(this, void 0, void 0, function* () {
        return yield trackingData_js_1.default
            .findById(id);
    });
    const addRange = (trackingDataEntities) => __awaiter(this, void 0, void 0, function* () {
        var dateFormat = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        return yield trackingData_js_1.default
            .insertMany(trackingDataEntities)
            .then(result => {
            console.log(`Locations Inserted:${result.length}, IMEI: ${trackingDataEntities[0].imei}, Date: ${dateFormat}`);
        }).catch(err => { console.error('Error Inserting Locations:', err); });
    });
    const updateManyByCodeSuccessSent = (codeList) => __awaiter(this, void 0, void 0, function* () {
        yield updateManyByCode(codeList, { $set: { sent: true } });
    });
    const updateManyByCodeFailedSent = (codeList) => __awaiter(this, void 0, void 0, function* () {
        yield updateManyByCode(codeList, { $set: { sent: false }, $inc: { numSendingAttempts: 1 } });
    });
    const updateManyByCode = (codeList, query) => __awaiter(this, void 0, void 0, function* () {
        var dateFormat = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        return yield trackingData_js_1.default
            .updateMany({ code: { $in: codeList } }, query)
            .exec()
            .then(result => {
            console.log(`*** Socket Response *** ===> Update Tracking Data Status Successfully Completed!`, dateFormat);
        })
            .catch(err => {
            console.log(`*** Socket Response *** ===> Update Tracking Data Status Failed!`, err);
        });
    });
    const deleteManyByCustomerIdAndSentIsTrue = (customerId) => __awaiter(this, void 0, void 0, function* () {
        yield deleteManyByQuery({ sent: true, customerId: customerId });
    });
    const deleteManyByCustomerIdAndSentIsTrueAndTrafficDate = (customerId, allowDate) => __awaiter(this, void 0, void 0, function* () {
        yield deleteManyByQuery({
            sent: true,
            customerId: customerId,
            TrafficDate: { $lte: allowDate }
        });
    });
    const deleteManyByQuery = (query) => __awaiter(this, void 0, void 0, function* () {
        var dateFormat = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        yield trackingData_js_1.default.deleteMany(query).exec()
            .then(result => {
            console.log(`*** Run Delete Job *** ===> Remove Tracking Data Successfully Completed!`, dateFormat);
        })
            .catch(err => {
            console.log(`*** Run Delete Job *** ===> Remove Tracking Data Failed!`, err);
        });
    });
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
exports.default = trackingDataRepositoryMongoDB;
