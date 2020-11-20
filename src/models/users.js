const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is Invalid")
            }
        }
    },
    age: {
        type: Number,
        default: 18,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    password:{
        type:String,required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    messagessent:[
        {
            to:{
                type:String,
            },
            message:{
                type:String,
                trim:true
            },
            time:{
                type:Date
            },
            toname:{
                type:String,
                trim:true
            },
            timestring:{
                type:String
            }
        }
    ],
    avatar:{
        type:Buffer
    },
    avatarFile:{
        type:Object
    }
},
{
    timestamps:true
})


UserSchema.virtual('contacts',{
    ref:'Contact',
    localField:'_id',
    foreignField:'owner'
})

UserSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    delete userObject.avatarFile
    delete userObject.__v
    return userObject
}

UserSchema.methods.generateAuthToken = async function () {
    try {
    const user = this
    console.log("generating user token")
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token   
    } catch (error) {
        
    }
}

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('No such user found.').message('No such user found.')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Please check your password.')
    }

    return user
}

// Hash the plain text password before saving
UserSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

UserSchema.pre('remove',async function(){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User