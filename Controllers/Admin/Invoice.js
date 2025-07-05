const Invoice = require("../../database/Invoice");
const User = require("../../database/User");

const uploadInvoice = async (req, res) => {
    try {
        const { currentId, invoiceNumber, amount, date, status } = req.body;
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

        // Create and save invoice document
        const invoice = new Invoice({
            user: currentId,
            invoiceNumber,
            amount,
            date: new Date(date),
            status,
            file: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
        });

        await invoice.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Invoice uploaded and saved successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};

const editInvoice = async (req, res) => {
    try {
        const { currentId, invoiceId, updatedData } = req.body;

        // Confirm user exists (optional, for security)
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Update invoice document (must match user and invoiceId)
        const invoice = await Invoice.findOneAndUpdate(
            { _id: invoiceId, user: currentId },
            {
                $set: {
                    invoiceNumber: updatedData.invoiceNumber,
                    amount: updatedData.amount,
                    date: updatedData.date ? new Date(updatedData.date) : undefined,
                    status: updatedData.status
                }
            },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({ errorStatus: 1, message: "Invoice not found" });
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Invoice updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while editing invoice",
            error: error.message,
        });
    }
};


const deleteInvoice = async (req, res) => {
    try {
        const { currentId, invoiceId } = req.body;

        // Confirm user exists (optional)
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Delete invoice document
        const invoice = await Invoice.findOneAndDelete({ _id: invoiceId, user: currentId });

        if (!invoice) {
            return res.status(404).json({ errorStatus: 1, message: "Invoice not found" });
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Invoice deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while deleting invoice",
            error: error.message,
        });
    }
};


module.exports = { uploadInvoice, editInvoice, deleteInvoice };
