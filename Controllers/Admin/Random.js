const User = require("../../database/schema")


const fetchRandomDriver = async (req, res) => {
    try {
        // Fetch all users who have only 'user' role
        const companies = await User.find({ role: ['User'] });

        const responseData = companies.map(company => {
            const drivers = company.drivers
                ?.filter(driver => !driver.isDeleted && driver.isActive  === true)
                .map(driver => ({
                    driverId: driver._id,
                    driverName: `${driver?.first_name} ${driver?.last_name}`,
                })) || [];

            return {
                companyId: company._id,
                companyName: company.companyInfoData?.companyName || 'N/A',
                drivers,
            };
        });

        res.status(200).json({
            errorStatus: 0,
            message: "Random data fetched successfully",
            data: responseData,
        });
    } catch (error) {
        console.error("Error fetching random data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};

const addRandomDriver = async (req, res) => {
    try {
        const { year, quarter, companyId, companyName, driverId, driverName, testType } = req.body;

        if (!year || !quarter || !companyId || !driverId || !testType) {
            return res.status(400).json({
                errorStatus: 1,
                message: "All fields are required",
            });
        }

        // Fetch company and its randoms
        const company = await User.findById(companyId);

        if (!company) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Company not found",
            });
        }

        // Check for duplicate entry
        const isDuplicate = company.randoms?.some(entry =>
            entry.driver._id.toString() === driverId.toString() &&
            entry.year === year &&
            entry.quarter === quarter
        );

        if (isDuplicate) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Random entry already exists for this driver, year, and quarter.",
            });
        }

        const newRandomEntry = {
            year,
            quarter,
            company: {
                _id: companyId,
                name: companyName,
            },
            driver: {
                _id: driverId,
                name: driverName,
            },
            testType,
        };

        const updatedCompany = await User.findByIdAndUpdate(
            companyId,
            { $push: { randoms: newRandomEntry } },
            { new: true }
        );

        res.status(200).json({
            errorStatus: 0,
            message: "Random entry added successfully",
            data: updatedCompany,
        });

    } catch (error) {
        console.error("Error adding random driver:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};

const fetchRandomData = async (req, res) => {
    try {
        // Find all users (companies) that have randoms
        const usersWithRandoms = await User.find(
            { "randoms.0": { $exists: true } }, // only users with at least one random entry
            { randoms: 1 } // return only the randoms field
        );

        // Flatten and combine all randoms into one array
        const allRandoms = usersWithRandoms.flatMap(user =>
            user.randoms.map(entry => ({
                _id: entry._id, // Include the unique identifier of the random entry
                company: {
                    _id: entry.company._id,
                    name: entry.company.name
                },
                driver: {
                    _id: entry.driver._id,
                    name: entry.driver.name
                },
                year: entry.year,
                quarter: entry.quarter,
                testType: entry.testType,
                status: entry.status // assuming status is a field in the random entry
            }))
        );

        return res.status(200).json({
            errorStatus: 0,
            message: "Random driver data fetched successfully",
            data: allRandoms
        });

    } catch (error) {
        return res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};


const deleteRandomEntry = async (req, res) => {
    try {
        const selectedItem = req.body.selectedItem;

        if (
            !selectedItem?.company?._id ||
            !selectedItem?.driver?._id ||
            !selectedItem?.year ||
            !selectedItem?.quarter ||
            !selectedItem?.testType
        ) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Missing required fields in selectedItem",
            });
        }

        const { company, driver, year, quarter, testType } = selectedItem;

        // Find the user (company) with matching ID
        const user = await User.findById(company._id);
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Company not found",
            });
        }

        // Find the index of the random entry to delete
        const randomIndex = user.randoms.findIndex(random =>
            random.driver._id.toString() === driver._id &&
            random.year === year &&
            random.quarter === quarter &&
            random.testType === testType
        );

        if (randomIndex === -1) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Random entry not found. It may have already been deleted.",
            });
        }

        // Remove the random entry
        user.randoms.splice(randomIndex, 1);
        await user.save();

        return res.status(200).json({
            errorStatus: 0,
            message: "Random entry deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};

const updateRandomStatus = async (req, res) => {
    try {
        const { selectedItem, status } = req.body;
        const companyId = selectedItem.company._id;
        const randomId = selectedItem._id;

        // Step 1: Find the user (company)
        const user = await User.findById(companyId);
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Company not found",
            });
        }

        // Step 2: Find the random entry by ID
        const randomEntry = user.randoms.id(randomId);
        if (!randomEntry) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Random entry not found",
            });
        }

        // Step 3: Update the status
        randomEntry.status = status;

        // Step 4: Save changes
        await user.save();

        return res.status(200).json({
            errorStatus: 0,
            message: "Random entry status updated successfully",
        });

    } catch (error) {
        console.error("Error updating random status:", error);
        return res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};



module.exports = {
    addRandomDriver,
    fetchRandomDriver,
    fetchRandomData,
    deleteRandomEntry,
    updateRandomStatus,
};