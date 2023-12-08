
const mongoose = require('mongoose')


const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Atour must have a name '],// validator
      unique : true
    },
    rating: {
      type: Number,
      default: 4.5
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price ']
    }
  })

//this tour variable here with a capital T, just so we know that we're dealing with a model here.
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour