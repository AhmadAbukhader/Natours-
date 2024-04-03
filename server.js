const mongoose = require('mongoose')
const dotenv = require('dotenv')


//this code must be in the top if the code 
process.on('uncaughtException' , err => {
  console.log(`UNCAUGHT EXCEPTION SHUTDOWN.......`)
  console.log(err.name , err.message);
  process.exit(1) // this code will catch the sync so it doesn`t need to have server close 
});


dotenv.config({ path: './config.env' })
const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

//connect the hosted database with your application using driver called mongoose 
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => { console.log('DB connection successful ') })

//console.log(app.get('env'));
//console.log(process.env);

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
})

// this is for the async
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log(`UNHANDLED REJECTION SHUTTING DOWN .......`)
  server.close(()=> {
    process.exit(1) // the code 1 mean not catched exception
  })
})// it will catch any un handled rejection like a problem in the connection of the database or in the password 
//server. close used to give sometime for the server to end all the request theen shut down the application 


