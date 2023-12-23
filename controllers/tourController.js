const Tour = require('./../models/tourModel')

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) this is for testing 

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next();
}

class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        // 1a) filterimg 
        const queryObj = { ...this.queryString }
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el])

        //1b) Advance filterng 
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr))
        //let query = Tour.find(JSON.parse(queryStr))
        return this;
    }
    sort() {
        //2)Sorting 
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
            //sort('price ratingsAverage')
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }
    limitFields() {
        //3) Field limiting
        if (this.query.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1 // this is for making default value
        const limit = this.queryString.limit * 1 || 100 //the 1 is to convert the string to number
        const skip = (page - 1) * limit

        //page=2&limit=10, 1-10 => page1 , 11-20 => page2
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

exports.getAllTours = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}
exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        //Tour.findOne({_id:req.params.id}) and it is _id because this how it look`s like in mongo db
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}
exports.createTour = async (req, res) => {
    try {
        //the old method to create object 
        // const newTour = new Tour ({})
        // newTour.save()
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}
exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: "success",
            data: null
        })
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}

exports.getTourstats = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}