import * as redis from 'redis';
import config from '../../../config/config';

export default function connection() {

  const redisOptions = {
    url: config.redis.uri,
    retryStrategy: (times: number) => {
      return Math.min(times * 100, 3000);
    }
  };

  const connectToRedis = () => {
    const client = redis.createClient(redisOptions);

    (async () => {
      await client.connect();
    })();

    client.on('connect', () => {
      console.info('Connected to Redis!');
    });

    client.on('reconnecting', () => {
      console.info('Redis reconnecting...');
    });

    client.on("error", (err: any) => {
      console.error(`Error in Redis connection: ${err}`);
    });

    client.on('end', () => {
      console.error('Redis disconnected! Reconnecting in 5s...');
      setTimeout(() => connectToRedis(), 5000);
    });

    return client;
  };

  return {
    connectToRedis
  }

}