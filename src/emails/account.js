const sgMail = require('@sendgrid/mail')
const sendGridAPI = ""

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to:'',
//     replyTo:'',
//     from:'',
//     subject:'',
//     text:'',
//     cc:'',
//     bcc:''
// })

const sendUserWelcomeMail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'',
        subject:'Welcome to the Task Manager App!',
        text:`Hello, ${name} to our app. Hope we can help you get stay more organized`,

    })
}
const sendUserExitMail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'',
        subject:'So sad to see you go',
        text:`Hello, ${name} thanks for using our app. Hope we could help you get more organized`,
        
    })
}

module.exports  =  {
    sendUserExitMail,
    sendUserWelcomeMail
}