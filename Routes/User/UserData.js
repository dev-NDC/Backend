const express = require("express");
const userDataRoutes = express.Router();

const {userData, updateCompanyInformation,updatePayment} = require("../../Controllers/User/UserData");
const {authenticateAndAuthorize} = require("../../Middleware/authenticateAndAuthorize")
const {userAuth} = require("../../Middleware/userAuth");

// routes for user data
const { updatePaymentValidator, updateCompanyInformationValidator } = require("../../Validators/User/UserDataValidation");
const validate = require("../../Middleware/validate");

userDataRoutes.get("/getdata", userAuth, userData);
userDataRoutes.post("/updateCompanyInformation", userAuth,updateCompanyInformationValidator, validate, updateCompanyInformation);
userDataRoutes.post("/updatePayment", userAuth,updatePaymentValidator, validate, updatePayment);


// routes for create new order
const {getAllCompanyAllDetials, getSiteInformation, newDriverSubmitOrder, handleNewPincode} = require("../../Controllers/User/CreateNewOrder")
userDataRoutes.get("/getAllCompanyAllDetials",userAuth, getAllCompanyAllDetials);
userDataRoutes.post("/getSiteInformation",userAuth, getSiteInformation);
userDataRoutes.post("/handleNewPincode",userAuth, handleNewPincode);
userDataRoutes.post("/newDriverSubmitOrder",userAuth, newDriverSubmitOrder);

module.exports = userDataRoutes;