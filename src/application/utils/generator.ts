import crypto from 'crypto';

declare global {
 interface Date {
    addDays(days: number): Date;
 }
}

Date.prototype.addDays = function (days: number) {
 const date = new Date(this.valueOf());
 date.setDate(date.getDate() + days);
 return date;
};

export default function generator() {
 function generateUniqueCode() {
    return `${crypto.randomBytes(6).toString('hex').toUpperCase()}${Date.now()}`;
 }

 return {
    generateUniqueCode,
 };
}