const mongoose = require('mongoose')


if (process.env.NODE_ENV === 'production')
  mongoose.set('autoIndex', false);

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  }).then(() => { console.log('mongodb connected.') })
  .catch((err) => console.log(err.message))


mongoose.connection.on('error', (err) => {
  console.log(err.message)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection is disconnected.')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})
