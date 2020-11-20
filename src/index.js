const express  =  require('express')
require('./db/mongoose')
const app = express()
const cors = require('cors')
app.use(express.json())

const PORT = process.env.PORT || 3000

const userrouter = require('./routes/userrouter')
const contactrouter = require('./routes/contactsroute')

app.use(cors())

app.use(userrouter)
app.use(contactrouter)

app.all('*',(req,res)=>{
    res.status(404).send({
        error:"URL Not Found",
        message:"URL Not Present"
    })
})

app.listen(PORT,()=>{
    console.log("Server Started at "+PORT);
})
