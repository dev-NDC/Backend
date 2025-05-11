const User = require("../../database/schema")
const axios = require('axios');
const crypto = require("crypto");
require('dotenv').config();


const getAllCompanyAllDetials = async (req, res) => {
    try {
        const companies = await User.find({ role: ["User"] });

        const formattedCompanies = companies.map((company) => ({
            _id: company._id,
            companyName: company.companyInfoData.companyName || "",
            packages: company.packageAndOrder?.package?.map(pkg => ({
                _id: pkg._id,
                packageCode: pkg.package_code || "",
                packageName: pkg.package_name || "",
                packageType: pkg.package_type || ""
            })) || [],
            orderReasons: company.packageAndOrder?.order_reason?.map(reason => ({
                _id: reason._id,
                orderReasonCode: reason.order_reason_code || "",
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
        const package_code = user.packageAndOrder?.package?.find(pkg => pkg._id.toString() === packageId)?.package_code;
        const order_reason = user.packageAndOrder?.order_reason?.find(reason => reason._id.toString() === orderReasonId)?.order_reason_code;
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
            "participant_email": "junemassie626@gmail.com",
            "participant_first_name": formData.firstName,
            "participant_government_id": formData.ssn,
            "participant_last_name": formData.lastName,
            "participant_municipality": formData.city,
            "participant_phone": formData.phone1,
            "participant_postal_code": formData.zip,
            "participant_region": formData.state,
            "report message": ""
        }
        const username = process.env.USERID;
        const password = process.env.PASSWORD;

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
            data: sites
        });
    } catch (error) {
        console.error("Error in getSiteInformation:", error.response);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.response?.data || error.message,
        });
    }
};




module.exports = {
    getAllCompanyAllDetials,
    getSiteInformation
}