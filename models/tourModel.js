
const mongoose = require('mongoose')


const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Atour must have a name '],// validator
      unique : true ,
      trim : true
    },
    duration :{
      type : Number ,
      required : [true , " Atour must have a duration "]
    },
    maxGroupSize: {
      type : Number ,
      required : [true , " a tour must have a size "]
    },
    difficulty : {
      type : String , 
      required : [true , "it should have a difficulty "]
    },
    ratingAverage: {
      type: Number,
      default: 4.5
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price ']
    },
    priceDiscount: Number,
    summary : {
      type : String , 
      trim : true , 
      required : [true , 'a tour must a summary']
    },
    description : {
      type : String ,
      trim : true 
    },
    imageCover : {
      type : String ,
      required : [true , ' A tour must have an image ']
    }, 
    images : [String],
    createAt:{
      type : Date ,
      default:Date.now()
    }, 
    startDates : [Date]
  })

//this tour variable here with a capital T, just so we know that we're dealing with a model here.
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour