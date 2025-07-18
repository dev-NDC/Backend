const express = require("express");
const AgencyRoutes = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {verifyAgency} = require("../../Controllers/Agency/ValidateAgency");
const {getAllUserData,getSingleUserDetails,updateCompanyInformation,updatePaymentInformation } = require("../../Controllers/Agency/UserData")
const {AddDriver, updateDriver, deleteDriver} = require("../../Controllers/Agency/Driver")
const {agencyAuth} = require("../../Middleware/agencyAuth")

// routes for agency dashboard
const {getCustomerAndAgencyCount, getUserCountsLast6Months, getMonthlyTestScheduleStats} = require("../../Controllers/Agency/Dashboard")
AgencyRoutes.get("/getCustomerAndAgencyCount",agencyAuth, getCustomerAndAgencyCount);
AgencyRoutes.get("/getUserCountsLast6Months",agencyAuth, getUserCountsLast6Months);
AgencyRoutes.get("/getMonthlyTestScheduleStats",agencyAuth, getMonthlyTestScheduleStats);


AgencyRoutes.get("/verify", agencyAuth, verifyAgency);
AgencyRoutes.get("/getAllUserData", agencyAuth ,getAllUserData);
AgencyRoutes.post("/getSingleUserDetails", agencyAuth ,getSingleUserDetails);
AgencyRoutes.post("/updateCompanyInformation", agencyAuth ,updateCompanyInformation);
AgencyRoutes.post("/updatePaymentInformation", agencyAuth ,updatePaymentInformation);
AgencyRoutes.post("/addDriver", agencyAuth ,AddDriver);
AgencyRoutes.post("/updateDriver", agencyAuth ,updateDriver);
AgencyRoutes.post("/deleteDriver", agencyAuth ,deleteDriver);


// getAllUserData
// routes for certificate 
// const {uploadCertificate,editCertificate,deleteCertificate} = require("../../Controllers/Agency/Certificate")
// AgencyRoutes.post("/uploadCertificate", agencyAuth,upload.single("file"),uploadCertificate);
// AgencyRoutes.post("/editCertificate", agencyAuth, editCertificate);
// AgencyRoutes.post("/deleteCertificate", agencyAuth, deleteCertificate);

// routes for invoice
// const {uploadInvoice,editInvoice,deleteInvoice} = require("../../Controllers/Agency/Invoice")
// AgencyRoutes.post("/uploadInvoice", agencyAuth,upload.single("file"),uploadInvoice);
// AgencyRoutes.post("/editInvoice", agencyAuth, editInvoice);
// AgencyRoutes.post("/deleteInvoice", agencyAuth, deleteInvoice);

// routes for results
const {uploadResult, editResult, deleteResult, getAllResult} = require("../../Controllers/Agency/Result")
// AgencyRoutes.post("/uploadResult", agencyAuth,upload.single("file"),uploadResult);
// AgencyRoutes.post("/editResult", agencyAuth, editResult);
// AgencyRoutes.post("/deleteResult", agencyAuth, deleteResult);
AgencyRoutes.get("/getAllResult",agencyAuth, getAllResult);

// routes for create new order
const {getAllCompanyAllDetials, getSiteInformation, newDriverSubmitOrder, handleNewPincode} = require("../../Controllers/Agency/CreateNewOrder")
AgencyRoutes.get("/getAllCompanyAllDetials", agencyAuth, getAllCompanyAllDetials);
AgencyRoutes.post("/getSiteInformation", agencyAuth, getSiteInformation);
AgencyRoutes.post("/handleNewPincode", agencyAuth, handleNewPincode);
AgencyRoutes.post("/newDriverSubmitOrder", agencyAuth, newDriverSubmitOrder);



// routes for Random
const {addRandomDriver, fetchRandomDriver, fetchRandomData, deleteRandomEntry, updateRandomStatus} = require("../../Controllers/Agency/Random")
AgencyRoutes.post("/addRandomDriver",agencyAuth ,addRandomDriver);
AgencyRoutes.get("/fetchRandomDriver",agencyAuth ,fetchRandomDriver);
AgencyRoutes.get("/fetchRandomData",agencyAuth ,fetchRandomData);
AgencyRoutes.post("/deleteRandomDriver",agencyAuth ,deleteRandomEntry);
AgencyRoutes.post("/updateRandomStatus",agencyAuth ,updateRandomStatus);


module.exports = AgencyRoutes;