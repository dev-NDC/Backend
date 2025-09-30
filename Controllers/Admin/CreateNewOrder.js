// CreateNewOrder.js
const User = require("../../database/User");
const Driver = require("../../database/Driver");
const Result = require("../../database/Result");

const axios = require("axios");
const crypto = require("crypto");
const { scheduleUrlEmail } = require("./EmailTempletes/NewOrderEmail");
require("dotenv").config();

const username = process.env.USERID;
const password = process.env.PASSWORD;

const getAllCompanyAllDetials = async (req, res) => {
  try {
    const companies = await User.find({
      "Membership.planStatus": "Active",
    });

    const formattedCompanies = companies.map((company) => ({
      _id: company._id,
      companyName: company.companyInfoData?.companyName || "",
      companyDetails: company.companyInfoData || {},
      packages:
        company.Membership?.package?.map((pkg) => ({
          _id: pkg._id,
          packageName: pkg.package_name || "",
        })) || [],
      orderReasons:
        company.Membership?.order_reason?.map((reason) => ({
          _id: reason._id,
          orderReasonName: reason.order_reason_name || "",
        })) || [],
    }));

    formattedCompanies.sort((a, b) =>
      a.companyName.localeCompare(b.companyName, undefined, { sensitivity: "base" })
    );

    res.status(200).json({
      errorStatus: 0,
      message: "All company details retrieved successfully",
      data: formattedCompanies,
    });
  } catch (error) {
    console.error("getAllCompanyAllDetials error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message,
    });
  }
};

function generateOrderReference() {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now().toString(36);
  const randomSuffix = crypto.randomBytes(1).toString("hex");
  let reference = `${uuid}-${timestamp}-${randomSuffix}`.replace(/[^a-zA-Z0-9]/g, "");
  return reference.slice(0, 45);
}

function formatDateTime(input) {
  if (!input || !input.includes("T")) return "";
  const [date, time] = input.split("T");
  const [hour = "00", minute = "00"] = (time || "").split(":");
  return `${date} ${hour}:${minute}:00`;
}

function findPackageId(package_code) {
  const packageMap = {
    NDCDEMO: "NDCDEMO",
    "5 PANEL URINE DOT LIKE": "5UDL",
    "7 PANEL URINE": "7U",
    "9 PANEL URINE": "9U",
    "DOT BAT": "DOTBAT",
    "DOT PANEL": "DOTU",
    "DOT PANEL + DOT BAT": "DOTUBAT",
    "DOT PHYSICAL": "DOTPHY",
  };
  return packageMap[package_code] || package_code;
}

