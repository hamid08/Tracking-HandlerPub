"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};
function generator() {
    function generateUniqueCode() {
        return `${crypto_1.default.randomBytes(6).toString('hex').toUpperCase()}${Date.now()}`;
    }
    return {
        generateUniqueCode,
    };
}
exports.default = generator;
