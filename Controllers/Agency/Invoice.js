const User = require("../../database/UserSchema");
const isCompanyHandledByAgency = require("./checkAgencyPermission");


// Upload Invoice
const uploadInvoice = async (req, res) => {
    try {
        const { currentId, invoiceNumber, amount, date, status } = req.body;
        const file = req.file;
        const agencyId = req.user.id;
        if (!file) {
            return res.status(400).json({
                errorStatus: 1,
                message: "No file uploaded",
            });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(currentId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }

        const invoice = {
            invoiceNumber,
            amount,
            date: new Date(date),
            status,
            file: file.buffer,
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

        user.invoices.push(invoice);
        await user.save();

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

// Edit Invoice
const editInvoice = async (req, res) => {
    try {
        const { currentId, invoiceId, updatedData } = req.body;
        const agencyId = req.user.id;

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(currentId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }

        const invoice = user.invoices.id(invoiceId);
        if (!invoice) {
            return res.status(404).json({ errorStatus: 1, message: "Invoice not found" });
        }

        invoice.invoiceNumber = updatedData.invoiceNumber || invoice.invoiceNumber;
        invoice.amount = updatedData.amount || invoice.amount;
        invoice.date = updatedData.date ? new Date(updatedData.date) : invoice.date;
        invoice.status = updatedData.status || invoice.status;

        await user.save();

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

// Delete Invoice
const deleteInvoice = async (req, res) => {
    try {
        const { currentId, invoiceId } = req.body;
        const agencyId = req.user.id;
        
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(currentId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }
        const invoiceIndex = user.invoices.findIndex(inv => inv._id.toString() === invoiceId);
        if (invoiceIndex === -1) {
            return res.status(404).json({ errorStatus: 1, message: "Invoice not found" });
        }

        user.invoices.splice(invoiceIndex, 1);
        await user.save();

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
