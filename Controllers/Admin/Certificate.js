const Certificate = require("../../database/Certificate");
const User = require("../../database/User");

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

        // Confirm user exists
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        // Create certificate doc
        const certificate = new Certificate({
            user: currentId,
            description,
            issueDate: new Date(issueDate),
            expirationDate: new Date(expirationDate),
            certificateFile: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
        });

        await certificate.save();

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


const editCertificate = async (req, res) => {
    try {
        const { currentId, certificateId, updatedData } = req.body;

        // Confirm user exists (optional, but for stricter security)
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Find and update certificate, ensure it belongs to the user
        const certificate = await Certificate.findOneAndUpdate(
            { _id: certificateId, user: currentId },
            {
                $set: {
                    description: updatedData.description,
                    issueDate: updatedData.issueDate ? new Date(updatedData.issueDate) : undefined,
                    expirationDate: updatedData.expirationDate ? new Date(updatedData.expirationDate) : undefined
                }
            },
            { new: true }
        );

        if (!certificate) {
            return res.status(404).json({ errorStatus: 1, message: "Certificate not found" });
        }

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


const deleteCertificate = async (req, res) => {
    try {
        const { currentId, certificateId } = req.body;

        // Confirm user exists (optional)
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Delete certificate belonging to this user
        const cert = await Certificate.findOneAndDelete({ _id: certificateId, user: currentId });

        if (!cert) {
            return res.status(404).json({ errorStatus: 1, message: "Certificate not found" });
        }

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

module.exports = { uploadCertificate, editCertificate, deleteCertificate };
