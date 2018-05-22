const express = require('express');
const formidable = require('formidable');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require("fs");
const request = require("request");
const uploadedPath = path.join(__dirname, "/uploaded/");

const EMAIL_NAME = process.env.MY_APP_EMAIL;
const EMAIL_PASS = process.env.MY_APP_PASS;
const EMAIL_RECEIVER = "oliverglandberger@gmail.com";
const CAPTCHA_SECRET = process.env.MY_PASS_CAPTCHA_SECRET;
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
    var form = new formidable.IncomingForm({ uploadDir: uploadedPath });
    form.parse(req, function (err, fields, files) {
        console.log(fields);
        if (fields['g-recaptcha-response'] === undefined ||
            fields['g-recaptcha-response'] === '' ||
            fields['g-recaptcha-response'] === null
        ) {
            return res.json({ "success": false, "msg": "Please select captcha." });
        }

        const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${CAPTCHA_SECRET}&response=${fields['g-recaptcha-response']}&remoteip=${req.connection.remoteAddress}`;
        
        request(verifyUrl, (err, res, body) => {
            body = JSON.parse(body);
            console.log(body);
            //if google said not OK
            if (body.success !== undefined && !body.success) {
                return res.json({ "success": false, "msg": "Failed captcha verification." });
            }
            // if google said OK
            if (body.success !== undefined && body.success) {
                form.parse(req, function (err, fields, files) {
                    console.log(fields);
                    output = `
                <p>You have a new contact request</p> <h3>Contact Details</h3>
                <ul>
                 <li>Name: ${fields.name}</li>
                    <li>Type of Play: ${fields.typeofplay}</li>
                    <li>Time Stamp: ${fields.timestamp}</li>
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
                        from: '"WoF Submit Mailer"',                // sender address
                        to: EMAIL_RECEIVER,                         // list of receivers
                        subject: 'Node Contact Request',            // Subject line
                        text: 'Hello world?',                       // plain text body
                        html: output,                               // html body
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
                            user: EMAIL_NAME,               // generated ethereal user
                            pass: EMAIL_PASS                // generated ethereal password
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                        res.render('contact', { msg: 'Email has been sent' });
                    });
                });
            }

        })
    })

});

app.listen(5000, () => console.log('Server started..'));