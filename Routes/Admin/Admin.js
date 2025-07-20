const express = require("express");
const AdminRoutes = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {verifyAdmin} = require("../../Controllers/Admin/ValidateAdmin");
const {getAllUserData,getSingleUserDetails,updateCompanyInformation,updatePaymentInformation, updateMembershipInformation } = require("../../Controllers/Admin/UserData")

const {adminAuth} = require("../../Middleware/adminAuth")


AdminRoutes.get("/verify", adminAuth, verifyAdmin);
AdminRoutes.get("/getAllUserData",adminAuth ,getAllUserData);
AdminRoutes.post("/getSingleUserDetails",adminAuth ,getSingleUserDetails);
AdminRoutes.post("/updateCompanyInformation",adminAuth ,updateCompanyInformation);
AdminRoutes.post("/updatePaymentInformation",adminAuth ,updatePaymentInformation);
AdminRoutes.post("/updateMembershipInformation",adminAuth ,updateMembershipInformation);


// routes for driver
const {AddDriver, updateDriver, deleteDriver, allCompany, ChangeDriverCompany, permanentlyDeleteDriver} = require("../../Controllers/Admin/Driver")
AdminRoutes.post("/addDriver",adminAuth ,AddDriver);
AdminRoutes.post("/updateDriver",adminAuth ,updateDriver);
AdminRoutes.post("/deleteDriver",adminAuth ,deleteDriver);
AdminRoutes.post("/permanentlyDeleteDriver",adminAuth ,permanentlyDeleteDriver);
AdminRoutes.get("/allCompany",adminAuth ,allCompany);
AdminRoutes.post("/changeDriverCompany",adminAuth ,ChangeDriverCompany);

// routes for admin dashboard
const {getCustomerAndAgencyCount, getUserCountsLast6Months, getMonthlyTestScheduleStats, getWebsiteVisitsLast6Months} = require("../../Controllers/Admin/Dashboard")
AdminRoutes.get("/getCustomerAndAgencyCount",adminAuth, getCustomerAndAgencyCount);
AdminRoutes.get("/getUserCountsLast6Months",adminAuth, getUserCountsLast6Months);
AdminRoutes.get("/getMonthlyTestScheduleStats",adminAuth, getMonthlyTestScheduleStats);
AdminRoutes.get("/getWebsiteVisitsLast6Months",adminAuth, getWebsiteVisitsLast6Months);

// routes for agency
const {getAllAgencyData, getSingleAgencyData, getCompanyList, updateAgencyData, createNewAgency, deleteAgency} = require("../../Controllers/Admin/Agency")
AdminRoutes.get("/getAllAgencyData",adminAuth ,getAllAgencyData);
AdminRoutes.post("/getSingleAgencyDetails",adminAuth ,getSingleAgencyData);
AdminRoutes.get("/getCompanyList",adminAuth ,getCompanyList);
AdminRoutes.post("/updateAgencyData",adminAuth ,updateAgencyData);
AdminRoutes.post("/createNewAgency",adminAuth ,createNewAgency);
AdminRoutes.post("/deleteAgency",adminAuth ,deleteAgency);


// routes for admin
const {getAllAdminData, updateAdminInformation, deleteAdminAccount, createNewAdmin} = require("../../Controllers/Admin/Admin")
AdminRoutes.get("/getAllAdminData",adminAuth ,getAllAdminData);
AdminRoutes.post("/updateAdminData",adminAuth ,updateAdminInformation);
AdminRoutes.post("/deleteAdmin",adminAuth ,deleteAdminAccount);
AdminRoutes.post("/createNewAdmin",adminAuth ,createNewAdmin);

// routes for Random
const {addRandomDriver, fetchRandomDriver, fetchRandomData, deleteRandomEntry, updateRandomStatus, sendEmailToRandomDriver} = require("../../Controllers/Admin/Random")
AdminRoutes.post("/addRandomDriver",adminAuth ,addRandomDriver);
AdminRoutes.get("/fetchRandomDriver",adminAuth ,fetchRandomDriver);
AdminRoutes.get("/fetchRandomData",adminAuth ,fetchRandomData);
AdminRoutes.post("/deleteRandomDriver",adminAuth ,deleteRandomEntry);
AdminRoutes.post("/updateRandomStatus",adminAuth ,updateRandomStatus);
AdminRoutes.post("/sendEmailToRandomDriver",adminAuth ,sendEmailToRandomDriver);


//export routes
const {exportAgency, exportDriver, exportCompany} = require("../../Controllers/Admin/Export")
AdminRoutes.get("/exportAgency",adminAuth ,exportAgency);
AdminRoutes.get("/exportDriver",adminAuth ,exportDriver);
AdminRoutes.get("/exportCompany",adminAuth ,exportCompany);


// routes for certificate 
const {uploadCertificate,editCertificate,deleteCertificate} = require("../../Controllers/Admin/Certificate")
AdminRoutes.post("/uploadCertificate",adminAuth,upload.single("file"),uploadCertificate);
AdminRoutes.post("/editCertificate",adminAuth, editCertificate);
AdminRoutes.post("/deleteCertificate",adminAuth, deleteCertificate);

// routes for document 
const {uploadDocument,editDocument,deleteDocument} = require("../../Controllers/Admin/Document")
AdminRoutes.post("/uploadDocument",adminAuth,upload.single("file"),uploadDocument);
AdminRoutes.post("/editDocument",adminAuth, editDocument);
AdminRoutes.post("/deleteDocument",adminAuth, deleteDocument);

// routes for invoice
const {uploadInvoice,editInvoice,deleteInvoice} = require("../../Controllers/Admin/Invoice")
AdminRoutes.post("/uploadInvoice",adminAuth,upload.single("file"),uploadInvoice);
AdminRoutes.post("/editInvoice",adminAuth, editInvoice);
AdminRoutes.post("/deleteInvoice",adminAuth, deleteInvoice);

// routes for results
const {uploadResult, editResult, deleteResult, getAllResult} = require("../../Controllers/Admin/Result")
AdminRoutes.post("/uploadResult",adminAuth,upload.single("file"),uploadResult);
AdminRoutes.post("/editResult", adminAuth, upload.single("file"), editResult);
AdminRoutes.post("/deleteResult",adminAuth, deleteResult);
AdminRoutes.get("/getAllResult",adminAuth, getAllResult);


// routes for create new order
const {getAllCompanyAllDetials, getSiteInformation, newDriverSubmitOrder, handleNewPincode} = require("../../Controllers/Admin/CreateNewOrder")
AdminRoutes.get("/getAllCompanyAllDetials",adminAuth, getAllCompanyAllDetials);
AdminRoutes.post("/getSiteInformation",adminAuth, getSiteInformation);
AdminRoutes.post("/handleNewPincode",adminAuth, handleNewPincode);
AdminRoutes.post("/newDriverSubmitOrder",adminAuth, newDriverSubmitOrder);


// routes for notes
const {addNote, editNote, deleteNote} = require("../../Controllers/Admin/Notes");
AdminRoutes.post("/addNote",adminAuth, addNote);
AdminRoutes.post("/editNote",adminAuth, editNote);
AdminRoutes.post("/deleteNote",adminAuth, deleteNote);


// routes for settings
const {updateSendWelcomeEmail, updateSendCustomerPDF, updateSendAgreementPDF, updateSendCertificatePDF, updateOrgIdAndLocationCode, getSettings} = require("../../Controllers/Admin/Setting");

AdminRoutes.post("/updateSendWelcomeEmail", adminAuth, updateSendWelcomeEmail);
AdminRoutes.post("/updateSendCustomerPDF", adminAuth, updateSendCustomerPDF);
AdminRoutes.post("/updateSendAgreementPDF", adminAuth, updateSendAgreementPDF);
AdminRoutes.post("/updateSendCertificatePDF", adminAuth, updateSendCertificatePDF);
AdminRoutes.post("/updateOrgIdAndLocationCode", adminAuth, updateOrgIdAndLocationCode);
AdminRoutes.get("/getSettings", adminAuth, getSettings); 

module.exports = AdminRoutes;