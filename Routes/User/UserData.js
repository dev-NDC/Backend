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


// routes for create new order
const {getAllCompanyAllDetials, getSiteInformation} = require("../../Controllers/User/CreateNewOrder")
userDataRoutes.get("/getAllCompanyAllDetials",authenticateAndAuthorize(["User"]), getAllCompanyAllDetials);
userDataRoutes.post("/getSiteInformation",authenticateAndAuthorize(["User"]), getSiteInformation);

module.exports = userDataRoutes;