import trackingDataRepositoryMongoDB from '../../frameworks/database/mongoDB/repositories/trackingDataRepositoryMongoDB';

export default function socketService() {

    async function HandleSocketResponse(data:any) {
        if (data == null) return;

        try {
            const _mongoRepository = trackingDataRepositoryMongoDB();
            const { acceptList, rejectList } = data;

            await _mongoRepository.updateManyByCodeSuccessSent(acceptList);
            await _mongoRepository.updateManyByCodeFailedSent(rejectList);
        }
        catch (err) {
            console.log(err)
        }
    }

    return {
        HandleSocketResponse
    }
}