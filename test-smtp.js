const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.g7aerospace.com.my',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'rahman@g7aerospace.com.my',
    pass: 'G7aerospace123@@'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Error:', error.message);
    console.log('Error Code:', error.code);
  } else {
    console.log('SMTP Configuration is correct!');
  }
});