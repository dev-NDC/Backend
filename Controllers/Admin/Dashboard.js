const User = require("../../database/schema")

// Function to calculate percentage change
function calculateChange(current, previous) {
    console.log("Calculating change:", { current, previous });
    if (previous === 0) {
        return current === 0 ? "0%" : "+100%";
    }
    const diff = ((current - previous) / previous) * 100;
    const rounded = diff.toFixed(1); // Optional: limit decimal places
    return `${diff >= 0 ? '+' : ''}${rounded}%`;
}

const getCustomerAndAgencyCount = async (req, res) => {
  try {
    // 1. Total Customers
    const totalCustomers = await User.countDocuments({ role: "User" });

    // 2. Active Customers (based on membership)
    const activeCustomers = await User.countDocuments({
      role: "User",
      "Membership.planStatus": "Active"
    });

    // 3. Total Drivers
    const usersWithDrivers = await User.find({ "drivers.0": { $exists: true } }, { drivers: 1 });
    const totalDrivers = usersWithDrivers.reduce((sum, user) => sum + user.drivers.length, 0);

    // 4. Total Agencies
    const totalAgencies = await User.countDocuments({ role: "Agency" });

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
                role: "User",
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
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Prepare months array from oldest to newest
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: date.toLocaleString("default", { month: "short" }),
        year: date.getFullYear(),
        month: date.getMonth(),
        random: 0,
        other: 0,
      });
    }

    // Fetch only users with test results in the past 6 months
    const users = await User.find(
      { "results.date": { $gte: sixMonthsAgo } },
      { results: 1 }
    );

    // Loop through all results
    users.forEach(user => {
      user.results.forEach(result => {
        if (!result.date) return;
        const date = new Date(result.date);
        if (date < sixMonthsAgo) return;

        const month = date.getMonth();
        const year = date.getFullYear();
        const monthEntry = months.find(m => m.month === month && m.year === year);

        if (monthEntry) {
          const testType = (result.testType || "").toLowerCase();
          if (testType === "random") {
            monthEntry.random++;
          } else {
            monthEntry.other++;
          }
        }
      });
    });

    // Format response
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
