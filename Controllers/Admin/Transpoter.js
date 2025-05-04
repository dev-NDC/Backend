const nodemailer = require("nodemailer");
require('dotenv').config();
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,  
    pass: SMTP_PASS 
  }
});

module.exports = transporter;
