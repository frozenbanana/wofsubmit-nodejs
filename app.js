const express = require('express');
const formidable = require('formidable');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require("fs");
const uploadedPath = path.join(__dirname, "/uploaded/");

const app = express();

// view engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('contact');
});

var output = ``;
var fileName = '';
var newFilePath = '';
var mailOptions = {};

app.post('/send', (req, res) => {
    // if sending upload file to server
    if (req.url == '/send') {
        var form = new formidable.IncomingForm({uploadDir: uploadedPath});
        form.parse(req, function (err, fields, files) {
        
            output = `
            <p>You have a new contact request</p> <h3>Contact Details</h3>
            <ul>
                <li>Name: ${fields.name}</li>
                <li>Youtube Channel: ${fields.ytchannel}</li>
                <li>Email: ${fields.email}</li>
            </ul>
            <h3>Message</h3>
            <p>${fields.message}</p>
            `
            var oldFilePath = files.filetosend.path; 
            newFilePath = uploadedPath + files.filetosend.name; 
            fileName = files.filetosend.name;

            fs.rename(oldFilePath, newFilePath, function (err) {
            if (err) throw err;
                console.log('File uploaded and renamed!');
            });

            // setup email data with unicode symbols
            mailOptions = {
                from: '"Nodemailer Contact" <henrytteesstt@gmail.com>', // sender address
                to: 'oliverglandberger@gmail.com', // list of receivers
                subject: 'Node Contact Request', // Subject line
                text: 'Hello world?', // plain text body
                html: output, // html body
                attachments: [
                    {   // utf-8 string as an attachment
                        filename: fileName,
                        path: newFilePath 
                    }
                ]
            };

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,                       // true for 465, false for other ports
                auth: {
                    user: 'henrytteesstt@gmail.com', // generated ethereal user
                    pass: 'qwert!234'                // generated ethereal password
                },
                tls:{
                    rejectUnauthorized:false
                }
            });

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);   
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                res.render('contact', {msg:'Email has been sent'});
            });
         });

    }
});

app.listen(3000, () => console.log('Server started..'));