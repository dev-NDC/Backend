const User = require("../../database/schema")

const getAllAgencyData = async (req, res) => {
    try {
        // Get all users that have 'agency' in their roles
        const agencies = await User.find(
            { role: { $in: ['agency'] } },
            "_id companyInfoData.contactNumber companyInfoData.companyEmail companyInfoData.companyName handledCompanies"
        );

        // Format agency data and count handledCompanies
        const formattedAgencies = agencies.map(agency => ({
            agencyName: agency.companyInfoData?.companyName || "N/A",
            agencyEmail: agency.companyInfoData?.companyEmail || "N/A",
            agencyContactNumber: agency.companyInfoData?.contactNumber || "N/A",
            numberOfCompanies: agency.handledCompanies?.length || 0,
            id: agency._id
        }));

        res.status(200).json({
            errorStatus: 0,
            message: "Agency data retrieved successfully",
            data: formattedAgencies
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};


const getSingleAgencyData = async (req, res) => {
    try {
        const agencyId = req.body.id;

        // Find the agency and populate handledCompanies
        const agency = await User.findOne(
            { _id: agencyId, role: { $in: ['agency'] } },
            "companyInfoData handledCompanies"
        ).populate({
            path: "handledCompanies",
            match: { role: { $in: ['user'] } },
            select: "companyInfoData.companyName" // Select only needed field
        });

        if (!agency) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Agency not found",
            });
        }

        const response = {
            agencyName: agency.companyInfoData?.companyName || "N/A",
            agencyEmail: agency.companyInfoData?.companyEmail || "N/A",
            agencyContactNumber: agency.companyInfoData?.contactNumber || "N/A",
            numberOfCompanies: agency.handledCompanies?.length || 0,
            handledCompanies: agency.handledCompanies?.map((company) => ({
                userId: company._id,
                companyName: company.companyInfoData?.companyName || "Unnamed Company"
            })),
            id: agency._id
        };

        res.status(200).json({
            errorStatus: 0,
            message: "Agency details fetched successfully",
            data: response
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};




const getCompanyList = async (req, res) => {
    try {
        // Fetch users whose role is exactly ['user'] (i.e., companies, not agencies or admins)
        const users = await User.find(
            { role: ["user"] },
            "companyInfoData.companyName"
        );

        const companies = users
            .filter(u => u.companyInfoData?.companyName)
            .map(u => ({
                userId: u._id,
                companyName: u.companyInfoData.companyName
            }));
        res.status(200).json({
            errorStatus: 0,
            message: "Companies retrieved successfully",
            data: companies
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to fetch companies",
            error: error.message
        });
    }
};

const updateAgencyData = async (req, res) => {
    try {
        const { data, currentId } = req.body;
        const agency = await User.findById(currentId);
        if (!agency) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Agency not found",
            });
        }

        if (!agency.role.includes('agency')) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Provided user does not have 'agency' role",
            });
        }

        agency.companyInfoData.companyName = data.agencyName;
        agency.companyInfoData.companyEmail = data.agencyEmail;
        agency.companyInfoData.contactNumber = data.agencyContactNumber;
        agency.companyInfoData.agency = data.agencyName;

        const handledUserIds = data.handledCompanies.map(c => c.userId);

        const validUsers = await User.find({
            _id: { $in: handledUserIds },
            role: { $in: ['user'] }
        }).select('_id');

        agency.handledCompanies = validUsers.map(u => u._id); // only ObjectIds

        await agency.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Agency information saved successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to save information",
            error: error.message,
        });
    }
};



module.exports = { getAllAgencyData, getSingleAgencyData, getCompanyList, updateAgencyData };