const express = require("express");
const AgencyRoutes = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {verifyAgency} = require("../../Controllers/Agency/ValidateAgency");
const {getAllUserData,getSingleUserDetails,updateCompanyInformation,updatePaymentInformation } = require("../../Controllers/Agency/UserData")
const {AddDriver, updateDriver, deleteDriver} = require("../../Controllers/Agency/Driver")
const {agencyAuth} = require("../../Middleware/agencyAuth")


AgencyRoutes.get("/verify", agencyAuth, verifyAgency);
AgencyRoutes.get("/getAllUserData", agencyAuth ,getAllUserData);
AgencyRoutes.post("/getSingleUserDetails", agencyAuth ,getSingleUserDetails);
AgencyRoutes.post("/updateCompanyInformation", agencyAuth ,updateCompanyInformation);
AgencyRoutes.post("/updatePaymentInformation", agencyAuth ,updatePaymentInformation);
AgencyRoutes.post("/addDriver", agencyAuth ,AddDriver);
AgencyRoutes.post("/updateDriver", agencyAuth ,updateDriver);
AgencyRoutes.post("/deleteDriver", agencyAuth ,deleteDriver);


getAllUserData
// routes for certificate 
const {uploadCertificate,editCertificate,deleteCertificate} = require("../../Controllers/Agency/Certificate")
AgencyRoutes.post("/uploadCertificate", agencyAuth,upload.single("file"),uploadCertificate);
AgencyRoutes.post("/editCertificate", agencyAuth, editCertificate);
AgencyRoutes.post("/deleteCertificate", agencyAuth, deleteCertificate);

// routes for invoice
const {uploadInvoice,editInvoice,deleteInvoice} = require("../../Controllers/Agency/Invoice")
AgencyRoutes.post("/uploadInvoice", agencyAuth,upload.single("file"),uploadInvoice);
AgencyRoutes.post("/editInvoice", agencyAuth, editInvoice);
AgencyRoutes.post("/deleteInvoice", agencyAuth, deleteInvoice);

// routes for results
const {uploadResult, editResult, deleteResult} = require("../../Controllers/Agency/Result")
AgencyRoutes.post("/uploadResult", agencyAuth,upload.single("file"),uploadResult);
AgencyRoutes.post("/editResult", agencyAuth, editResult);
AgencyRoutes.post("/deleteResult", agencyAuth, deleteResult);

// routes for create new order
const {getAllCompanyAllDetials, getSiteInformation, newDriverSubmitOrder, handleNewPincode} = require("../../Controllers/Agency/CreateNewOrder")
AgencyRoutes.get("/getAllCompanyAllDetials", agencyAuth, getAllCompanyAllDetials);
AgencyRoutes.post("/getSiteInformation", agencyAuth, getSiteInformation);
AgencyRoutes.post("/handleNewPincode", agencyAuth, handleNewPincode);
AgencyRoutes.post("/newDriverSubmitOrder", agencyAuth, newDriverSubmitOrder);

module.exports = AgencyRoutes;