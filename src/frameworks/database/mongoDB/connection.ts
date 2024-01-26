
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
    console.log('✅ Mongo DB Connection is connect');
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
