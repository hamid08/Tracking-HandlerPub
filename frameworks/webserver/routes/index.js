// import postRouter from './post';
// import userRouter from './user';
// import authRouter from './auth';

export default async function routes(app, express, redisClient) {
//     const trackerInfoRedis = await redisClient.hGetAll(`1240`);
// console.log(trackerInfoRedis)
   
//     const trackerInfo = JSON.parse(trackerInfoRedis.data);
// console.log(trackerInfo)

redisClient.hSet('hash_key', 'field1', 'value1', (err, reply) => {

    if (err) {

        console.log('Error:', err);

    } else {

        console.log('HSET successful:', reply);

    }

});

    //   app.use('/api/v1/posts', postRouter(express, redisClient));
    //   app.use('/api/v1/users', userRouter(express, redisClient));
    //   app.use('/api/v1/login', authRouter(express, redisClient));
}