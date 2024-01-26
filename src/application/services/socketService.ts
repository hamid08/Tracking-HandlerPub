import trackingDataRepositoryMongoDB from '../../frameworks/database/mongoDB/repositories/trackingDataRepository';

export default function socketService() {

    async function HandleSocketResponse(data: any) {
        if (data == null) return;

        try {
            const _mongoRepository = trackingDataRepositoryMongoDB();
            const { acceptList, rejectList } = data;

            if (rejectList != null && rejectList != '')
                await _mongoRepository.updateManyByCodeFailedSent(rejectList);


            if (acceptList != null && acceptList != '')
                await _mongoRepository.updateManyByCodeSuccessSent(acceptList);
        }
        catch (err) {
            console.log(err)
        }
    }

    return {
        HandleSocketResponse
    }
}