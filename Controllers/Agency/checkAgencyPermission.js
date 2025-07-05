const Agency = require("../../database/Agency");

const isCompanyHandledByAgency = async (companyId, agencyId) => {
  try {
    const agency = await Agency.findById(agencyId).select("handledCompanies");

    if (!agency) return false;

    return agency.handledCompanies.some(
      (company) => company._id.toString() === companyId.toString()
    );
  } catch (error) {
    console.error("Error in isCompanyHandledByAgency:", error);
    return false;
  }
};

module.exports = isCompanyHandledByAgency;
