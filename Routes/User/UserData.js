const express = require("express");
const userDataRoutes = express.Router();

const {userData, updateCompanyInformation} = require("../../Controllers/User/UserData");
const {authenticateAndAuthorize} = require("../../Middleware/authenticateAndAuthorize")
const {AddDriver} = require("../../Controllers/User/Driver")


userDataRoutes.get("/getdata", authenticateAndAuthorize(["user"]), userData);
userDataRoutes.post("/updateCompanyInformation", authenticateAndAuthorize(["user"]), updateCompanyInformation);
userDataRoutes.post("/addDriver", authenticateAndAuthorize(["user"]),AddDriver);

module.exports = userDataRoutes;