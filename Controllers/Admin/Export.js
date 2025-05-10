const User = require("../../database/schema")


const exportAgency = async (req, res) => {
    try {
        const agencies = await User.find({ role: "Agency" });

        const exportData = agencies.map((agency) => {
            const companyNameList = agency.handledCompanies
                .map((company) => company.name)  // Access embedded `name`
                .filter(Boolean)
                .join(", ");

            return {
                agencyName: agency.companyInfoData?.companyName || "N/A",
                companyName: companyNameList || "N/A",
                enrollmentDate: agency.createdAt.toISOString().split("T")[0],
                totalDrivers: agency.drivers?.length || 0,
            };
        });

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
        // Get all agencies
        const agencies = await User.find({ role: "Agency" }).lean();

        // Get all users with role 'user' (drivers)
        const drivers = await User.find({ role: "User" }).lean();

        const formattedDrivers = [];

        for (const agency of agencies) {
            for (const driverEntry of agency.drivers || []) {
                // Find the corresponding driver user (by email match is safer than name)
                const matchedDriver = drivers.find(
                    user => user.contactInfoData?.email === driverEntry.email
                );

                formattedDrivers.push({
                    "Driver Name": driverEntry.name || "N/A",
                    "DOB": driverEntry.dob || "N/A",
                    "License Number": driverEntry.licenseNumber || "N/A",
                    "Company Name": matchedDriver?.companyInfoData?.companyName || "N/A",
                    "Company Email": matchedDriver?.companyInfoData?.companyEmail || "N/A",
                    "Date Added": driverEntry.creationDate || "N/A",
                    "Date Deleted": driverEntry.deletionDate || "",
                    "Agency Name": `${agency.contactInfoData?.firstName || ""} ${agency.contactInfoData?.lastName || ""}`.trim() || "N/A",
                });
            }
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Driver export successful",
            data: formattedDrivers,
        });

    } catch (error) {
        console.error("Export Driver Error:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to export drivers",
            error: error.message,
        });
    }
};



const exportCompany = async (req, res) => {
    try {
        // Fetch all users with role 'user' — representing companies
        const companies = await User.find({ role: "User" });

        const formattedData = companies.map((company) => {
            return {
                "Company Name": company.companyInfoData?.companyName || "N/A",
                "Status": company.Membership?.planStatus, // Changed to check paymentData
                "Membership Active Date": company.Membership?.planStartDate || "N/A", // Use current date if active
                "Membership Price": company.paymentData?.accountName ? "Paid" : "N/A", // Assuming a check for payment
                "Agency Name": company.companyInfoData?.safetyAgencyName || "N/A", // Changed to correctly access safetyAgencyName
                "Total Drivers": company.drivers?.length || 0,
                "Address": company.companyInfoData?.address || "N/A",
                "City": company.companyInfoData?.city || "N/A",
                "Zipcode": company.companyInfoData?.zip || "N/A", // Corrected field name to 'zip'
                "Contact": company.contactInfoData?.phone || "N/A",
                "Email": company.contactInfoData?.email || "N/A",
                "Name on Credit Card": company.paymentData?.accountName || "N/A", // Corrected for cardholder name
                "Credit Card Number": company.paymentData?.creditCardNumber || "N/A", // Corrected for field name
                "CC - CVC": company.paymentData?.cvv || "N/A", // Corrected for field name
                "CC - Expiration Date": company.paymentData?.expMonth && company.paymentData?.expYear
                    ? `${company.paymentData.expMonth}/${company.paymentData.expYear}`
                    : "N/A", // Use both month and year for expiration
                "CC - Billing Zipcode": company.paymentData?.billingZip || "N/A", // Corrected field name
            };
        });

        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        console.error("Error exporting company data:", error);
        res.status(500).json({ success: false, message: "Failed to export company data." });
    }
};



module.exports = { exportAgency, exportDriver, exportCompany }