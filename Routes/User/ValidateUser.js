const express = require("express");
const validateUser = express.Router();

const {verifyUser} = require("../../Controllers/User/ValidateUser");
const {userAuth} = require("../../Middleware/userAuth")


validateUser.get("/verify", userAuth , verifyUser);

module.exports = validateUser;