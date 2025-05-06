const express = require("express");
const loginAndSignUp = express.Router();

const {login, signup, forgotPassword, resetPassword} = require("../../Controllers/User/LoginAndSignUp")

loginAndSignUp.post("/login", login)
loginAndSignUp.post("/signup", signup)
loginAndSignUp.post("/forgotPassword", forgotPassword)
loginAndSignUp.post("/resetPassword", resetPassword)

module.exports = loginAndSignUp