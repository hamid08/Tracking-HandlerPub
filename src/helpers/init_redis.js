// const { createClient } = require("redis");

// const redisClient = createClient({
//   url: process.env.REDIS_URL,
// });

// process.on("SIGINT", cleanup);
// process.on("SIGTERM", cleanup);
// process.on("exit", cleanup);



// async function cleanup() {
//   if (redisClient.isReady) await redisClient.quit();
//   process.exit(0);
// }


// redisClient.on("ready", (data) => console.log("Connected to Redis Client!"));
// redisClient.on("end", (data) => console.log("Redis Client is closed!"));
// redisClient.on("error", (err) => console.error("Redis Client Error", err));


// async function ConnectToRedis() {
//   await redisClient.connect();
// }

// ConnectToRedis();


// module.exports = redisClient
