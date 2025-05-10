const express = require("express");
const AgencyRoutes = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {verifyAgency} = require("../../Controllers/Agency/ValidateAgency");
const {getAllUserData,getSingleUserDetails,updateCompanyInformation,updatePaymentInformation } = require("../../Controllers/Agency/UserData")
const {AddDriver, updateDriver, deleteDriver} = require("../../Controllers/Agency/Driver")
const {authenticateAndAuthorize} = require("../../Middleware/authenticateAndAuthorize")

const {Verification} = require("../../Middleware/verifyAgency")


AgencyRoutes.get("/verify", Verification(), verifyAgency);
AgencyRoutes.get("/getAllUserData",authenticateAndAuthorize(["Agency"]) ,getAllUserData);
AgencyRoutes.post("/getSingleUserDetails",authenticateAndAuthorize(["Agency"]) ,getSingleUserDetails);
AgencyRoutes.post("/updateCompanyInformation",authenticateAndAuthorize(["Agency"]) ,updateCompanyInformation);
AgencyRoutes.post("/updatePaymentInformation",authenticateAndAuthorize(["Agency"]) ,updatePaymentInformation);
AgencyRoutes.post("/addDriver",authenticateAndAuthorize(["Agency"]) ,AddDriver);
AgencyRoutes.post("/updateDriver",authenticateAndAuthorize(["Agency"]) ,updateDriver);
AgencyRoutes.post("/deleteDriver",authenticateAndAuthorize(["Agency"]) ,deleteDriver);


getAllUserData
// routes for certificate 
const {uploadCertificate,editCertificate,deleteCertificate} = require("../../Controllers/Agency/Certificate")
AgencyRoutes.post("/uploadCertificate",authenticateAndAuthorize(["Agency"]),upload.single("file"),uploadCertificate);
AgencyRoutes.post("/editCertificate",authenticateAndAuthorize(["Agency"]), editCertificate);
AgencyRoutes.post("/deleteCertificate",authenticateAndAuthorize(["Agency"]), deleteCertificate);

// routes for invoice
const {uploadInvoice,editInvoice,deleteInvoice} = require("../../Controllers/Agency/Invoice")
AgencyRoutes.post("/uploadInvoice",authenticateAndAuthorize(["Agency"]),upload.single("file"),uploadInvoice);
AgencyRoutes.post("/editInvoice",authenticateAndAuthorize(["Agency"]), editInvoice);
AgencyRoutes.post("/deleteInvoice",authenticateAndAuthorize(["Agency"]), deleteInvoice);

// routes for results
const {uploadResult, editResult, deleteResult} = require("../../Controllers/Agency/Result")
AgencyRoutes.post("/uploadResult",authenticateAndAuthorize(["Agency"]),upload.single("file"),uploadResult);
AgencyRoutes.post("/editResult",authenticateAndAuthorize(["Agency"]), editResult);
AgencyRoutes.post("/deleteResult",authenticateAndAuthorize(["Agency"]), deleteResult);

module.exports = AgencyRoutes;