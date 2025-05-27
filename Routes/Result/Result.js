const express = require("express");
const resultRoutes = express.Router();

const {sendWSDLFile, I3screenListner} = require("../../Controllers/Result/Result")


resultRoutes.get("/get_wsdl_file", sendWSDLFile)
resultRoutes.post("/I3screenListner", I3screenListner)


module.exports = resultRoutes