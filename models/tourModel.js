
const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')


const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name '],// validator
    unique: true,
    trim: true,
    maxlength: [40, 'A Tour Name must have less or equal than 40 '],
    minlength: [10, 'A Tour Name must have more or equal than 10 ']
    //validate: [validator.isAlpha, 'Tour name musy only contain characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, " Atour must have a duration "]
  },
  maxGroupSize: {
    type: Number,
    required: [true, " a tour must have a size "]
  },
  difficulty: {
    type: String,
    required: [true, "it should have a difficulty "],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be easy or medium or difficult'
    }
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'the rating must be above 1'],
    max: [5, 'the rating must be under 5']
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price ']
  },
  priceDiscount: {
    type: Number,
    validate:{
      validator :  function(val) {
        //this only points to current doc an NEW document creation
        return val < this.price 
      },
      message : 'Discount price should be below the regular price '
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'a tour must a summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, ' A tour must have an image ']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
}) //we use the normal function instead of arrow because we want to use the this and the arrow don`t have it 

//document middleware : runs before .save() and .create() but not insertMany() 
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next();
})

// tourSchema.pre('save', function (next) {
//   console.log('Will save document ');
//   next();
// })

tourSchema.post('save', function (doc, next) {
  console.log(doc)
  next();
})// when we have only one middleware we don`t need to use next 

//this tour variable here with a capital T, just so we know that we're dealing with a model here.


// //QUERY MIDDLEWARE 

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })

  this.start = Date.now()
  next();
})

tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} Milliseconds`);
  console.log(docs);
  next();
})

//Aggregation middleware  
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })

  console.log(this.pipeline())
  next();
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour