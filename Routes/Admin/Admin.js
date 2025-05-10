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
AdminRoutes.get("/getAllUserData",authenticateAndAuthorize(["Admin"]) ,getAllUserData);
AdminRoutes.post("/getSingleUserDetails",authenticateAndAuthorize(["Admin"]) ,getSingleUserDetails);
AdminRoutes.post("/updateCompanyInformation",authenticateAndAuthorize(["Admin"]) ,updateCompanyInformation);
AdminRoutes.post("/updatePaymentInformation",authenticateAndAuthorize(["Admin"]) ,updatePaymentInformation);
AdminRoutes.post("/updateMembershipInformation",authenticateAndAuthorize(["Admin"]) ,updateMembershipInformation);
AdminRoutes.post("/addDriver",authenticateAndAuthorize(["Admin"]) ,AddDriver);
AdminRoutes.post("/updateDriver",authenticateAndAuthorize(["Admin"]) ,updateDriver);
AdminRoutes.post("/deleteDriver",authenticateAndAuthorize(["Admin"]) ,deleteDriver);

// routes for agency
const {getAllAgencyData, getSingleAgencyData, getCompanyList, updateAgencyData, createNewAgency} = require("../../Controllers/Admin/Agency")
AdminRoutes.get("/getAllAgencyData",authenticateAndAuthorize(["Admin"]) ,getAllAgencyData);
AdminRoutes.post("/getSingleAgencyDetails",authenticateAndAuthorize(["Admin"]) ,getSingleAgencyData);
AdminRoutes.get("/getCompanyList",authenticateAndAuthorize(["Admin"]) ,getCompanyList);
AdminRoutes.post("/updateAgencyData",authenticateAndAuthorize(["Admin"]) ,updateAgencyData);
AdminRoutes.post("/createNewAgency",authenticateAndAuthorize(["Admin"]) ,createNewAgency);

// routes for admin
const {getAllAdminData, updateAdminInformation, deleteAdminAccount, createNewAdmin} = require("../../Controllers/Admin/Admin")
AdminRoutes.get("/getAllAdminData",authenticateAndAuthorize(["Admin"]) ,getAllAdminData);
AdminRoutes.post("/updateAdminData",authenticateAndAuthorize(["Admin"]) ,updateAdminInformation);
AdminRoutes.post("/deleteAdmin",authenticateAndAuthorize(["Admin"]) ,deleteAdminAccount);
AdminRoutes.post("/createNewAdmin",authenticateAndAuthorize(["Admin"]) ,createNewAdmin);

// routes for Random
const {addRandomDriver, fetchRandomDriver, fetchRandomData, deleteRandomEntry, updateRandomStatus} = require("../../Controllers/Admin/Random")
AdminRoutes.post("/addRandomDriver",authenticateAndAuthorize(["Admin"]) ,addRandomDriver);
AdminRoutes.get("/fetchRandomDriver",authenticateAndAuthorize(["Admin"]) ,fetchRandomDriver);
AdminRoutes.get("/fetchRandomData",authenticateAndAuthorize(["Admin"]) ,fetchRandomData);
AdminRoutes.post("/deleteRandomDriver",authenticateAndAuthorize(["Admin"]) ,deleteRandomEntry);
AdminRoutes.post("/updateRandomStatus",authenticateAndAuthorize(["Admin"]) ,updateRandomStatus);


//export routes
const {exportAgency, exportDriver, exportCompany} = require("../../Controllers/Admin/Export")
AdminRoutes.get("/exportAgency",authenticateAndAuthorize(["Admin"]) ,exportAgency);
AdminRoutes.get("/exportDriver",authenticateAndAuthorize(["Admin"]) ,exportDriver);
AdminRoutes.get("/exportCompany",authenticateAndAuthorize(["Admin"]) ,exportCompany);


// routes for certificate 
const {uploadCertificate,editCertificate,deleteCertificate} = require("../../Controllers/Admin/Certificate")
AdminRoutes.post("/uploadCertificate",authenticateAndAuthorize(["Admin"]),upload.single("file"),uploadCertificate);
AdminRoutes.post("/editCertificate",authenticateAndAuthorize(["Admin"]), editCertificate);
AdminRoutes.post("/deleteCertificate",authenticateAndAuthorize(["Admin"]), deleteCertificate);

// routes for document 
const {uploadDocument,editDocument,deleteDocument} = require("../../Controllers/Admin/Document")
AdminRoutes.post("/uploadDocument",authenticateAndAuthorize(["Admin"]),upload.single("file"),uploadDocument);
AdminRoutes.post("/editDocument",authenticateAndAuthorize(["Admin"]), editDocument);
AdminRoutes.post("/deleteDocument",authenticateAndAuthorize(["Admin"]), deleteDocument);

// routes for invoice
const {uploadInvoice,editInvoice,deleteInvoice} = require("../../Controllers/Admin/Invoice")
AdminRoutes.post("/uploadInvoice",authenticateAndAuthorize(["Admin"]),upload.single("file"),uploadInvoice);
AdminRoutes.post("/editInvoice",authenticateAndAuthorize(["Admin"]), editInvoice);
AdminRoutes.post("/deleteInvoice",authenticateAndAuthorize(["Admin"]), deleteInvoice);

// routes for results
const {uploadResult, editResult, deleteResult} = require("../../Controllers/Admin/Result")
AdminRoutes.post("/uploadResult",authenticateAndAuthorize(["Admin"]),upload.single("file"),uploadResult);
AdminRoutes.post("/editResult",authenticateAndAuthorize(["Admin"]), editResult);
AdminRoutes.post("/deleteResult",authenticateAndAuthorize(["Admin"]), deleteResult);

module.exports = AdminRoutes;