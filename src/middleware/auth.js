const User = require('../models/users')
const jwt = require('jsonwebtoken')

const auth = async (req,res,next)=>{
    try {
    console.log('In auth',req.header('Authorization'))

    const token = req.header('Authorization').replace('Bearer ','')
    //console.log(token)
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
    console.log(decoded)
    const user = await User.findOne({_id:decoded._id,'tokens.token':token})
        console.log(user)
    if(!user){
       throw new Error()
    }
    req.token = token
    req.user=user
    next()   
    } catch (error) {
        res.status(401).send({msg:'Please authenticate',error})
    }
}

module.exports = auth