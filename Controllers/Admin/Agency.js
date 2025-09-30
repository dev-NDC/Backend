const User = require("../../database/User");
const Agency = require("../../database/Agency");
const Admin = require("../../database/Admin");

const { newAgencyEmail } = require("./EmailTempletes/NewAgency");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// ---------------- helpers for fuzzy name matching ----------------
const norm = (s = "") =>
  String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const firstNWords = (s = "", n = 1) =>
  norm(s).split(" ").filter(Boolean).slice(0, n).join(" ");

// ---------------- existing controllers ----------------
const getCompanyList = async (req, res) => {
  try {
    // Fetch all users and select only companyName field
    const users = await User.find({}, "companyInfoData.companyName");

    // Filter out users without a company name
    const companies = users
      .filter((u) => u.companyInfoData?.companyName)
      .map((u) => ({
        userId: u._id,
        companyName: u.companyInfoData.companyName,
      }));

    // Sort companies alphabetically by companyName
    companies.sort((a, b) => a.companyName.localeCompare(b.companyName));

    res.status(200).json({
      errorStatus: 0,
      message: "Companies retrieved successfully",
      data: companies,
    });
  } catch (error) {
    console.error("getCompanyList error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to fetch companies",
      error: error.message,
    });
  }
};

const getAllAgencyData = async (req, res) => {
  try {
    // Fetch all agencies with selected fields
    const agencies = await Agency.find(
      {},
      "_id name email contactNumber agencyCode handledCompanies createdAt status logoUrl"
    );

    // Format response
    const formattedAgencies = agencies.map((agency) => ({
      agencyName: agency.name || "N/A",
      agencyEmail: agency.email || "N/A",
      agencyContactNumber: agency.contactNumber || "N/A",
      agencyCode: agency.agencyCode || "N/A",
      numberOfCompanies: agency.handledCompanies?.length || 0,
      createdAt: agency.createdAt || null,
      status: agency.status || "Active",
      logoUrl: agency.logoUrl || "",
      id: agency._id,
    }));

    res.status(200).json({
      errorStatus: 0,
      message: "Agency data retrieved successfully",
      data: formattedAgencies,
    });
  } catch (error) {
    console.error("getAllAgencyData error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message,
    });
  }
};

const getSingleAgencyData = async (req, res) => {
  try {
    const agencyId = req.body.id;

    const agency = await Agency.findById(
      agencyId,
      "name email contactNumber agencyCode handledCompanies"
    );

    if (!agency) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Agency not found",
      });
    }

    const response = {
      agencyName: agency.name || "N/A",
      agencyEmail: agency.email || "N/A",
      agencyContactNumber: agency.contactNumber || "N/A",
      agencyCode: agency.agencyCode || "N/A",
      numberOfCompanies: agency.handledCompanies?.length || 0,
      handledCompanies: agency.handledCompanies?.map((company) => ({
        userId: company._id,
        companyName: company.name || "Unnamed Company",
      })),
      id: agency._id,
    };
    res.status(200).json({
      errorStatus: 0,
      message: "Agency details fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("getSingleAgencyData error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message,
    });
  }
};

const updateAgencyData = async (req, res) => {
  try {
    const { data } = req.body;
    const currentId = data._id;

    // Find agency by ID in the Agency collection
    const agency = await Agency.findById(currentId);

    if (!agency) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Agency not found",
      });
    }

    // Update agency fields
    agency.name = data.agencyName;
    agency.email = data.agencyEmail;
    agency.contactNumber = data.agencyContactNumber;

    // Validate handled companies (User collection)
    const handledUserIds = [...new Set((data.handledCompanies || []).map((c) => c.userId))];

    const validUsers = await User.find({
      _id: { $in: handledUserIds },
    }).select("_id companyInfoData.companyName");

    // Store handled companies with _id and name
    agency.handledCompanies = validUsers.map((u) => ({
      _id: u._id,
      name: u.companyInfoData?.companyName || "Unnamed Company",
    }));

    await agency.save();

    res.status(200).json({
      errorStatus: 0,
      message: "Agency information saved successfully",
    });
  } catch (error) {
    console.error("updateAgencyData error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to save information",
      error: error.message,
    });
  }
};

