const User = require("../../database/User");
const Driver = require("../../database/Driver");
const Result = require("../../database/Result");
const Certificate = require("../../database/Certificate");
const Invoice = require("../../database/Invoice");
const Random = require("../../database/Random");

const userData = async (req, res) => {
  try {
    const id = req.user.id;
    const data = await User.findById(id)
      .select("-contactInfoData.password -_id");
    if (!data) {
      return res.status(404).json({ errorStatus: 1, message: "User not found" });
    }

    const userObj = data.toObject();
    const [drivers, results, certificates, invoices, randoms] = await Promise.all([
      Driver.find({ user: id }),
      Result.find({ user: id }),
      Certificate.find({ user: id }),
      Invoice.find({ user: id }),
      Random.find({ user: id })
    ]);

    const driverMap = {};
    drivers.forEach(d => {
      driverMap[d._id.toString()] = d;
    });

    const enrichedResults = results.map(r => {
      const drv = driverMap[r.driverId?.toString()];
      const resultImages = (r.files || []).map(f => ({
        filename: f.filename,
        mimeType: f.mimeType,
        url: `data:${f.mimeType};base64,${f.data.toString('base64')}`
      }));

      return {
        _id: r._id,
        date: r.date,
        testType: r.testType,
        orderStatus: r.orderStatus || "N/A",
        resultStatus: r.resultStatus || "N/A",
        caseNumber: r.caseNumber,
        driverName: drv ? `${drv.first_name} ${drv.last_name}` : "Unknown",
        licenseNumber: drv ? drv.government_id : "N/A",
        resultImages
      };
    });

    const base64Certificates = certificates.map(c => ({
      ...c.toObject(),
      certificateFile: c.certificateFile?.toString("base64")
    }));
    const base64Invoices = invoices.map(inv => ({
      ...inv.toObject(),
      file: inv.file?.toString("base64")
    }));
    const base64Randoms = randoms.map(rnd => ({ ...rnd.toObject() }));

    userObj.drivers      = drivers;
    userObj.results      = enrichedResults;
    userObj.certificates = base64Certificates;
    userObj.invoices     = base64Invoices;
    userObj.randoms      = base64Randoms;

    res.status(200).json({ errorStatus: 0, message: "UserData sent successfully", data: userObj });
  } catch (error) {
    res.status(500).json({ errorStatus: 1, message: "An unexpected error occurred. Please try again later", error: error.message });
  }
};


const updateCompanyInformation = async (req, res) => {
    try {
        const id = req.user.id;
        const { ...companyInfoData } = req.body;
        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { companyInfoData },
            { new: true, runValidators: true }
        ).select("-contactInfoData.password");
        if (!updatedUser) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Company information updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "server error, please try again later"
        });
    }
};


const updatePayment = async (req, res) => {
    try {
        const id = req.user.id;
        const { ...paymentData } = req.body;
        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { paymentData },
            { new: true, runValidators: true }
        ).select("-contactInfoData.password");
        if (!updatedUser) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Payment Information updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "server error, please try again later"
        });
    }
};


module.exports = { userData, updateCompanyInformation, updatePayment };
