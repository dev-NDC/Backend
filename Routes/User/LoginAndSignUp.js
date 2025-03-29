const express = require("express");
const loginAndSignUp = express.Router();

const {login, signup} = require("../../Controllers/User/LoginAndSignUp")

loginAndSignUp.post("/login", login)
loginAndSignUp.post("/signup", signup)

module.exports = loginAndSignUp