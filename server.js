const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

//connect the hosted database with your application using driver called mongoose 
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => { console.log('DB connection successful '); })

//console.log(app.get('env'));
//console.log(process.env);

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App running on port ${port}`);
})



