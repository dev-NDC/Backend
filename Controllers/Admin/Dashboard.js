const User = require("../../database/UserSchema");
const Agency = require("../../database/AgencySchema");

const getCustomerAndAgencyCount = async (req, res) => {
  try {
    // 1. Total Customers (all User documents)
    const totalCustomers = await User.countDocuments();

    // 2. Active Customers (Users with active membership)
    const activeCustomers = await User.countDocuments({
      "Membership.planStatus": "Active"
    });

    // 3. Total Drivers (sum of drivers array length from all users)
    const usersWithDrivers = await User.find(
      { "drivers.0": { $exists: true } },
      { drivers: 1 }
    );
    const totalDrivers = usersWithDrivers.reduce((sum, user) => sum + user.drivers.length, 0);

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

    // Fetch users with any results in the last 6 months
    const users = await User.find(
      { "results.date": { $gte: sixMonthsAgo } },
      { results: 1 }
    );

    // Tally results
    users.forEach(user => {
      user.results.forEach(result => {
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



module.exports = { getCustomerAndAgencyCount, getUserCountsLast6Months, getMonthlyTestScheduleStats };
