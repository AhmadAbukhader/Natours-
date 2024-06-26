const APIFeatures = require('../utills/APIFeatures')
const Tour = require('./../models/tourModel')
const catchAsync = require('../utills/catchAsync')
const AppError = require('../utills/appError')
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) this is for testing 

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next();
}



exports.getAllTours = catchAsync(async (req, res, next) => {
    console.log(req.query);
    //execute the query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const tours = await features.query

    //send response 

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    })
})
exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)
    //Tour.findOne({_id:req.params.id}) and it is _id because this how it look`s like in mongo db
    if (!tour) {
        return next(new AppError('No tour foud with that ID ', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})


exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)
    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    })
})

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!tour) {
        return next(new AppError('No tour foud with that ID ', 404))
    }

    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })
})
exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)
    if (!tour) {
        return next(new AppError('No tour foud with that ID ', 404))
    }

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.getTourstats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } } // just whose rating average more than 4.5 
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' }, // this is to determine the field and null mean all fields               
                numTours: { $sum: 1 },//for each document go through the pipline add one 
                numRatings: { $sum: '$ratingQuantity' },//for each document go through the pipline add the value of the ratingQuantity 
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 } // we need to use the variables in the stage because the others will be gone 
        }
        // {
        //     $match : { _id :{$ne : 'EASY'}} //_id here is the difficulty
        // }
    ])
    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1 //2021

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ])
    res.status(200).json({
        status: "success",
        data: {
            plan
        }
    })
})