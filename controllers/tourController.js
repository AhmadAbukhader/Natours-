const Tour = require('./../models/tourModel')

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) this is for testing 

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next();
}

exports.getAllTours = async (req, res) => {
    try {
        console.log(req.query);
        //build the query
        // 1a) filterimg 
        const queryObj = { ...req.query }
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el])

        //1b) Advance filterng 
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        let query = Tour.find(JSON.parse(queryStr))

        //2)Sorting 
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
            //sort('price ratingsAverage')
        } else {
            query = query.sort('-createdAt')
        }

        //3) Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }
        //4) Pagination 
        const page = req.query.page * 1 || 1 // this is for making default value
        const limit = req.query.limit * 1 || 100 //the 1 is to convert the string to number
        const skip = (page - 1) * limit

        //page=2&limit=10, 1-10 => page1 , 11-20 => page2
        query = query.skip(skip).limit(limit)

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error(`This page dont exist `)
            // we threw an error because we are inttry catch and the error will go to the catch
        }

        //execute the query
        const tours = await query

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
