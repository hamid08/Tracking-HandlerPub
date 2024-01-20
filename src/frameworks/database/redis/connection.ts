
export default function connection(redis: any, config: any) {
  const createRedisClient = function createRedisClient() {
    const client = redis.createClient({
        url:config.redis.uri
      });
    (async () => {
      try {

        var isOpen = client.isOpen;
        if (!isOpen) {
          await client.connect();
        }
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

  createRedisClient().on("error", (err: any) => {
    (async () => {
      try {

        var isOpen = createRedisClient().isOpen;
        if (!isOpen) {
          await createRedisClient().connect();
        }
      }
      catch (err) {
        console.log(err)
      }
    })();

    console.log(`Redis Error:${err}`);
  });

  // Close the connection when there is an interrupt sent from keyboard
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", cleanup);


  async function cleanup() {
    createRedisClient().quit();
    console.log('redis client quit');
  }

  return {
    createRedisClient
  };
}