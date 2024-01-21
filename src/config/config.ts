import dotenv from 'dotenv';
dotenv.config()


export default {
  port: process.env.PORT || 3000,
  mongo: {
    uri: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracking-data-handler'
  },
  redis: {
    uri: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  rabbit: {
    uri: process.env.RABBITMQ_URL || 'amqp://localhost',
    trackingRelayQueue: 'Tracking.Relay.TrackingData',
  },
  otlp: {
    uri: process.env.OTLP_URL || 'http://127.0.0.1:4318'
  },
  socket: {
    auth_token: process.env.SOCKET_AUTH_TOKEN || 'wXpUSXnlp42JbFsnXN4lGWn6yGCBw8sV'
  },
  jobs: {
    delete_Cron: process.env.DELETE_CRON || '0 0 * * *',
    resend_Cron: process.env.RESEND_CRON || '0 0 * * *'
  },
};
