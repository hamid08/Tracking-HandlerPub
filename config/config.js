import dotenv from 'dotenv';
dotenv.config()


export default {
  port: process.env.PORT || 3000,
  ip: process.env.HOST || '127.0.0.1',
  mongo: {
    uri: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracking-data-handler'
  },
  redis: {
    uri: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  }
};
