const Mongoose  = require("mongoose")
const validator = require('validator');


const userSchema = new Mongoose.Schema({
    name:{
        type: String ,
        required: [true , 'Please tell us your name'] 
    },
    email:{
        type : String ,
        required: [true , 'Please tell us your email'],
        unique: true ,
        lowercase: true ,
        validate : [validator.isEmail , `Please enter a valid email`]
    },
    photo : String ,
    password :{
        type : String ,
        required: [true , `Please provide a Password`] ,
        minlength : 8 
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (passwordConfirm) {
                // 'this' refers to the document being validated
                return passwordConfirm === this.password;
            },
            message: 'Passwords do not match'
        }
    }
})

const User = Mongoose.model('User',userSchema)

module.exports = User
