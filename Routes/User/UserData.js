const express = require("express");
const userDataRoutes = express.Router();

const {userData, updateCompanyInformation,updatePayment} = require("../../Controllers/User/UserData");
const {authenticateAndAuthorize} = require("../../Middleware/authenticateAndAuthorize")
const {AddDriver, updateDriver, deleteDriver} = require("../../Controllers/User/Driver")


userDataRoutes.get("/getdata", authenticateAndAuthorize(["user"]), userData);
userDataRoutes.post("/updateCompanyInformation", authenticateAndAuthorize(["user"]), updateCompanyInformation);
userDataRoutes.post("/updatePayment", authenticateAndAuthorize(["user"]), updatePayment);
userDataRoutes.post("/addDriver", authenticateAndAuthorize(["user"]),AddDriver);
userDataRoutes.post("/updateDriver", authenticateAndAuthorize(["user"]),updateDriver);
userDataRoutes.post("/deleteDriver", authenticateAndAuthorize(["user"]),deleteDriver);

module.exports = userDataRoutes;