const createNewAgency = async (req, res) => {
  try {
    const { email, agencyName, contactNumber } = req.body;

    // Check if email exists in any collection
    const [existingUser, existingAdmin, existingAgency] = await Promise.all([
      User.findOne({ "contactInfoData.email": email }),
      Admin.findOne({ email }),
      Agency.findOne({ email }),
    ]);

    if (existingUser || existingAdmin || existingAgency) {
      return res.status(409).json({
        errorStatus: 1,
        message: "User/Admin/Agency with this email already exists.",
      });
    }

    // Generate random password and hash it
    const randomPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Generate unique agency code (3 letters + 4 random digits)
    const cleanName = agencyName.replace(/[^A-Za-z]/g, "").toUpperCase();
    const namePart = cleanName.slice(0, 3).padEnd(3, "X");
    const digitPart = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
    const agencyCode = namePart + digitPart;

    // Create and save new agency
    const newAgency = new Agency({
      name: agencyName,
      email,
      contactNumber,
      password: hashedPassword,
      resetToken,
      resetTokenExpiry,
      agencyCode,
    });

    await newAgencyEmail(email, resetToken, agencyName);
    await newAgency.save();

    res.status(201).json({
      errorStatus: 0,
      message: "Agency created and reset email sent.",
    });
  } catch (error) {
    console.error("createNewAgency error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while creating agency",
      error: error.message,
    });
  }
};

const deleteAgency = async (req, res) => {
  try {
    const { id } = req.body.data;

    const deletedAgency = await Agency.findByIdAndDelete(id);

    if (!deletedAgency) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Agency not found",
      });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "Agency deleted successfully",
    });
  } catch (error) {
    console.error("deleteAgency error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while deleting agency",
      error: error.message,
    });
  }
};

// ---------------- NEW: find agency by company name ----------------
/**
 * POST /admin/findAgencyByCompanyName
 * body: { companyName: string }
 * response:
 *   200 { errorStatus: 0, data: { id, agencyName, agencyEmail, agencyCode } }
 *   404 { errorStatus: 1, message: "No agency found for company" }
 */
const findAgencyByCompanyName = async (req, res) => {
  try {
    const raw = (req.body?.companyName || "").trim();
    if (!raw) {
      return res.status(400).json({ errorStatus: 1, message: "companyName is required" });
    }

    const full = norm(raw);
    const keys = new Set([full, firstNWords(raw, 3), firstNWords(raw, 2), firstNWords(raw, 1)]);
    const keysArr = Array.from(keys).filter(Boolean);

    // Load minimal fields
    const agencies = await Agency.find(
      {},
      "_id name email agencyCode handledCompanies"
    ).lean();

    const prepared = agencies.map((a) => ({
      id: a._id,
      agencyName: a.name || "N/A",
      agencyEmail: a.email || "N/A",
      agencyCode: a.agencyCode || "N/A",
      companies: (a.handledCompanies || []).map((hc) => ({
        nameNorm: norm(hc?.name || ""),
      })),
    }));

    // 1) exact match on full simplified name
    for (const ag of prepared) {
      if (ag.companies.some((c) => c.nameNorm === full)) {
        return res.status(200).json({
          errorStatus: 0,
          data: { id: ag.id, agencyName: ag.agencyName, agencyEmail: ag.agencyEmail, agencyCode: ag.agencyCode },
        });
      }
    }

    // 2) prefix (keysArr is already ordered longest→shortest)
    for (const key of keysArr) {
      for (const ag of prepared) {
        if (ag.companies.some((c) => c.nameNorm.startsWith(key))) {
          return res.status(200).json({
            errorStatus: 0,
            data: { id: ag.id, agencyName: ag.agencyName, agencyEmail: ag.agencyEmail, agencyCode: ag.agencyCode },
          });
        }
      }
    }

    // 3) includes fallback
    for (const key of keysArr) {
      for (const ag of prepared) {
        if (ag.companies.some((c) => c.nameNorm.includes(key))) {
          return res.status(200).json({
            errorStatus: 0,
            data: { id: ag.id, agencyName: ag.agencyName, agencyEmail: ag.agencyEmail, agencyCode: ag.agencyCode },
          });
        }
      }
    }

    return res.status(404).json({ errorStatus: 1, message: "No agency found for company" });
  } catch (error) {
    console.error("findAgencyByCompanyName error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while finding agency",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAgencyData,
  getSingleAgencyData,
  getCompanyList,
  updateAgencyData,
  createNewAgency,
  deleteAgency,
  findAgencyByCompanyName, // <-- new export
};
