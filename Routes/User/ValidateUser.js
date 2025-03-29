const express = require("express");
const validateUser = express.Router();

const {verifyUser} = require("../../Controllers/User/ValidateUser");
const {Verification} = require("../../Middleware/verifyUser")


validateUser.get("/verify", Verification(), verifyUser);

module.exports = validateUser;