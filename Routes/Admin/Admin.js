const express = require("express");
const AdminRoutes = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {verifyAdmin} = require("../../Controllers/Admin/ValidateAdmin");
const {getAllUserData,getSingleUserDetails,updateCompanyInformation,updatePaymentInformation } = require("../../Controllers/Admin/UserData")
const {AddDriver, updateDriver, deleteDriver} = require("../../Controllers/Admin/Driver")
const {authenticateAndAuthorize} = require("../../Middleware/authenticateAndAuthorize")

const {Verification} = require("../../Middleware/verifyAdmin")


AdminRoutes.get("/verify", Verification(), verifyAdmin);
AdminRoutes.get("/getAllUserData",authenticateAndAuthorize(["admin"]) ,getAllUserData);
AdminRoutes.post("/getSingleUserDetails",authenticateAndAuthorize(["admin"]) ,getSingleUserDetails);
AdminRoutes.post("/updateCompanyInformation",authenticateAndAuthorize(["admin"]) ,updateCompanyInformation);
AdminRoutes.post("/updatePaymentInformation",authenticateAndAuthorize(["admin"]) ,updatePaymentInformation);
AdminRoutes.post("/addDriver",authenticateAndAuthorize(["admin"]) ,AddDriver);
AdminRoutes.post("/updateDriver",authenticateAndAuthorize(["admin"]) ,updateDriver);
AdminRoutes.post("/deleteDriver",authenticateAndAuthorize(["admin"]) ,deleteDriver);


// routes for certificate 
const {uploadCertificate,editCertificate,deleteCertificate} = require("../../Controllers/Admin/Certificate")
AdminRoutes.post("/uploadCertificate",authenticateAndAuthorize(["admin"]),upload.single("file"),uploadCertificate);
AdminRoutes.post("/editCertificate",authenticateAndAuthorize(["admin"]), editCertificate);
AdminRoutes.post("/deleteCertificate",authenticateAndAuthorize(["admin"]), deleteCertificate);

// routes for invoice
const {uploadInvoice,editInvoice,deleteInvoice} = require("../../Controllers/Admin/Invoice")
AdminRoutes.post("/uploadInvoice",authenticateAndAuthorize(["admin"]),upload.single("file"),uploadInvoice);
AdminRoutes.post("/editInvoice",authenticateAndAuthorize(["admin"]), editInvoice);
AdminRoutes.post("/deleteInvoice",authenticateAndAuthorize(["admin"]), deleteInvoice);

// routes for results
const {uploadResult, editResult, deleteResult} = require("../../Controllers/Admin/Result")
AdminRoutes.post("/uploadResult",authenticateAndAuthorize(["admin"]),upload.single("file"),uploadResult);
AdminRoutes.post("/editResult",authenticateAndAuthorize(["admin"]), editResult);
AdminRoutes.post("/deleteResult",authenticateAndAuthorize(["admin"]), deleteResult);

module.exports = AdminRoutes;