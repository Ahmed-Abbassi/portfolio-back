const express = require('express');
require("dotenv").config()
const cors = require('cors');
const nodemailer = require("nodemailer");

const app = express();


app.use(express.json());
app.use(cors());

app.post("/contact", (req, res) => {

    const {fullName, email, phone, service, message} = req.body;
    console.log(fullName, email, phone, service, message);
    res.json({data :"good"})
    nodemailer.createTestAccount((error,account)=>{
        if(error){
           console.error('error while creating the account')
           return process.exit(1)
        }
        //creating transporter
        const transporter = nodemailer.createTransport({
            host : account.smtp.host,
            port : account.smtp.port,
            secure : account.smtp.secure,
            auth :{
                user : account.user,
                pass : account.pass
            }
        })
        //message to send and other params
        const messager = {
            form : email,
            to : 'abbassia082@gmail.com',
            subject: 'Nodemailer is unicode friendly ✔',
            text: message,
            html: '<p><b>Hello</b> to myself!</p>'
        }

        transporter.sendMail(messager, (err, info)=>{
            if(err){
                console.log('error while sending the email');
                return process.exit(1)
            }
            console.log(info);
            console.log("url--->",nodemailer.getTestMessageUrl(info));
            
        })
    })


});

app.listen(3001)