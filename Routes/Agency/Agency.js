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
AgencyRoutes.get("/getAllUserData",authenticateAndAuthorize(["agency"]) ,getAllUserData);
AgencyRoutes.post("/getSingleUserDetails",authenticateAndAuthorize(["agency"]) ,getSingleUserDetails);
AgencyRoutes.post("/updateCompanyInformation",authenticateAndAuthorize(["agency"]) ,updateCompanyInformation);
AgencyRoutes.post("/updatePaymentInformation",authenticateAndAuthorize(["agency"]) ,updatePaymentInformation);
AgencyRoutes.post("/addDriver",authenticateAndAuthorize(["agency"]) ,AddDriver);
AgencyRoutes.post("/updateDriver",authenticateAndAuthorize(["agency"]) ,updateDriver);
AgencyRoutes.post("/deleteDriver",authenticateAndAuthorize(["agency"]) ,deleteDriver);



// routes for certificate 
const {uploadCertificate,editCertificate,deleteCertificate} = require("../../Controllers/Agency/Certificate")
AgencyRoutes.post("/uploadCertificate",authenticateAndAuthorize(["agency"]),upload.single("file"),uploadCertificate);
AgencyRoutes.post("/editCertificate",authenticateAndAuthorize(["agency"]), editCertificate);
AgencyRoutes.post("/deleteCertificate",authenticateAndAuthorize(["agency"]), deleteCertificate);

// routes for invoice
const {uploadInvoice,editInvoice,deleteInvoice} = require("../../Controllers/Agency/Invoice")
AgencyRoutes.post("/uploadInvoice",authenticateAndAuthorize(["agency"]),upload.single("file"),uploadInvoice);
AgencyRoutes.post("/editInvoice",authenticateAndAuthorize(["agency"]), editInvoice);
AgencyRoutes.post("/deleteInvoice",authenticateAndAuthorize(["agency"]), deleteInvoice);

// routes for results
const {uploadResult, editResult, deleteResult} = require("../../Controllers/Agency/Result")
AgencyRoutes.post("/uploadResult",authenticateAndAuthorize(["agency"]),upload.single("file"),uploadResult);
AgencyRoutes.post("/editResult",authenticateAndAuthorize(["agency"]), editResult);
AgencyRoutes.post("/deleteResult",authenticateAndAuthorize(["agency"]), deleteResult);

module.exports = AgencyRoutes;