const User = require("../../database/User");
const Driver = require("../../database/Driver");
const Result = require("../../database/Result");
const Certificate = require("../../database/Certificate");
const Invoice = require("../../database/Invoice");
const Random = require("../../database/Random");

const userData = async (req, res) => {
    try {
        const id = req.user.id;
        const data = await User.findById(id).select("-contactInfoData.password -_id");
        if (!data) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }
        const userObj = data.toObject();

        // Fetch all related collections
        const [drivers, results, certificates, invoices, randoms] = await Promise.all([
            Driver.find({ user: id }),
            Result.find({ user: id }),
            Certificate.find({ user: id }),
            Invoice.find({ user: id }),
            Random.find({ user: id })
        ]);

        // Prepare driver map for enrichment
        const driverMap = {};
        drivers.forEach(driver => {
            driverMap[driver._id.toString()] = driver;
        });

        // Enrich results with driver name and license number
        const enrichedResults = results.map(result => {
            const driver = driverMap[result.driverId?.toString()];
            return {
                ...result.toObject(),
                driverName: driver ? `${driver.first_name} ${driver.last_name}` : "Unknown",
                licenseNumber: driver ? driver.government_id : "N/A",
            };
        });

        // Attach all fetched details to user object
        userObj.drivers = drivers;
        userObj.results = enrichedResults;
        userObj.certificates = certificates;
        userObj.invoices = invoices;
        userObj.randoms = randoms;

        res.status(200).json({
            errorStatus: 0,
            message: "UserData sent successfully",
            data: userObj
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "An unexpected error occurred. Please try again later."
        });
    }
};




const updateCompanyInformation = async (req, res) => {
    try {
        const id = req.user.id;
        const { ...companyInfoData } = req.body;
        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
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
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "server error, please try again later"
        });
    }
};


const updatePayment = async (req, res) => {
    try {
        const id = req.user.id;
        const { ...paymentData } = req.body;
        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
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
            message: "Payment Information updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "server error, please try again later"
        });
    }
};


module.exports = { userData, updateCompanyInformation, updatePayment };
