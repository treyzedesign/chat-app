const mongoose = require('mongoose')
const {isEmail} = require('validator')

const userSchema = new mongoose.Schema({
   
    name :{
        type:String,
        required : [true, 'cannot be blank']
    },
    email:{
        type: String,
        required : [true, 'cannot be blank'],
        unique : true,
        validate : [isEmail, 'invalid email'],
    },
    password: {
        type: String,
        minLength: 8,
        required : [true, 'cannot be blank']
    },
    picture : {
        type: String,
        default :  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
    newMessage : {
        type : Object,
        default : {}
    },
    status: {
        type: String,
        default: 'online'
    },
    token: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    }, 
    isVerify : {
        type: Boolean,
        default: false 
    }
},{
    minimize: false,
    timestamps: true
}
)

const User = mongoose.model('User', userSchema)
module.exports = User