const User = require("../../database/User");
const Agency = require("../../database/Agency");
const Driver = require("../../database/Driver");
const Result = require("../../database/Result");
const Certificate = require("../../database/Certificate");
const Invoice = require("../../database/Invoice");
const Random = require("../../database/Random");

const isCompanyHandledByAgency = require("./checkAgencyPermission");

const getAllUserData = async (req, res) => {
    try {
        const agencyId = req.user.id;
        // Fetch agency
        const currentAgency = await Agency.findById(agencyId);
        if (!currentAgency) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Agency not found",
            });
        }

        const handledCompanyIds = currentAgency.handledCompanies?.map(c => c._id) || [];
        if (handledCompanyIds.length === 0) {
            return res.status(200).json({
                errorStatus: 0,
                message: "No companies handled yet",
                data: [],
            });
        }

        // Fetch all users (companies) for this agency
        const users = await User.find(
            { _id: { $in: handledCompanyIds } },
            "_id companyInfoData.contactNumber companyInfoData.companyEmail companyInfoData.companyName companyInfoData.usdot Membership"
        );

        // Fetch all drivers for these companies in one go
        const allDrivers = await Driver.find({ user: { $in: handledCompanyIds }, isDeleted: false, isActive: true }).select("user");

        // Count active drivers per company
        const driverCountMap = {};
        allDrivers.forEach(d => {
            const key = d.user.toString();
            driverCountMap[key] = (driverCountMap[key] || 0) + 1;
        });

        const formattedUsers = users.map(user => ({
            companyName: user.companyInfoData?.companyName || "N/A",
            companyEmail: user.companyInfoData?.companyEmail || "N/A",
            companyContactNumber: user.companyInfoData?.contactNumber || "N/A",
            activeDriversCount: driverCountMap[user._id.toString()] || 0,
            companyUSDOTNumber: user.companyInfoData?.usdot || "N/A",
            status: user.Membership?.planStatus || "N/A",
            id: user._id
        }));

        res.status(200).json({
            errorStatus: 0,
            message: "Data retrieved successfully",
            data: formattedUsers
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};

const getSingleUserDetails = async (req, res) => {
    try {
        const userId = req.body.id;
        const agencyId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required",
            });
        }

        // Fetch current agency
        const agency = await Agency.findById(agencyId);
        if (!agency) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Unauthorized access – agency not found",
            });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(userId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }

        // Fetch user details
        const user = await User.findById(userId).select("-contactInfoData.password");
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        const userObj = user.toObject();

        // Fetch related collections
        const [drivers, results, certificates, invoices, randoms] = await Promise.all([
            Driver.find({ user: userId }),
            Result.find({ user: userId }),
            Certificate.find({ user: userId }),
            Invoice.find({ user: userId }),
            Random.find({ "company._id": userId }), // adjust based on actual schema
        ]);

        // Map drivers for result enrichment
        const driverMap = {};
        drivers.forEach(driver => {
            driverMap[driver._id.toString()] = driver;
        });

        // Enrich results with driver info
        const enrichedResults = results.map(result => {
            const driver = driverMap[result.driverId?.toString()];
            return {
                ...result.toObject(),
                driverName: driver ? `${driver.first_name} ${driver.last_name}` : "Unknown",
                licenseNumber: driver ? driver.government_id : "N/A",
            };
        });

        // Convert Buffers to base64
        const base64Certificates = certificates.map(cert => ({
            ...cert.toObject(),
            certificateFile: cert.certificateFile?.toString("base64"),
        }));

        const base64Invoices = invoices.map(invoice => ({
            ...invoice.toObject(),
            file: invoice.file?.toString("base64"),
        }));

        const base64Randoms = randoms.map(random => ({
            ...random.toObject(),
            // Add conversion if any Buffer fields exist in random schema
        }));

        // Assign processed data
        userObj.drivers = drivers;
        userObj.results = enrichedResults;
        userObj.certificates = base64Certificates;
        userObj.invoices = base64Invoices;
        userObj.randoms = base64Randoms;

        res.status(200).json({
            errorStatus: 0,
            message: "Data retrieved successfully",
            data: userObj,
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};



const updateCompanyInformation = async (req, res) => {
    try {
        const id = req.body.currentId;
        const companyInfoData = req.body.data;
        const agencyId = req.user.id;
        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(id, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { companyInfoData },
            { new: true, runValidators: true }
        ).select("-contactInfoData.password");
        if (!updatedUser) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Company information updated successfully",
            companyInfoData: updatedUser.companyInfoData
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "server error, please try again later"
        })
    }
};

const updatePaymentInformation = async (req, res) => {
    try {
        const id = req.body.currentId;
        const agencyId = req.user.id;
        const paymentData = req.body.data;

        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(id, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { paymentData },
            { new: true, runValidators: true }
        ).select("-contactInfoData.password");
        if (!updatedUser) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Payment information updated successfully",
            paymentData: updatedUser.paymentData
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "server error, please try again later"
        })
    }
};


module.exports = { getAllUserData, getSingleUserDetails, updateCompanyInformation, updatePaymentInformation };
