import trackingDataRepositoryMongoDB from '../../frameworks/database/mongoDB/repositories/trackingDataRepository';
import trackingDataRepositoryRedis from '../../frameworks/database/redis/trackingDataRepository';
import webSocket from '../../frameworks/services/socket/connection';


export default function jobService() {

    async function DeleteTrackingData() {
        try {
            const customers = await trackingDataRepositoryRedis().getAllCustomer();
            customers.forEach(async (customer: any) => {

                if (!customer.StoreData || customer.DataStoreDays == null || customer.DataStoreDays == 0) {
                    await trackingDataRepositoryMongoDB().deleteManyByCustomerIdAndSentIsTrue(customer.CustomerId);
                }
                else {
                    var allowDate = new Date().addDays(-customer.DataStoreDays);
                    await trackingDataRepositoryMongoDB().deleteManyByCustomerIdAndSentIsTrueAndTrafficDate(customer.CustomerId, allowDate);
                }
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    async function ResendTrackingData() {
        try {
            const totalItems = await trackingDataRepositoryMongoDB().countAllWithOutPagging();
            const totalPages = Math.ceil(totalItems / 10);

            for (var page = 1; page < totalPages; page++) {

                var trackingDataResend = await trackingDataRepositoryMongoDB().findAllSentFalseAndNumSendingAttempts(page, 10);
                if (trackingDataResend == null || trackingDataResend.length < 1) return;

 
                trackingDataResend.forEach(async (data) => {
                    try {
                        const locations: Array<object> = [];
                        locations.push(data);
                        await webSocket().sendLocationsToCustomer(locations, data, data.customerId);
                    } catch (err) {
                        console.error(err);
                    }
                })

            }


        }
        catch (err) {
            console.log(err)
        }
    }

    return {
        DeleteTrackingData,
        ResendTrackingData
    }
}