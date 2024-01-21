import config from '../../../config/config';
import mongoose from 'mongoose';

export default function connection() {

  const mongoOptions = {
    autoIndex: true,
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    connectTimeoutMS: 360000,
    socketTimeoutMS: 360000,
  };


  function connectToMongo() {
    mongoose.connect(config.mongo.uri, mongoOptions).then(() => { },
      (err: any) => {
        console.info('Mongodb error', err);
      }
    )
      .catch((err: any) => {
        console.log('ERROR:', err);
      });
  }

  mongoose.connection.on('connected', () => {
    console.info('Connected to MongoDB!');
  });

  mongoose.connection.on('reconnected', () => {
    console.info('MongoDB reconnected!');
  });

  mongoose.connection.on('error', (error: any) => {
    console.error(`Error in MongoDb connection: ${error}`);
    mongoose.disconnect();
  });

  mongoose.connection.on('disconnected', () => {
    console.error(
      `MongoDB disconnected! Reconnecting in 5s...`
    );
    setTimeout(() => connectToMongo(), 5000);
  });

  return {
    connectToMongo
  };
}
