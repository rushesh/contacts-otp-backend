var validator = require('validator')
const mongoose = require('mongoose')

const ContactSchema = new mongoose.Schema({
    fname:{
        type:String,
        required:true,
        trim:true
    },
    lname:{
        type:String,
        required:true,
        trim:true
    },
    number:{
        type:String,
        required:true,
        trim:true
    },
    initials:{
        type:String,
        required:true,
        trim:true,
        uppercase:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},
{
    timestamps:true
})
const Contact = mongoose.model('Contact',ContactSchema)

module.exports = Contact