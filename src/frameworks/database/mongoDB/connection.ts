export default function connection(mongoose: any, config: any, options: any) {
  function connectToMongo() {
    mongoose
      .connect(config.mongo.uri, options)
      .then(
        () => { },
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
      `MongoDB disconnected! Reconnecting in ${options.reconnectInterval / 1000
      }s...`
    );
    setTimeout(() => connectToMongo(), options.reconnectInterval);
  });

  return {
    connectToMongo
  };
}
