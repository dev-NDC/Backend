const Driver = require("../../database/Driver");
const User = require("../../database/User");
const Agency = require("../../database/Agency");
const Result = require("../../database/Result");
const Visitor = require("../../database/Visitor");

const getCustomerAndAgencyCount = async (req, res) => {
  try {
    // 1. Total Customers (all User documents)
    const totalCustomers = await User.countDocuments();

    // 2. Active Customers (Users with active membership)
    const activeCustomers = await User.countDocuments({
      "Membership.planStatus": "Active"
    });

    // 3. Total Drivers (count all Driver docs)
    const totalDrivers = await Driver.countDocuments();

    // 4. Total Agencies
    const totalAgencies = await Agency.countDocuments();

    // Send response
    res.status(200).json({
      totalCustomers,
      activeCustomers,
      totalDrivers,
      totalAgencies
    });

  } catch (error) {
    console.error("Error getting counts:", error);
    res.status(500).json({ message: "Failed to fetch counts" });
  }
};


const getUserCountsLast6Months = async (req, res) => {
  try {
    const now = new Date();
    const results = [];

    for (let i = 5; i >= 0; i--) {
      const year = now.getFullYear();
      const month = now.getMonth() - i;

      const from = new Date(year, month, 1);
      const to = new Date(year, month + 1, 1);

      const count = await User.countDocuments({
        createdAt: { $gte: from, $lt: to },
      });

      results.push({
        month: from.toLocaleString("default", { month: "short" }),
        year: from.getFullYear(),
        count,
      });
    }

    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching monthly user data:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getMonthlyTestScheduleStats = async (req, res) => {
  try {
    const now = new Date();

    // Get the first day of the current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Go 5 months back safely
    const sixMonthsAgo = new Date(currentMonthStart);
    sixMonthsAgo.setMonth(currentMonthStart.getMonth() - 5);

    // Prepare months array
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth(),
        random: 0,
        other: 0,
      });
    }

    // Fetch results from last 6 months
    const results = await Result.find({ date: { $gte: sixMonthsAgo } });

    // Tally results
    results.forEach(result => {
      if (!result?.date) return;
      const resultDate = new Date(result.date);
      if (resultDate < sixMonthsAgo) return;

      const month = resultDate.getMonth();
      const year = resultDate.getFullYear();
      const monthEntry = months.find(m => m.month === month && m.year === year);

      if (monthEntry) {
        const type = (result.testType || "").toLowerCase();
        if (type === "random") {
          monthEntry.random++;
        } else {
          monthEntry.other++;
        }
      }
    });

    const response = months.map(m => ({
      name: m.label,
      random: m.random,
      other: m.other
    }));

    return res.status(200).json(response);

  } catch (err) {
    console.error("Failed to fetch test schedule stats:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getWebsiteVisitsLast6Months = async (req, res) => {
  try {
    const now = new Date();
    // Get the first day of the current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Go 5 months back safely
    const sixMonthsAgo = new Date(currentMonthStart);
    sixMonthsAgo.setMonth(currentMonthStart.getMonth() - 5);

    // Aggregate counts by month and year
    const visits = await Visitor.aggregate([
      {
        $match: {
          visitTime: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$visitTime" },
            month: { $month: "$visitTime" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Prepare months array (ensuring months with 0 visits are present)
    const results = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript: 0-indexed, Mongo: 1-indexed
      const label = date.toLocaleString("default", { month: "short" });

      const found = visits.find(
        v => v._id.year === year && v._id.month === month
      );
      results.push({
        name: label,
        year: year,
        count: found ? found.count : 0
      });
    }

    return res.status(200).json({
      errorStatus: 0,
      message: "Website visits data fetched successfully",
      data: results
    });
  } catch (error) {
    console.error("Error fetching website visits:", error);
    return res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message
    });
  }
};




module.exports = { getCustomerAndAgencyCount, getUserCountsLast6Months, getMonthlyTestScheduleStats, getWebsiteVisitsLast6Months };
