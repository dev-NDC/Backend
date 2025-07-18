const nodemailer = require("nodemailer");
require('dotenv').config();
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// Create a transporter object using Gmail SMTP with TLS override
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // <--- Accept self-signed certs (use only when needed)
  }
});

module.exports = transporter;
