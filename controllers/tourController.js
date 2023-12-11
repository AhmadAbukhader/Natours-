const Tour = require ('./../models/tourModel')

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) this is for testing 


exports.getAllTours = async (req, res) => {
    try {
          //find will return an array of these document and then convert them to java script objects 
    const tours = await Tour.find()

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
           tours
        }
    })
    } catch (err) {
      res.status(404).json({
        status : 'failed',
        message:err 
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
        status : 'failed',
        message:err 
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
            status : "failed" , 
            message : error
        })
    }
}

exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id , req.body , {
            new : true ,
            runValidators: true
        })
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        })
    }catch(err){
        res.status(404).json({
            status : 'failed',
            message:err 
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
            status : 'failed',
            message:err 
        })
    }
}
