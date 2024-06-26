const User = require('./../models/userModel')
const catchAsync = require('../utills/catchAsync')

exports.signup =catchAsync(async (req,res ,next) => {
    const newUser = await  User.create(req.body)

    res.status(200).json({
        status : 'success',
        data:{
            user : newUser
        }
    });
});
