const Driver = require("../../database/Driver");
const User = require("../../database/User");
const Random = require("../../database/Random");
const Result = require("../../database/Result");
const {RandomDriver} = require("./EmailTempletes/Random")


const fetchRandomDriver = async (req, res) => {
  try {
    // Get all users (companies)
    const companies = await User.find({}, "companyInfoData.companyName");
    const companyIds = companies.map(c => c._id);

    // Get all active, not deleted drivers for those companies
    const drivers = await Driver.find({
      user: { $in: companyIds },
      isActive: true,
      isDeleted: false,
    });

    // Group drivers by company
    const companyMap = {};
    companies.forEach(company => {
      companyMap[company._id.toString()] = {
        companyId: company._id,
        companyName: company.companyInfoData?.companyName || "N/A",
        drivers: [],
      };
    });
    drivers.forEach(driver => {
      const cId = driver.user.toString();
      if (companyMap[cId]) {
        companyMap[cId].drivers.push({
          driverId: driver._id,
          driverName: `${driver.first_name || ""} ${driver.last_name || ""}`.trim(),
        });
      }
    });

    // Only companies with at least one eligible driver
    const responseData = Object.values(companyMap).filter(company => company.drivers.length > 0);

    res.status(200).json({
      errorStatus: 0,
      message: "Random data fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching random data:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to fetch data",
      error: error.message
    });
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

    // Confirm company and driver exist
    const company = await User.findById(companyId);
    if (!company) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Company not found",
      });
    }
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Driver not found",
      });
    }

    // Check for duplicate entry
    const duplicate = await Random.findOne({
      user: companyId,
      "driver._id": driverId,
      year,
      quarter,
    });
    if (duplicate) {
      return res.status(400).json({
        errorStatus: 1,
        message: "Random entry already exists for this driver, year, and quarter.",
      });
    }

    // Create random entry
    const newRandom = new Random({
      user: companyId,
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
      status: "Pending",
    });
    await newRandom.save();

    res.status(200).json({
      errorStatus: 0,
      message: "Random entry added successfully",
      data: newRandom,
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
    // Get all random entries and populate Result data
    const allRandoms = await Random.find({}).populate('resultId', 'orderStatus resultStatus caseNumber');

    const response = allRandoms.map(entry => ({
      _id: entry._id,
      company: entry.company,
      driver: entry.driver,
      year: entry.year,
      quarter: entry.quarter,
      testType: entry.testType,
      status: entry.status,
      orderStatus: entry.resultId?.orderStatus || null,
      resultStatus: entry.resultId?.resultStatus || null,
      caseNumber: entry.resultId?.caseNumber || null
    }));

    res.status(200).json({
      errorStatus: 0,
      message: "Random driver data fetched successfully",
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


const updateRandomStatus = async (req, res) => {
  try {
    const { selectedItem, status } = req.body;
    const randomId = selectedItem._id;
    if (!randomId) {
      return res.status(400).json({
        errorStatus: 1,
        message: "Missing random entry ID",
      });
    }

    // Update status
    const randomEntry = await Random.findByIdAndUpdate(
      randomId,
      { status },
      { new: true }
    );
    if (!randomEntry) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Random entry not found",
      });
    }

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



const deleteRandomEntry = async (req, res) => {
  try {
    const selectedItem = req.body.selectedItem;
    if (!selectedItem?._id) {
      return res.status(400).json({
        errorStatus: 1,
        message: "Missing random entry ID",
      });
    }

    // Remove the random entry
    const deleted = await Random.findByIdAndDelete(selectedItem._id);
    if (!deleted) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Random entry not found. It may have already been deleted.",
      });
    }

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

const sendEmailToRandomDriver = async (req, res) => {
  try {
    const { selectedItem, ccEmail } = req.body;
    // Fetch company email from database
    const company = await User.findById(selectedItem.company._id).lean();
    const companyEmail = company?.companyInfoData?.companyEmail;

    if (!companyEmail) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Company email not found. Cannot send email."
      });
    }

    // Send the email
    await RandomDriver(companyEmail, ccEmail, selectedItem)

    res.status(200).json({
      errorStatus: 0,
      message: "Random selection email sent successfully!",
    });
  } catch (error) {
    console.error("Error sending email to random driver:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to send random selection email. Please try again later.",
      error: error.message
    });
  }
};

const getScheduleDataFromRandom = async (req, res) => {
  try {
    const { randomId } = req.body;
    
    if (!randomId) {
      return res.status(400).json({
        errorStatus: 1,
        message: "Random ID is required"
      });
    }

    // Get Random entry
    const randomEntry = await Random.findById(randomId);
    if (!randomEntry) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Random entry not found"
      });
    }

    // Get Driver details
    const driver = await Driver.findById(randomEntry.driver._id);
    if (!driver) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Driver not found"
      });
    }

    // Get Company details
    const company = await User.findById(randomEntry.company._id);
    if (!company) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Company not found"
      });
    }

    // Build prefill object
    const prefillData = {
      // ORDER INFO
      companyName: randomEntry.company.name,
      companyEmail: company.companyInfoData?.companyEmail || "",
      packageName: "",
      orderReason: randomEntry.testType,
      dotAgency: company.companyInfoData?.safetyAgencyName || "",

      // PARTICIPANT INFO
      firstName: driver.first_name || "",
      middleName: "",
      lastName: driver.last_name || "",
      ssnEid: driver.government_id || "",
      dob: driver.dob || "",
      phone1: driver.phone || "",
      phone2: "",
      observed: false,
      orderExpires: "",

      // ADDRESS
      addr1: driver.address || "",
      addr2: "",
      city: driver.municipality || "",
      stateShort: driver.region || "",
      zip: driver.postal_code || "",

      // COMMUNICATIONS
      sendSchedulingLink: false,
      sendDonorPass: true,
      email: driver.email || "",
      ccEmails: company.companyInfoData?.companyEmail || "",
    };

    res.status(200).json({
      errorStatus: 0,
      message: "Schedule data fetched successfully",
      data: prefillData
    });

  } catch (error) {
    console.error("Error fetching schedule data:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message
    });
  }
};

const linkRandomToResult = async (req, res) => {
  try {
    const { randomId, resultId } = req.body;

    if (!randomId || !resultId) {
      return res.status(400).json({
        errorStatus: 1,
        message: "Random ID and Result ID are required"
      });
    }

    const randomEntry = await Random.findByIdAndUpdate(
      randomId,
      { resultId },
      { new: true }
    );

    if (!randomEntry) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Random entry not found"
      });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "Random entry linked to result successfully",
      data: randomEntry
    });

  } catch (error) {
    console.error("Error linking random to result:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message
    });
  }
};

module.exports = {
  addRandomDriver,
  fetchRandomDriver,
  fetchRandomData,
  deleteRandomEntry,
  updateRandomStatus,
  sendEmailToRandomDriver,
  getScheduleDataFromRandom,
  linkRandomToResult,
};
