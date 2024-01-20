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
const trackingDataRepositoryMongoDB_1 = __importDefault(require("../../frameworks/database/mongoDB/repositories/trackingDataRepositoryMongoDB"));
function socketService() {
    function HandleSocketResponse(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data == null)
                return;
            try {
                const _mongoRepository = (0, trackingDataRepositoryMongoDB_1.default)();
                const { acceptList, rejectList } = data;
                yield _mongoRepository.updateManyByCodeSuccessSent(acceptList);
                yield _mongoRepository.updateManyByCodeFailedSent(rejectList);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    return {
        HandleSocketResponse
    };
}
exports.default = socketService;
