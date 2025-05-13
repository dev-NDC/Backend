const User = require("../../database/schema")
const axios = require('axios');
const crypto = require("crypto");
require('dotenv').config();
const username = process.env.USERID;
const password = process.env.PASSWORD;

const getAllCompanyAllDetials = async (req, res) => {
    try {
        const companies = await User.find({
            role: ["User"],
            "Membership.planStatus": "Active"
        });
        const formattedCompanies = companies.map((company) => ({
            _id: company._id,
            companyName: company.companyInfoData.companyName || "",
            companyDetails: company.companyInfoData,
            packages: company.Membership?.package?.map(pkg => ({
                _id: pkg._id,
                packageName: pkg.package_name || "",
            })) || [],
            orderReasons: company.Membership?.order_reason?.map(reason => ({
                _id: reason._id,
                orderReasonName: reason.order_reason_name || ""
            })) || []
        }));

        res.status(200).json({
            errorStatus: 0,
            message: "All company details retrieved successfully",
            data: formattedCompanies,
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};

function generateOrderReference() {
    const uuid = crypto.randomUUID(); // 36 chars
    const timestamp = Date.now().toString(36); // base36 for compactness (~7 chars)
    const randomSuffix = crypto.randomBytes(1).toString("hex"); // 2 bytes = 2 chars

    // Combine and trim/pad to exactly 45 characters
    let reference = `${uuid}-${timestamp}-${randomSuffix}`.replace(/[^a-zA-Z0-9]/g, '');
    return reference.slice(0, 45);
}
function formatDateTime(input) {
    const [date, time] = input.split("T");
    const [hour, minute] = time.split(":");
    return `${date} ${hour}:${minute}:00`;
}

const getSiteInformation = async (req, res) => {
    try {
        const { companyId, packageId, orderReasonId, formData } = req.body;
        const user = await User.findById(companyId);
        const orgId = user.Membership?.orgId;
        const location_code = user.Membership?.locationCode;
        const package_code = packageId
        const order_reason = orderReasonId
        let expiration_date_time = formData.orderExpires;
        let formattedExpiration = formatDateTime(expiration_date_time);
        const referenceNumber = generateOrderReference();

        const payloadForCreate = {
            "dot_agency": "",
            "expiration_date_time": formattedExpiration,
            "lab_location_code": "",
            "location_code": location_code,
            "order_reason": order_reason,
            "order_reference_number": referenceNumber,
            "org_id": orgId,
            "package_code": package_code,
            "participant_address": formData.address,
            "participant_dob": formData.dob,
            "participant_email": "vedprakash182001@gmail.com",
            "participant_first_name": formData.firstName,
            "participant_government_id": formData.ssn,
            "participant_last_name": formData.lastName,
            "participant_municipality": formData.city,
            "participant_phone": formData.phone1,
            "participant_postal_code": formData.zip,
            "participant_region": formData.state,
            "report message": ""
        }

        const response = await axios.post(
            'https://demo.i3screen.net/api/scheduling/create',
            payloadForCreate,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username,
                    password
                }
            }
        );

        const success = response.data.success;
        const caseNumber = response.data.case_number;
        const scheduling_url = response.data.case_data.scheduling_url;

        const payloadForSites = {
            "case_number": caseNumber,
            "search_radius": "100",
            "postal_code": formData.zip,
            "address": "",
            "municipality": "",
            "province": "",
            "country": "US",
            "show_price": "0"
        }
        const siteResponse = await axios.post(
            'https://demo.i3screen.net/api/scheduling/sitesv2',
            payloadForSites,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username,
                    password
                }
            }
        );
        const siteData = siteResponse.data;
        const siteSuccess = siteData.success;
        let sites = siteData.sites;
        res.status(200).json({
            errorStatus: 0,
            message: "All site information retrieved successfully",
            data: sites,
            caseNumber,
        });
    } catch (error) {
        console.log(error.response)
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.response?.data || error.message,
        });
    }
};

const handleNewPincode = async (req, res) => {
    console.log(req.body)
    try {
        const payloadForSites = {
            "case_number": req.body.caseNumber,
            "search_radius": "100",
            "postal_code": req.body.data,
            "address": "",
            "municipality": "",
            "province": "",
            "country": "US",
            "show_price": "0"
        }
        const siteResponse = await axios.post(
            'https://demo.i3screen.net/api/scheduling/sitesv2',
            payloadForSites,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username,
                    password
                }
            }
        );
        const siteData = siteResponse.data;
        const siteSuccess = siteData.success;
        let sites = siteData.sites;
        res.status(200).json({
            errorStatus: 0,
            message: "All site information retrieved successfully",
            data: sites,
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.response?.data || error.message,
        });
    }
}

const newDriverSubmitOrder = async (req, res) => {
    try {
        const payloadForCreate = {
            case_number: req.body.caseNumber,
            collection_site_link_id: req.body.finlSelectedSite.collection_site_link_id,
        };

        const username = process.env.USERID;
        const password = process.env.PASSWORD;

        const response = await axios.post(
            "https://demo.i3screen.net/api/scheduling/schedule",
            payloadForCreate,
            {
                headers: { "Content-Type": "application/json" },
                auth: { username, password }
            }
        );

        const { companyId, orderReasonId } = req.body;

        // Create new driver object
        const newDriver = {
            government_id: req.body.formData.ssn,
            first_name: req.body.formData.firstName,
            last_name: req.body.formData.lastName,
            phone: req.body.formData.phone1,
            email: "random",
            postal_code: req.body.formData.zip,
            region: req.body.formData.state,
            municipality: req.body.formData.city,
            address: req.body.formData.address,
            dob: req.body.formData.dob,
            isActive: false,
            creationDate: new Date().toISOString(),
            createdBy: req.body.createdBy || "Admin", // optional fallback
        };

        // Add the driver to the company
        const user = await User.findById(companyId);
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Company user not found",
            });
        }
        user.drivers.push(newDriver);
        await user.save();


        // Get the new driver's _id (last element in array)
        const addedDriver = user.drivers[user.drivers.length - 1];

        const orderReasonName = orderReasonId;

        const resultToPush = {
            driverId: addedDriver._id,
            caseNumber: req.body.caseNumber,
            date: new Date(),
            testType: orderReasonName,
            status: "Pending",
            file: null,
            filename: "",
            mimeType: ""
        };

        // Push the result into user's results array
        user.results.push(resultToPush);
        await user.save();
        res.status(200).json({
            errorStatus: 0,
            message: "Case has been scheduled and driver added",
            driverId: addedDriver._id,
        });
    } catch (error) {
        const status = error.response?.status;
        if (status === 422) {
            return res.status(442).json({
                errorStatus: 1,
                message: "Case has already been scheduled"
            });
        }

        console.error(error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
        });
    }
};




module.exports = {
    getAllCompanyAllDetials,
    getSiteInformation,
    newDriverSubmitOrder,
    handleNewPincode
}