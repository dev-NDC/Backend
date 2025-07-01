const User = require("../../database/UserSchema");
const Agency = require("../../database/AgencySchema");

const getCustomerAndAgencyCount = async (req, res) => {
  try {
    const agencyId = req.user.id; // or req.params.agencyId

    // Step 1: Get handled company IDs for the logged-in agency
    const agency = await Agency.findById(agencyId).select("handledCompanies");
    const handledCompanyIds = agency.handledCompanies.map(c => c._id);

    // Step 2: Count total handled customers
    const totalCustomers = handledCompanyIds.length;

    // Step 3: Count active handled customers
    const activeCustomers = await User.countDocuments({
      _id: { $in: handledCompanyIds },
      "Membership.planStatus": "Active"
    });

    // Step 4: Total drivers from handled companies
    const usersWithDrivers = await User.find(
      { _id: { $in: handledCompanyIds }, "drivers.0": { $exists: true } },
      { drivers: 1 }
    );
    const totalDrivers = usersWithDrivers.reduce((sum, user) => sum + user.drivers.length, 0);

    // Step 5: Send counts (no need for totalAgencies here)
    res.status(200).json({
      totalCustomers,
      activeCustomers,
      totalDrivers
    });

  } catch (error) {
    console.error("Error getting counts for agency:", error);
    res.status(500).json({ message: "Failed to fetch agency-specific counts" });
  }
};


const getUserCountsLast6Months = async (req, res) => {
  try {
    const now = new Date();
    const results = [];

    const agencyId = req.user.id; // 👈 passed in route like /api/.../:agencyId

    // 1. Get handled company IDs for the agency
    const agency = await Agency.findById(agencyId).select("handledCompanies");
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    const handledCompanyIds = agency.handledCompanies.map(c => c._id);

    // 2. Loop through last 6 months and count created users
    for (let i = 5; i >= 0; i--) {
      const refDate = new Date();
      refDate.setMonth(refDate.getMonth() - i);
      const from = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
      const to = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);

      const count = await User.countDocuments({
        _id: { $in: handledCompanyIds },
        createdAt: { $gte: from, $lt: to }
      });

      results.push({
        month: from.toLocaleString("default", { month: "short" }),
        year: from.getFullYear(),
        count,
      });
    }

    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching user stats for agency:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getMonthlyTestScheduleStats = async (req, res) => {
  try {
    const { agencyId } = req.user.id;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(currentMonthStart);
    sixMonthsAgo.setMonth(currentMonthStart.getMonth() - 5);

    // Step 1: Get handled companies from agency
    const agency = await Agency.findById(agencyId).select("handledCompanies");
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    const handledCompanyIds = agency.handledCompanies.map(c => c._id);

    // Step 2: Set up 6-month tracking
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

    // Step 3: Fetch users from handled companies only
    const users = await User.find(
      {
        _id: { $in: handledCompanyIds },
        "results.date": { $gte: sixMonthsAgo }
      },
      { results: 1 }
    );

    // Step 4: Tally results by type/month
    users.forEach(user => {
      user.results.forEach(result => {
        if (!result?.date) return;
        const resultDate = new Date(result.date);
        if (resultDate < sixMonthsAgo) return;

        const month = resultDate.getMonth();
        const year = resultDate.getFullYear();
        const entry = months.find(m => m.month === month && m.year === year);

        if (entry) {
          const type = (result.testType || "").toLowerCase();
          if (type === "random") {
            entry.random++;
          } else {
            entry.other++;
          }
        }
      });
    });

    // Step 5: Format response
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
