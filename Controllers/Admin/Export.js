const User = require("../../database/User");
const Agency = require("../../database/Agency");
const Driver = require("../../database/Driver");



const exportAgency = async (req, res) => {
    try {
        const agencies = await Agency.find({}, "name handledCompanies createdAt");

        const exportData = await Promise.all(
            agencies.map(async (agency) => {
                const handledCompanyIds = agency.handledCompanies?.map(c => c._id) || [];

                // Fetch full user documents with all driver data
                const companies = await User.find({ _id: { $in: handledCompanyIds } });

                // Sum all active, non-deleted drivers across all companies
                let totalDrivers = 0;
                for (const company of companies) {
                    const validDrivers = company.drivers?.filter(driver =>
                        driver && driver.isActive === true && driver.isDeleted === false
                    ) || [];
                    totalDrivers += validDrivers.length;
                }

                const companyNameList = agency.handledCompanies
                    .map(company => company.name)
                    .filter(Boolean)
                    .join(", ");

                return {
                    agencyName: agency.name || "N/A",
                    companyName: companyNameList || "N/A",
                    enrollmentDate: agency.createdAt.toISOString().split("T")[0],
                    totalDrivers
                };
            })
        );

        res.status(200).json({
            errorStatus: 0,
            message: "Export list sent successfully",
            data: exportData,
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while exporting agency data",
            error: error.message,
        });
    }
};




const exportDriver = async (req, res) => {
    try {
        
        const agencies = await Agency.find().lean();

        // Fetch all users (companies)
        const users = await User.find().lean();
        
        // Build maps from company ID to agency name, company name, and email
        const companyIdToAgencyMap = {};
        const companyIdToCompanyNameMap = {};
        const companyIdToCompanyEmailMap = {};

        for (const user of users) {
            const userId = user._id.toString();
            companyIdToCompanyNameMap[userId] = user.companyInfoData?.companyName || "N/A";
            companyIdToCompanyEmailMap[userId] = user.companyInfoData?.companyEmail || "N/A";
        }
        
        for (const agency of agencies) {
            for (const company of agency.handledCompanies || []) {
                if (company && company._id) {
                    companyIdToAgencyMap[company._id.toString()] = agency.name || "N/A";
                }
            }
        }
        
        // Fetch only active drivers (those with negative test results)
        const drivers = await Driver.find({ isActive: true, isDeleted: false }).populate('user', 'companyInfoData').lean();
        console.log("Active Drivers from DB:", drivers.length);
        
        const formattedDrivers = [];
        for (const driver of drivers) {
            if (!driver || !driver.user) {
                console.warn("Driver missing user data:", driver?._id);
                continue;
            }
            
            const userId = driver.user._id ? driver.user._id.toString() : null;
            if (!userId) {
                console.warn("Driver user missing _id:", driver._id);
                continue;
            }
            
            formattedDrivers.push({
                agencyName: companyIdToAgencyMap[userId] || "N/A",
                companyName: companyIdToCompanyNameMap[userId] || "N/A",
                companyEmail: companyIdToCompanyEmailMap[userId] || "N/A",
                ...driver,
            });
        }
        
        console.log("Formatted Drivers:", formattedDrivers.length);
        res.status(200).json({
            errorStatus: 0,
            message: "Driver export successful",
            data: formattedDrivers,
        });

    } catch (error) {
        console.error("Error exporting drivers:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to export drivers",
            error: error.message,
        });
    }
};


const exportCompany = async (req, res) => {
    try {
        // Fetch all company users
        const companies = await User.find().lean();

        const formattedData = companies.map((company) => {
            const membershipStartDate = company.Membership?.planStartDate
                ? new Date(company.Membership.planStartDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                : "N/A";

            return {
                "Company Name": company.companyInfoData?.companyName || "N/A",
                "Status": company.Membership?.planStatus || "N/A",
                "Membership Active Date": membershipStartDate,
                "Membership Price": company.paymentData?.accountName ? "Paid" : "N/A",
                "Agency Name": company.companyInfoData?.safetyAgencyName || "N/A",
                "Total Drivers": company.drivers?.length || 0,
                "Address": company.companyInfoData?.address || "N/A",
                "City": company.companyInfoData?.city || "N/A",
                "Zipcode": company.companyInfoData?.zip || "N/A",
                "Contact": company.contactInfoData?.phone || "N/A",
                "Email": company.contactInfoData?.email || "N/A",
                "Name on Credit Card": company.paymentData?.accountName || "N/A",
                "Credit Card Number": company.paymentData?.creditCardNumber || "N/A",
                "CC - CVC": company.paymentData?.cvv || "N/A",
                "CC - Expiration Date": company.paymentData?.expMonth && company.paymentData?.expYear
                    ? `${String(company.paymentData.expMonth).padStart(2, "0")}/${company.paymentData.expYear}`
                    : "N/A",
                "CC - Billing Zipcode": company.paymentData?.billingZip || "N/A",
            };
        });

        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to export company data." });
    }
};



module.exports = { exportAgency, exportDriver, exportCompany }
