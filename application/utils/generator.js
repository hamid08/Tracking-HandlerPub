import crypto from 'crypto'

export default function generator() {
    function generateUniqueCode() {
        return `${crypto.randomBytes(6).toString('hex').toUpperCase()}${Date.now()}`;
    }


    Date.prototype.addDays = function (days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }


    return {
        generateUniqueCode
    }

}