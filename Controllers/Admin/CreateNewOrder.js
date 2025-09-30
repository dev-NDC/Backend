
// controllers/orders.js
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
    const companies = await User.find({ "Membership.planStatus": "Active" });

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

// CREATE CASE (and optionally email schedule link) OR return sites
const getSiteInformation = async (req, res) => {
  try {
    const { companyId, packageId, orderReasonId, dotAgency, formData = {}, createdBy } = req.body;

    const user = await User.findById(companyId);
    if (!user) {
      return res.status(404).json({ errorStatus: 1, message: "Company not found" });
    }

    const orgId = user.Membership?.orgId || "";
    const location_code = user.Membership?.locationCode || "";
    const dotAgencyVal = (dotAgency || formData.dotAgency || "").trim();

    const package_code = packageId || "";
    const order_reason = orderReasonId || "";
    const formattedExpiration = formatDateTime(formData.orderExpires || "");
    const orderReferenceNumber = generateOrderReference();

    // who to email
    let allEmails = "";
    if ((formData.email || "").trim()) {
      allEmails = (formData.email || "").trim();
    } else if ((formData.ccEmail || "").trim()) {
      allEmails = (formData.ccEmail || "").trim();
    }

    const payloadForCreate = {
      dot_agency: dotAgencyVal,
      expiration_date_time: formattedExpiration,
      lab_location_code: "",
      location_code,
      order_reason,
      order_reference_number: orderReferenceNumber,
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

    // Create vendor case
    const response = await axios.post(
      "https://ws.i3screen.net/api/scheduling/create",
      payloadForCreate,
      { headers: { "Content-Type": "application/json" }, auth: { username, password } }
    );

    const caseNumber = response?.data?.case_number || "";
    const scheduling_url = response?.data?.case_data?.scheduling_url || "";

    // --- UPSERT Result snapshot immediately (so we always have a row as soon as a case exists)
    const baseSnapshot = {
      user: companyId,
      caseNumber,
      date: new Date(),
      orderStatus: "Pending",
      resultStatus: "Pending",

      // Company snapshot
      companySnapshot: {
        userId: companyId,
        companyName: user.companyInfoData?.companyName || "",
        orgId,
        locationCode: location_code,
      },

      // Package / Reason / DOT
      packageId: packageId || "",
      packageName: packageId || "", // keeping your existing behavior
      packageCode: findPackageId(packageId || ""),
      orderReasonId: orderReasonId || "",
      orderReason: orderReasonId || "",
      dotAgency: dotAgencyVal,

      // Order toggles + meta
      sendLink: !!formData.sendLink,
      donorPass: !!formData.donorPass,
      observed: formData.observed === "1" || formData.observed === 1 || formData.observed === true,
      orderExpiresInput: formData.orderExpires || "",
      expirationDateTime: formattedExpiration,
      orderReferenceNumber,
      schedulingUrl: scheduling_url,

      // Emails
      toEmail: (formData.email || "").trim(),
      ccEmail: (formData.ccEmail || "").trim(),
      allEmails,

      // Participant snapshot
      participant: {
        firstName: formData.firstName || "",
        middleName: formData.middleName || "",
        lastName: formData.lastName || "",
        governmentId: formData.ssn || "",
        ssnState: formData.ssnState || "",
        dob: formData.dob || "",
        phone1: formData.phone1 || "",
        phone2: formData.phone2 || "",
        email: (formData.email || "").trim(),
      },

      // Address snapshot
      address: {
        line1: formData.address || "",
        line2: formData.address2 || "",
        city: formData.city || "",
        state: formData.state || "",
        zip: formData.zip || "",
      },

      // Last site search context (if any)
      siteSearch: {
        searchRadius: "100",
        postalCode: formData.zip || "",
        country: "US",
      },

      // Vendor payload echo (for audit/debug)
      vendorCreatePayload: payloadForCreate,
      vendorCreateResponse: { case_number: caseNumber, case_data: { scheduling_url } },

      // traceability
      createdBy: createdBy || "Admin",
    };

    await Result.findOneAndUpdate(
      { user: companyId, caseNumber },
      { $setOnInsert: { date: new Date() }, $set: baseSnapshot },
      { upsert: true, new: true }
    );

    // If Send Scheduling Link NOW: create driver, attach to Result, email link
    if (formData.sendLink === true) {
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
        createdBy: createdBy || "Admin",
      });
      await newDriver.save();

      await Result.findOneAndUpdate(
        { user: companyId, caseNumber },
        {
          $set: {
            driverId: newDriver._id,
            status: "Pending",
          },
        }
      );

      // Email schedule URL
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
        caseNumber,
        scheduling_url,
      });
    }

    // Otherwise: just fetch nearby sites (user will pick one, then we schedule)
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

    // persist sites payload echo
    await Result.findOneAndUpdate(
      { user: companyId, caseNumber },
      {
        $set: {
          vendorSitesPayload: payloadForSites,
          vendorSitesResponseMeta: { count: sites.length },
          lastSearchZip: formData.zip || "",
        },
      }
    );

    return res.status(200).json({
      errorStatus: 0,
      message: "All site information retrieved successfully",
      data: sites,
      caseNumber,
    });
  } catch (error) {
    console.error("getSiteInformation error:", error?.response?.data || error.message);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error?.response?.data || error.message,
    });
  }
};

