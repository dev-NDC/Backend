const express = require("express");
const randomRoutes = express.Router();

const {getValueFromUSDOT,handleVisitor} = require("../../Controllers/RandomAPI/RandomAPI")


randomRoutes.post("/getValueFromUSDOT", getValueFromUSDOT)
randomRoutes.post("/handleVisitor", handleVisitor)


module.exports = randomRoutes