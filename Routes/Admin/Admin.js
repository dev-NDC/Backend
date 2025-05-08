const express = require("express");
const AdminRoutes = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {verifyAdmin} = require("../../Controllers/Admin/ValidateAdmin");
const {getAllUserData,getSingleUserDetails,updateCompanyInformation,updatePaymentInformation, updateMembershipInformation } = require("../../Controllers/Admin/UserData")
const {AddDriver, updateDriver, deleteDriver} = require("../../Controllers/Admin/Driver")
const {authenticateAndAuthorize} = require("../../Middleware/authenticateAndAuthorize")
const {Verification} = require("../../Middleware/verifyAdmin")


AdminRoutes.get("/verify", Verification(), verifyAdmin);
AdminRoutes.get("/getAllUserData",authenticateAndAuthorize(["admin"]) ,getAllUserData);
AdminRoutes.post("/getSingleUserDetails",authenticateAndAuthorize(["admin"]) ,getSingleUserDetails);
AdminRoutes.post("/updateCompanyInformation",authenticateAndAuthorize(["admin"]) ,updateCompanyInformation);
AdminRoutes.post("/updatePaymentInformation",authenticateAndAuthorize(["admin"]) ,updatePaymentInformation);
AdminRoutes.post("/updateMembershipInformation",authenticateAndAuthorize(["admin"]) ,updateMembershipInformation);
AdminRoutes.post("/addDriver",authenticateAndAuthorize(["admin"]) ,AddDriver);
AdminRoutes.post("/updateDriver",authenticateAndAuthorize(["admin"]) ,updateDriver);
AdminRoutes.post("/deleteDriver",authenticateAndAuthorize(["admin"]) ,deleteDriver);

// routes for agency
const {getAllAgencyData, getSingleAgencyData, getCompanyList, updateAgencyData, createNewAgency} = require("../../Controllers/Admin/Agency")
AdminRoutes.get("/getAllAgencyData",authenticateAndAuthorize(["admin"]) ,getAllAgencyData);
AdminRoutes.post("/getSingleAgencyDetails",authenticateAndAuthorize(["admin"]) ,getSingleAgencyData);
AdminRoutes.get("/getCompanyList",authenticateAndAuthorize(["admin"]) ,getCompanyList);
AdminRoutes.post("/updateAgencyData",authenticateAndAuthorize(["admin"]) ,updateAgencyData);
AdminRoutes.post("/createNewAgency",authenticateAndAuthorize(["admin"]) ,createNewAgency);

// routes for admin
const {getAllAdminData, updateAdminInformation, deleteAdminAccount, createNewAdmin} = require("../../Controllers/Admin/Admin")
AdminRoutes.get("/getAllAdminData",authenticateAndAuthorize(["admin"]) ,getAllAdminData);
AdminRoutes.post("/updateAdminData",authenticateAndAuthorize(["admin"]) ,updateAdminInformation);
AdminRoutes.post("/deleteAdmin",authenticateAndAuthorize(["admin"]) ,deleteAdminAccount);
AdminRoutes.post("/createNewAdmin",authenticateAndAuthorize(["admin"]) ,createNewAdmin);

// routes for Random
const {addRandomDriver, fetchRandomDriver, fetchRandomData, deleteRandomEntry, updateRandomStatus} = require("../../Controllers/Admin/Random")
AdminRoutes.post("/addRandomDriver",authenticateAndAuthorize(["admin"]) ,addRandomDriver);
AdminRoutes.get("/fetchRandomDriver",authenticateAndAuthorize(["admin"]) ,fetchRandomDriver);
AdminRoutes.get("/fetchRandomData",authenticateAndAuthorize(["admin"]) ,fetchRandomData);
AdminRoutes.post("/deleteRandomDriver",authenticateAndAuthorize(["admin"]) ,deleteRandomEntry);
AdminRoutes.post("/updateRandomStatus",authenticateAndAuthorize(["admin"]) ,updateRandomStatus);


//export routes
const {exportAgency, exportDriver, exportCompany} = require("../../Controllers/Admin/Export")
AdminRoutes.get("/exportAgency",authenticateAndAuthorize(["admin"]) ,exportAgency);
AdminRoutes.get("/exportDriver",authenticateAndAuthorize(["admin"]) ,exportDriver);
AdminRoutes.get("/exportCompany",authenticateAndAuthorize(["admin"]) ,exportCompany);


// routes for certificate 
const {uploadCertificate,editCertificate,deleteCertificate} = require("../../Controllers/Admin/Certificate")
AdminRoutes.post("/uploadCertificate",authenticateAndAuthorize(["admin"]),upload.single("file"),uploadCertificate);
AdminRoutes.post("/editCertificate",authenticateAndAuthorize(["admin"]), editCertificate);
AdminRoutes.post("/deleteCertificate",authenticateAndAuthorize(["admin"]), deleteCertificate);

// routes for document 
const {uploadDocument,editDocument,deleteDocument} = require("../../Controllers/Admin/Document")
AdminRoutes.post("/uploadDocument",authenticateAndAuthorize(["admin"]),upload.single("file"),uploadDocument);
AdminRoutes.post("/editDocument",authenticateAndAuthorize(["admin"]), editDocument);
AdminRoutes.post("/deleteDocument",authenticateAndAuthorize(["admin"]), deleteDocument);

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