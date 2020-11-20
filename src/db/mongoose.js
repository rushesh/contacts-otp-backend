const mongoose = require('mongoose')

const uri = process.env.MONGODB_URL
mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:true}).then((res)=>{
    console.log("Connected to DB !")
}).catch((err)=>{
    console.log("Error occured while connecting !"+err)
})