const express = require('express')
const ContactRouter = new express.Router()
const Contact = require('../models/contacts')
const auth = require('../middleware/auth')

ContactRouter.get("/contact",auth,async (req,res)=>{
    try {
    
    await req.user.populate({
        path:'contacts'
    }).execPopulate()
        console.log(req.user.contacts);
        res.send(req.user.contacts)   
    } catch (error) {
        res.status(400).send({error:error})
    }
})

ContactRouter.post("/contact", auth,async (req,res)=>{
    try {
        //console.log(": "+req.user._id);
        let fname = req.body.fname
        let lname = req.body.lname
        let initials = fname.charAt(0)+lname.charAt(0)
        let number = req.body.number
        number="91"+number
        console.log("number : "+number)

        const contacts = await Contact.findOne({owner:req.user._id,number:number})
        console.log("Contacts : already Exists : " +contacts)

        if(contacts){
            return res.status(400).send({msg:'This number already exists in your contact.'})
        }
        const contact = new Contact({
            fname,lname,number,
            initials:initials,
            owner:req.user._id
        })
        console.log("Contact : "+contact)
        const result = await contact.save()
        res.status(201).send(result)
    } catch (error) {
        res.status(400).send(error)
    }
})

ContactRouter.delete('/contact/:id',auth,async (req,res)=>{
    try {     
    const contact = await Contact.findOneAndDelete({_id:req.params.id,owner:req.user._id})
    if(!contact){
        res.status(404).send({error:`No contact with id ${req.params.id} found`})
    }
        res.send({contact,user:req.user})   
    } catch (error) {
        res.status(500).send({error:"Error while deleting"})
    }
})

module.exports = ContactRouter