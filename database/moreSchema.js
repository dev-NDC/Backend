const mongoose = require("mongoose");

// createNewOrderSchema schema
const createNewOrderSchema = new mongoose.Schema({
    case_number: String,
    direct_url: String,
    order_reference_number: String,
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

    
    isActive : {type : Boolean, default: false},
    creationDate: String,
    createdBy: String,
    deletedBy: String,
    deletionDate: String,
    isDeleted: { type: Boolean, default: false },
}, { _id: true });

// Package and OrderSchema
const packageAndOrderSchema = new mongoose.Schema({
    package: [{
        package_name: String,
    }],
    order_reason: [{
        order_reason_name: String,
    }],
}, { _id: true });




module.exports = { createNewOrderSchema, driverSchema, packageAndOrderSchema }