const express = require("express");
const loginAndSignUp = express.Router();

const {login, signup, forgotPassword, resetPassword} = require("../../Controllers/User/LoginAndSignUp")
const { loginValidator, signupValidator, forgotPasswordValidator, resetPasswordValidator } = require("../../Validators/User/AuthValidation");
const validate = require("../../Middleware/validate");


loginAndSignUp.post("/login",loginValidator, validate, login)
loginAndSignUp.post("/signup",signupValidator,validate, signup)
loginAndSignUp.post("/forgotPassword",forgotPasswordValidator, validate, forgotPassword)
loginAndSignUp.post("/resetPassword",resetPasswordValidator, validate, resetPassword)

module.exports = loginAndSignUp