const getSiteInformation = async (req, res) => {
  try {
    const { companyId, packageId, orderReasonId, dotAgency, formData = {} } = req.body;

    const user = await User.findById(companyId);
    if (!user) {
      return res.status(404).json({ errorStatus: 1, message: "Company not found" });
    }

    const orgId = user.Membership?.orgId || "";
    const location_code = user.Membership?.locationCode || "";

    const package_code = packageId || "";
    const order_reason = orderReasonId || "";
    const formattedExpiration = formatDateTime(formData.orderExpires || "");

    const referenceNumber = generateOrderReference();

    // normalize emails
    let allEmails = "";
    if ((formData.email || "").trim() !== "") {
      allEmails = (formData.email || "").trim();
    } else if ((formData.ccEmail || "").trim() !== "") {
      allEmails = (formData.ccEmail || "").trim();
    }

    // normalize dot agency (root or inside formData)
    const dotAgencyVal = (dotAgency || formData.dotAgency || "").trim();

    const payloadForCreate = {
      dot_agency: dotAgencyVal,
      expiration_date_time: formattedExpiration,
      lab_location_code: "",
      location_code,
      order_reason,
      order_reference_number: referenceNumber,
      org_id: orgId,
      package_code: findPackageId(package_code),
      participant_address: formData.address || "",
      participant_dob: formData.dob || "",
      participant_email: allEmails,
      participant_first_name: formData.firstName || "",
      participant_government_id: formData.ssn || "",
      participant_last_name: formData.lastName || "",
      participant_municipality: formData.city || "",
      participant_phone: formData.phone1 || "",
      participant_postal_code: formData.zip || "",
      participant_region: formData.state || "",
      "report message": "",
    };

    const response = await axios.post(
      "https://ws.i3screen.net/api/scheduling/create",
      payloadForCreate,
      { headers: { "Content-Type": "application/json" }, auth: { username, password } }
    );

    const caseNumber = response?.data?.case_number;
    const scheduling_url = response?.data?.case_data?.scheduling_url;

    if (formData.sendLink === true) {
      // Create Driver
      const newDriver = new Driver({
        user: companyId,
        government_id: formData.ssn || "",
        first_name: formData.firstName || "",
        last_name: formData.lastName || "",
        phone: formData.phone1 || "",
        email: formData.email || "",
        postal_code: formData.zip || "",
        region: formData.state || "",
        municipality: formData.city || "",
        address: formData.address || "",
        dob: formData.dob || "",
        isActive: false,
        creationDate: new Date().toISOString(),
        createdBy: req.body.createdBy || "Admin",
      });
      await newDriver.save();

      // Persist Result (with flat ORDER + PARTICIPANT fields)
      const resultToPush = new Result({
        user: companyId,
        driverId: newDriver._id,
        caseNumber: caseNumber || "",
        date: new Date(),

        // existing
        testType: orderReasonId || "",
        status: "Pending",

        // NEW: original metadata fields (you already had)
        packageName: packageId || "",
        packageCode: findPackageId(packageId || ""),
        dotAgency: dotAgencyVal || "",
        orderReason: orderReasonId || "",

        // NEW: ORDER INFORMATION (flat)
        selectedPackageId: packageId || "",
        selectedOrderReasonId: orderReasonId || "",
        orderExpires: formData.orderExpires || "",
        sendLink: !!formData.sendLink,
        donorPass: !!formData.donorPass,
        referenceNumber,
        schedulingUrl: scheduling_url || "",

        // NEW: PARTICIPANT INFORMATION (flat)
        firstName: formData.firstName || "",
        middleName: formData.middleName || "",
        lastName: formData.lastName || "",
        ssnEid: formData.ssn || "",
        dobString: formData.dob || "",
        phone1: formData.phone1 || "",
        phone2: formData.phone2 || "",
        email: formData.email || "",
        ccEmail: formData.ccEmail || "",
        observedBool: !!formData.observed,
        address: formData.address || "",
        address2: formData.address2 || "",
        city: formData.city || "",
        state: formData.state || "",
        zip: formData.zip || "",

        // legacy single-file fields (left empty for compatibility)
        file: null,
        filename: "",
        mimeType: "",
      });
      await resultToPush.save();

      // Email link
      await scheduleUrlEmail(
        formData.email || allEmails,
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
        user.companyInfoData?.companyName || "NDC",
        scheduling_url || "",
        formattedExpiration || ""
      );

      return res.status(200).json({
        errorStatus: 0,
        message: "Case has been scheduled and Scheduling URL sent successfully",
        driverId: newDriver._id,
      });
    }

    // Fetch sites only (no driver/result creation here)
    const payloadForSites = {
      case_number: caseNumber,
      search_radius: "100",
      postal_code: formData.zip || "",
      address: "",
      municipality: "",
      province: "",
      country: "US",
      show_price: "0",
    };

    const siteResponse = await axios.post(
      "https://ws.i3screen.net/api/scheduling/sitesv2",
      payloadForSites,
      { headers: { "Content-Type": "application/json" }, auth: { username, password } }
    );

    const sites = siteResponse?.data?.sites || [];
    return res.status(200).json({
      errorStatus: 0,
      message: "All site information retrieved successfully",
      data: sites,
      caseNumber,
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error?.response?.data || error.message,
    });
  }
};

