const Tracking = require('../models/Tracking');
const createError = require('http-errors')


async function HandleAckData(ackData) {
    if (ackData == null || ackData == undefined) return;

    var acceptList = [];
    var rejectList = [];

    acceptList = ackData.acceptList;
    rejectList = ackData.rejectList;

    await HandleAcceptAckData(acceptList);
    await HandleRejectAckData(rejectList);
}

async function HandleAcceptAckData(data) {
    if (data == null || data == undefined) return;

    await data.forEach(async (code) => {
        Tracking.updateOne({ Code: code },
            {
                $set: {
                    Sent: true
                }
            }).exec()
            .then(() => {
                console.log(`Tracking ${code} Sent updated successfully by Customer Response`);
            }).catch((err) => {
                if (err) {
                    throw createError.BadRequest(`خطا در بروزرسانی ارسال موفق داده ردیابی `)
                }
            });
    })

}

async function HandleRejectAckData(data) {
    if (data == null || data == undefined) return;

    await data.forEach(async (code) => {

        Tracking.updateOne({ Code: code },
            {
                $set: {
                    Sent: false
                },
                $inc: {
                    NumSendingAttempts: 1
                }
            }).exec()
            .then(() => {
                console.log(`Tracking ${code} Sent And NumSendingAttempts updated successfully  by Customer Response`);
            }).catch((err) => {
                if (err) {
                    throw createError.BadRequest(`خطا در بروزرسانی ارسال موفق داده ردیابی `)
                }
            });
    })

}

module.exports = { HandleAckData };