const { body } = require("express-validator");

exports.updateCompanyInformationValidator = [
    body("companyName")
        .notEmpty().withMessage("Company name is required"),
    body("usdot")
        .notEmpty().withMessage("USDOT is required")
        .isNumeric().withMessage("USDOT must be a number"),
    body("contactNumber")
        .notEmpty().withMessage("Phone is required")
        .isMobilePhone("en-IN").withMessage("Invalid phone number format")
        .matches(/^\d{10}$/).withMessage("Phone must be exactly 10 digits"),
    body("companyEmail")
        .notEmpty().withMessage("Company email is required")
        .isEmail().withMessage("Invalid company email"),
    body("safetyAgencyName")
        .optional({ checkFalsy: true }),
    body("employees")
        .notEmpty().withMessage("Number of employees is required")
        .isNumeric().withMessage("Employees must be a number"),
    body("address")
        .notEmpty().withMessage("Address is required"),
    body("suite")
        .optional({ checkFalsy: true }),
    body("city")
        .notEmpty().withMessage("City is required"),
    body("state")
        .notEmpty().withMessage("State is required"),
    body("zip")
        .notEmpty().withMessage("ZIP code is required")
        .isNumeric().withMessage("ZIP code must be a number"),

];

exports.updatePaymentValidator = [

    // Payment Info
    body("creditCardNumber")
        .notEmpty().withMessage("Card Number is Required")
        .isCreditCard().withMessage("Invalid credit card number"),
    body("cvv")
        .notEmpty().withMessage("CVV is required")
        .isLength({ min: 3, max: 4 }).withMessage("CVV must be 3 or 4 digits"),
    body("expMonth")
        .notEmpty().withMessage("Expiry Month is required")
        .isInt({ min: 1, max: 12 }).withMessage("Expiry Month must be between 1 and 12"),
    body("expYear")
        .notEmpty().withMessage("Expiry Year is required")
        .isNumeric().withMessage("Year must be a number"),
    body("billingZip")
        .notEmpty().withMessage("Billing Zip  is required")
        .isNumeric().withMessage("Billing Zip must be a number"),
    body("accountNumber")
        .notEmpty().withMessage("Account number is required")
        .isNumeric().withMessage("Account number must be a number"),
    body("routingNumber")
        .notEmpty().withMessage("Routing number is required")
        .isNumeric().withMessage("Routing number must be a number"),
    body("accountName")
        .notEmpty().withMessage("Account holder name is required"),
    body("accountType")
        .notEmpty().withMessage("Account type is required"),
];