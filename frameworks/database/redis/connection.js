export default function connection(redis, config) {
  const createRedisClient = function createRedisClient() {
    const client = redis.createClient(config.redis.uri);
    (async () => {
      try {
        // Connect to redis server
        await client.connect();
      }
      catch (err) {
        console.log(err)
      }
    })();

    return client;
  };

  createRedisClient().on('connect', () => {
    console.log('Connected to Redis!');
  });

  createRedisClient().on("error", (err) => {
    console.log(`Redis Connection Error:${err}`);
  });

  // Close the connection when there is an interrupt sent from keyboard
  // process.on('SIGINT', () => {
  //   createRedisClient().quit();
  //   console.log('redis client quit');
  // });

  return {
    createRedisClient
  };
}