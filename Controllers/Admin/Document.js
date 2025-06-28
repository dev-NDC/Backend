const User = require("../../database/UserSchema");


// Upload Document
const uploadDocument = async (req, res) => {
    try {
        const { currentId, description, date } = req.body;
        const file = req.file;
        const uploaderId = req.user?.userId;

        if (!file) {
            return res.status(400).json({
                errorStatus: 1,
                message: "No file uploaded",
            });
        }

        // Get uploader details (name)
        const uploader = await User.findById(uploaderId);
        if (!uploader) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Uploader not found",
            });
        }

        const fullName = `${uploader.contactInfoData.firstName} ${uploader.contactInfoData.lastName}`;
        const document = {
            description : description,
            date: new Date(date),
            uploadedBy: {
                _id: uploader._id,
                name: fullName
            },
            documentFile: file.buffer,
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

        user.documents.push(document);
        await user.save();

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

// Edit Document
const editDocument = async (req, res) => {
    try {
        const { currentId, documentId, updatedData } = req.body;

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        const document = user.documents.id(documentId);
        if (!document) {
            return res.status(404).json({ errorStatus: 1, message: "Document not found" });
        }

        document.description = updatedData.description || document.description;
        document.date = new Date(updatedData.date) || document.date;

        await user.save();

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

// Delete Document
const deleteDocument = async (req, res) => {
    try {
        const { currentId, documentId } = req.body;

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        const docIndex = user.documents.findIndex(doc => doc._id.toString() === documentId);
        if (docIndex === -1) {
            return res.status(404).json({ errorStatus: 1, message: "Document not found" });
        }

        user.documents.splice(docIndex, 1);
        await user.save();

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

module.exports = {uploadDocument,editDocument,deleteDocument};
