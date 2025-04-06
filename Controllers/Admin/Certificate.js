const User = require("../../database/schema");

// Upload Certificate
const uploadCertificate = async (req, res) => {
    try {
        const { currentId, description, issueDate, expirationDate } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                errorStatus: 1,
                message: "No file uploaded",
            });
        }

        const certificate = {
            description,
            issueDate: new Date(issueDate),
            expirationDate: new Date(expirationDate),
            certificateFile: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
        };

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        user.certificates.push(certificate);
        await user.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Certificate uploaded and saved successfully",
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};

// Edit Certificate
const editCertificate = async (req, res) => {
    try {
        const { currentId, certificateId, updatedData } = req.body;

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        const certificate = user.certificates.id(certificateId);
        if (!certificate) {
            return res.status(404).json({ errorStatus: 1, message: "Certificate not found" });
        }

        certificate.description = updatedData.description || certificate.description;
        certificate.issueDate = new Date(updatedData.issueDate) || certificate.issueDate;
        certificate.expirationDate = new Date(updatedData.expirationDate) || certificate.expirationDate;

        await user.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Certificate updated successfully",
        });
    } catch (error) {
        console.error("Edit error:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while editing certificate",
            error: error.message,
        });
    }
};

// Delete Certificate
const deleteCertificate = async (req, res) => {
    try {
        const { currentId, certificateId } = req.body;

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        const certIndex = user.certificates.findIndex(cert => cert._id.toString() === certificateId);
        if (certIndex === -1) {
            return res.status(404).json({ errorStatus: 1, message: "Certificate not found" });
        }

        user.certificates.splice(certIndex, 1);
        await user.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Certificate deleted successfully",
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while deleting certificate",
            error: error.message,
        });
    }
};


module.exports = {uploadCertificate,editCertificate,deleteCertificate};
