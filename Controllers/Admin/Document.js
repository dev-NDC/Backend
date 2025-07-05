const Document = require("../../database/Document");
const User = require("../../database/User");
const Admin = require("../../database/Admin")

const uploadDocument = async (req, res) => {
    try {
        const { currentId, title, date } = req.body;
        const file = req.file;
        const uploaderId = req.user?.id;
        if (!file) {    
            return res.status(400).json({
                errorStatus: 1,
                message: "No file uploaded",
            });
        }

        // Get uploader details (name)
        const uploader = await Admin.findById(uploaderId);
        if (!uploader) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Uploader not found",
            });
        }
        const fullName = `${uploader.firstName} ${uploader.lastName}`;

        // Confirm user (company) exists
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        // Create document in Document collection
        const document = new Document({
            user: currentId,
            description: title,
            date: new Date(date),
            uploadedBy: {
                _id: uploader._id,
                name: fullName
            },
            documentFile: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
        });

        await document.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Document uploaded and saved successfully",
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


const editDocument = async (req, res) => {
    try {
        const { currentId, documentId, updatedData } = req.body;

        // Confirm user (company) exists (optional for security)
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Find and update the document (ensure it belongs to this user)
        const document = await Document.findOneAndUpdate(
            { _id: documentId, user: currentId },
            {
                $set: {
                    description: updatedData.description,
                    date: updatedData.date ? new Date(updatedData.date) : undefined
                }
            },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({ errorStatus: 1, message: "Document not found" });
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Document updated successfully",
        });
    } catch (error) {
        console.error("Edit error:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while editing document",
            error: error.message,
        });
    }
};


const deleteDocument = async (req, res) => {
    try {
        const { currentId, documentId } = req.body;

        // Confirm user (company) exists (optional)
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Delete document (ensure it belongs to this user)
        const doc = await Document.findOneAndDelete({ _id: documentId, user: currentId });

        if (!doc) {
            return res.status(404).json({ errorStatus: 1, message: "Document not found" });
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Document deleted successfully",
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while deleting document",
            error: error.message,
        });
    }
};


module.exports = { uploadDocument, editDocument, deleteDocument };
