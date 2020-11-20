const express = require('express')
const UserRouter =new express.Router()

const User = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const accounts  = require('../emails/account')

const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
});

UserRouter.post('/user/sendmessage',auth,async (req,res)=>{

    const from = 'Contactto Apps';
    console.log(req.body);
    const to = req.body.clickedContact.number;
    const text = req.body.otp;
    const toname = req.body.clickedContact.fname+" "+req.body.clickedContact.lname;
    
    nexmo.message.sendSms(from, to, text, async (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if(responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
                console.log(from,to,text);  
     const msg = {
         to:to,
         message:text,
         toname,
         time:new Date().toLocaleString(),
         timestring:new Date().toLocaleString()
     } 
     req.user.messagessent.push(msg)
     console.log("User : ",req.user)
     await req.user.save()
     return res.send({
         from,to,text
     })
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                return res.send({
                        error:`${responseData.messages[0]['error-text']}`
                })
            }
        }
    })
     
})

const upload = multer({
    //give dest if you want to save it to a filesystem/folder
   // dest:'avatars',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,callback){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            callback('Please upload a jpg,jpeg,png file only.'.undefined)
        }
        callback(undefined,true)
    }
})

UserRouter.post('/user/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    //rew.file.buffer gives us the multer file

        const buffer = await sharp(req.file.buffer).resize({
            height:250,
            width:250
        }).toBuffer()
        
        //instead of saving all file type names sharp can convert all to either png / jpeg also so that only one mimetype can be used
        req.user.avatar = buffer
        const fileData = {
            originalname:req.file.originalname ,
            mimetype: req.file.mimetype
        }
        req.user.avatarFile = fileData
        await req.user.save()
        res.send({msg:'Saved'})
},(error,req,res,next)=>{
    res.status(400).send({error})
    next()  
})

UserRouter.get('/user/me/avatar',auth,async (req,res)=>{
    if(req.user.avatar){
        const avatarBuffer = req.user.avatar
        const avatarname = req.user.avatarFile.originalname
        const avatarmimetype = req.user.avatarFile.mimetype
        const data  = {
            avatarBuffer,avatarname,avatarmimetype
        }
        res.set('content-type',avatarmimetype)
        res.send(avatarBuffer)
    }else{
        res.status(404).send({msg:'No avatar found'})
    }
},(error,req,res,next)=>{
    res.status(400).send({error})
    next()  
})

UserRouter.get('/user/:id/avatar',async (req,res)=>{
    try {
     
    const user = await User.findById(req.params.id)
    console.log("User :"+user)
    if(!user){
      return  res.status(404).send({msg:'User Not Found'})
    }
    else
    {
        if(user.avatar){
        const avatarBuffer = user.avatar
        const avatarname = user.avatarFile.originalname
        const avatarmimetype = user.avatarFile.mimetype
        const data  = {
            avatarBuffer,avatarname,avatarmimetype
        }
        res.set('content-type',avatarmimetype)
        res.send(avatarBuffer)
    }else{
        res.status(404).send({msg:'No avatar found'})
    }
}   
    } catch (error) {
        res.status(400).send()       
    }
},(error,req,res,next)=>{
    res.status(400).send()
    next()  
})

UserRouter.delete('/user/me/avatar',auth,async (req,res)=>{
    try {     
        req.user.avatar = undefined
        await req.user.save()
        res.send({user:req.user,msg:'Avatar Deleted'})   
    } catch (error) {
        res.status(500).send({error:"Error while deleting avatar"})
    }
})



UserRouter.post('/user',async (req,res)=>{

    try {
    var user = new User(req.body)
    user = await user.save()
    const token = await user.generateAuthToken() 
    accounts.sendUserWelcomeMail(user.email,user.name)
    res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }
})



UserRouter.get("/user/me",auth ,async (req,res)=>{
    res.send(req.user)
})

UserRouter.patch('/user/me',auth ,async (req,res)=>{
    try {
         
    if(Object.keys(req.body).length===0){
        return res.status(404).send({error:'No property to update!'})
    }

    const allowedUpdates = ['name','age','email','password']
    const userUpdates = Object.keys(req.body)

    const isValidOperation =  userUpdates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid property name'})
    }
        userUpdates.forEach((update)=>{
            req.user[update] = req.body[update]
        })
        console.log("User : ",req.user)
        await req.user.save()
        //var user = await User.findByIdAndUpdate(_id,user_new_values,{new:true,runValidators:true})
        // if(!user){
        //     res.status(404).send("No such user")
        // }
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})


UserRouter.delete('/user/me',auth,async (req,res)=>{
    try {     
        await req.user.remove()
        accounts.sendUserWelcomeMail(req.user.email,req.user.name)
        res.send(req.user)   
    } catch (error) {
        res.status(500).send({error:"Error while deleting"})
    }
})


UserRouter.post('/user/login', async (req, res) => {
    
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
        res.send({ user, token })
    } catch (e) {
        
        res.status(404).send({error:e.message})
    }
})

UserRouter.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((element)=>{
                return element.token !== req.token
        })
        await req.user.save()
        res.send({msg:'Current Session Logged Out'})
    } catch (e) {
        res.status(500).send()
    }
})

UserRouter.post('/user/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({msg:'All Sessions Logged Out'})
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = UserRouter