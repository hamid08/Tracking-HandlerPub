import { createClient } from 'redis';
import config from "../../../config/config";

class RedisDBConnection {
  connection!: any;
  private reconnectInterval: number;

  constructor(reconnectInterval: number = 5000) {
    this.reconnectInterval = reconnectInterval;
    this.connect();
  }

  async connect() {
    if (this.connection) return;

    while (true) {
      try {
        this.connection = createClient({ url: config.redis.uri, pingInterval: 60000 });
        this.connection.on('ready', () => {
          console.log(`✅ Redis DB Connection is ready`);
        });

        this.connection.on('connect', () => {
          console.log(`✅ Redis DB Connection is connect`);
        });

        this.connection.on('reconnecting', () => {
          console.log('Redis DB reconnecting...');
        });

        this.connection.on('error', (err: any) => {
          console.error(`Redis DB Connection error: ${err}`);
        });

        this.connection.on('end', () => {
          console.error(`Redis DB Connection closed`);
        });

        this.connection.on('end', () => {
          console.error('Redis disconnected! Reconnecting in 5s...');
          setTimeout(() => this.connection.connect(), 5000);
        });

        await this.connection.connect();

        break;
      }
      catch (err) {
        console.error(`Failed to connect to Redis DB: ${err}`);
        await new Promise((resolve) => setTimeout(resolve, this.reconnectInterval));
      }
    }
  }

}

const redisConnection = new RedisDBConnection();

export default redisConnection;