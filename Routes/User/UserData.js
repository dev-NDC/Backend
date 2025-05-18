const express = require("express");
const userDataRoutes = express.Router();

const {userData, updateCompanyInformation,updatePayment} = require("../../Controllers/User/UserData");
const {authenticateAndAuthorize} = require("../../Middleware/authenticateAndAuthorize")


userDataRoutes.get("/getdata", authenticateAndAuthorize(["User"]), userData);
userDataRoutes.post("/updateCompanyInformation", authenticateAndAuthorize(["User"]), updateCompanyInformation);
userDataRoutes.post("/updatePayment", authenticateAndAuthorize(["User"]), updatePayment);


// routes for create new order
const {getAllCompanyAllDetials, getSiteInformation, newDriverSubmitOrder, handleNewPincode} = require("../../Controllers/User/CreateNewOrder")
userDataRoutes.get("/getAllCompanyAllDetials",authenticateAndAuthorize(["User"]), getAllCompanyAllDetials);
userDataRoutes.post("/getSiteInformation",authenticateAndAuthorize(["User"]), getSiteInformation);
userDataRoutes.post("/handleNewPincode",authenticateAndAuthorize(["User"]), handleNewPincode);
userDataRoutes.post("/newDriverSubmitOrder",authenticateAndAuthorize(["User"]), newDriverSubmitOrder);

module.exports = userDataRoutes;