// Update sites when zip changes in UI
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

    // Update the Result snapshot with last search zip + payload echo
    await Result.findOneAndUpdate(
      { caseNumber: req.body.caseNumber, user: req.body.companyId },
      {
        $set: {
          vendorSitesPayload: payloadForSites,
          vendorSitesResponseMeta: { count: sites.length },
          lastSearchZip: req.body.data || "",
        },
      }
    );

    res.status(200).json({
      errorStatus: 0,
      message: "All site information retrieved successfully",
      data: sites,
    });
  } catch (error) {
    console.error("handleNewPincode error:", error?.response?.data || error.message);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error?.response?.data || error.message,
    });
  }
};

// User picked a site; schedule case; create driver; finalize snapshot
const newDriverSubmitOrder = async (req, res) => {
  try {
    const { companyId, orderReasonId, packageId, dotAgency, caseNumber, finlSelectedSite = {}, formData = {}, createdBy } = req.body;

    const payloadForSchedule = {
      case_number: caseNumber,
      collection_site_link_id: finlSelectedSite?.collection_site_link_id,
    };

    await axios.post(
      "https://ws.i3screen.net/api/scheduling/schedule",
      payloadForSchedule,
      { headers: { "Content-Type": "application/json" }, auth: { username, password } }
    );

    // Create (or reuse) Driver
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
      createdBy: createdBy || "Admin",
    });
    await newDriver.save();

    // Update the existing Result snapshot instead of creating a duplicate
    await Result.findOneAndUpdate(
      { user: companyId, caseNumber },
      {
        $set: {
          driverId: newDriver._id,
          status: "Pending",

          // ensure all order selections are stored (in case something changed between steps)
          packageId: packageId || "",
          packageName: packageId || "",
          packageCode: findPackageId(packageId || ""),
          orderReasonId: orderReasonId || "",
          orderReason: orderReasonId || "",
          dotAgency: (dotAgency || formData.dotAgency || "").trim(),

          // selected site snapshot
          selectedSite: {
            collection_site_link_id: finlSelectedSite?.collection_site_link_id || "",
            name: finlSelectedSite?.collection_site_name || "",
            address: finlSelectedSite?.collection_site_address || "",
            city: finlSelectedSite?.collection_site_city || "",
            state: finlSelectedSite?.collection_site_state || "",
            zip: finlSelectedSite?.collection_site_zip || "",
            phone: finlSelectedSite?.collection_site_phone || "",
            distance: finlSelectedSite?.distance || "",
          },

          // echo the vendor schedule payload
          vendorSchedulePayload: payloadForSchedule,
        },
      },
      { new: true }
    );

    res.status(200).json({
      errorStatus: 0,
      message: "Case has been scheduled",
      driverId: newDriver._id,
      caseNumber,
    });
  } catch (error) {
    const status = error?.response?.status;
    if (status === 422) {
      return res.status(442).json({
        errorStatus: 1,
        message: "Case has already been scheduled",
      });
    }
    console.error("newDriverSubmitOrder error:", error?.response?.data || error.message);
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
