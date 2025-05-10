const express = require("express");
const userDataRoutes = express.Router();

const {userData, updateCompanyInformation,updatePayment} = require("../../Controllers/User/UserData");
const {authenticateAndAuthorize} = require("../../Middleware/authenticateAndAuthorize")
const {AddDriver, updateDriver, deleteDriver} = require("../../Controllers/User/Driver")


userDataRoutes.get("/getdata", authenticateAndAuthorize(["User"]), userData);
userDataRoutes.post("/updateCompanyInformation", authenticateAndAuthorize(["User"]), updateCompanyInformation);
userDataRoutes.post("/updatePayment", authenticateAndAuthorize(["User"]), updatePayment);
userDataRoutes.post("/addDriver", authenticateAndAuthorize(["User"]),AddDriver);
userDataRoutes.post("/updateDriver", authenticateAndAuthorize(["User"]),updateDriver);
userDataRoutes.post("/deleteDriver", authenticateAndAuthorize(["User"]),deleteDriver);

module.exports = userDataRoutes;