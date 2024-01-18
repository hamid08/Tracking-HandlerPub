const crypto = require('crypto');
const url = require('url');

function generateUniqueCode() {
    return `${crypto.randomBytes(6).toString('hex').toUpperCase()}${Date.now()}`;
}

function isValidUrl(string) {
    try {
        new URL(string);
    } catch (_) {
        return false;
    }
    return true;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }


module.exports = {
    generateUniqueCode,isValidUrl
};