const handleNewPincode = async (req, res) => {
  try {
    const payloadForSites = {
      case_number: req.body.caseNumber,
      search_radius: "100",
      postal_code: req.body.data,
      address: "",
      municipality: "",
      province: "",
      country: "US",
      show_price: "0",
    };

    const siteResponse = await axios.post(
      "https://ws.i3screen.net/api/scheduling/sitesv2",
      payloadForSites,
      { headers: { "Content-Type": "application/json" }, auth: { username, password } }
    );

    const sites = siteResponse?.data?.sites || [];
    res.status(200).json({
      errorStatus: 0,
      message: "All site information retrieved successfully",
      data: sites,
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error?.response?.data || error.message,
    });
  }
};

const newDriverSubmitOrder = async (req, res) => {
  try {
    const payloadForCreate = {
      case_number: req.body.caseNumber,
      collection_site_link_id: req.body.finlSelectedSite?.collection_site_link_id,
    };

    await axios.post(
      "https://ws.i3screen.net/api/scheduling/schedule",
      payloadForCreate,
      { headers: { "Content-Type": "application/json" }, auth: { username, password } }
    );

    const { companyId, orderReasonId, packageId, dotAgency, formData = {} } = req.body;

    // Create Driver
    const newDriver = new Driver({
      user: companyId,
      government_id: formData?.ssn || "",
      first_name: formData?.firstName || "",
      last_name: formData?.lastName || "",
      phone: formData?.phone1 || "",
      email: formData?.email || "",
      postal_code: formData?.zip || "",
      region: formData?.state || "",
      municipality: formData?.city || "",
      address: formData?.address || "",
      dob: formData?.dob || "",
      isActive: false,
      creationDate: new Date().toISOString(),
      createdBy: req.body.createdBy || "Admin",
    });
    await newDriver.save();

    // normalize dot agency again (root or inside formData)
    const dotAgencyVal = (dotAgency || formData?.dotAgency || "").trim();

    // Persist Result (flat ORDER + PARTICIPANT fields)
    const resultToPush = new Result({
      user: companyId,
      driverId: newDriver._id,
      caseNumber: req.body.caseNumber || "",
      date: new Date(),

      // existing
      testType: orderReasonId || "",
      status: "Pending",

      // original metadata fields (already present)
      packageName: packageId || "",
      packageCode: findPackageId(packageId || ""),
      dotAgency: dotAgencyVal || "",
      orderReason: orderReasonId || "",

      // ORDER INFORMATION (flat)
      selectedPackageId: packageId || "",
      selectedOrderReasonId: orderReasonId || "",
      orderExpires: formData.orderExpires || "",
      sendLink: !!formData.sendLink,
      donorPass: !!formData.donorPass,
      referenceNumber: "",            // not returned in this step
      schedulingUrl: "",              // not returned in this step

      // PARTICIPANT INFORMATION (flat)
      firstName: formData.firstName || "",
      middleName: formData.middleName || "",
      lastName: formData.lastName || "",
      ssnEid: formData.ssn || "",
      dobString: formData.dob || "",
      phone1: formData.phone1 || "",
      phone2: formData.phone2 || "",
      email: formData.email || "",
      ccEmail: formData.ccEmail || "",
      observedBool: !!formData.observed,
      address: formData.address || "",
      address2: formData.address2 || "",
      city: formData.city || "",
      state: formData.state || "",
      zip: formData.zip || "",

      // legacy single-file fields (empty)
      file: null,
      filename: "",
      mimeType: "",
    });
    await resultToPush.save();

    res.status(200).json({
      errorStatus: 0,
      message: "Case has been scheduled",
      driverId: newDriver._id,
    });
  } catch (error) {
    const status = error?.response?.status;
    if (status === 422) {
      return res.status(442).json({
        errorStatus: 1,
        message: "Case has already been scheduled",
      });
    }
    console.error(error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
    });
  }
};

module.exports = {
  getAllCompanyAllDetials,
  getSiteInformation,
  newDriverSubmitOrder,
  handleNewPincode,
};
