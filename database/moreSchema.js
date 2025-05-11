const mongoose = require("mongoose");

// createNewOrderSchema schema
const createNewOrderSchema = new mongoose.Schema({
    case_number: String,
    site_location_link_id: String,
    direct_url: String,
    package_code: String,
    order_reference_number: String,
    order_reason: String,
    expiration_date_time: String,
    dot_agency: String,
    report_message: String,
    lab_location_code: String,
    order_scheduled : Boolean,
    observed_collection_required: Boolean
}, { _id: true });

// Driver schema
const driverSchema = new mongoose.Schema({
    government_id: String,
    first_name: String,
    last_name: String,
    phone: String,
    email: String,
    postal_code: String,
    region: String,
    municipality: String,
    address: String,
    dob: String,
    creationDate: String,
    createdBy: String,
    deletedBy: String,
    deletionDate: String,
    isDeleted: { type: Boolean, default: false },
}, { _id: true });

// Package and OrderSchema
const packageAndOrderSchema = new mongoose.Schema({
    package: [{
        package_code: String,
        package_name: String,
        package_type: String,
    }],
    order_reason: [{
        order_reason_code: String,
        order_reason_name: String,
    }],
}, { _id: true });




module.exports = { createNewOrderSchema, driverSchema, packageAndOrderSchema }