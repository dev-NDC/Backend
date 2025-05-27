const { body } = require("express-validator");

exports.loginValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .notEmpty().withMessage("Password is required")
];

exports.signupValidator = [
    // Contact Info
    body("contactInfoData.firstName")
        .notEmpty().withMessage("First name is required"),
    body("contactInfoData.lastName")
        .notEmpty().withMessage("Last name is required"),
    body("contactInfoData.phone")
        .notEmpty().withMessage("Phone is required")
        .isMobilePhone("en-IN").withMessage("Invalid phone number format")
        .matches(/^\d{10}$/).withMessage("Phone must be exactly 10 digits"),
    body("contactInfoData.email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    body("contactInfoData.password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

    // Company Info
    body("companyInfoData.companyName")
        .notEmpty().withMessage("Company name is required"),
    body("companyInfoData.usdot")
        .notEmpty().withMessage("USDOT is required")
        .isNumeric().withMessage("USDOT must be a number"),
    body("companyInfoData.contactNumber")
        .notEmpty().withMessage("Phone is required")
        .isMobilePhone("en-IN").withMessage("Invalid phone number format")
        .matches(/^\d{10}$/).withMessage("Phone must be exactly 10 digits"),
    body("companyInfoData.companyEmail")
        .notEmpty().withMessage("Company email is required")
        .isEmail().withMessage("Invalid company email"),
    body("companyInfoData.safetyAgencyName")
        .optional({ checkFalsy: true }),
    body("companyInfoData.employees")
        .notEmpty().withMessage("Number of employees is required")
        .isNumeric().withMessage("Employees must be a number"),
    body("companyInfoData.address")
        .notEmpty().withMessage("Address is required"),
    body("companyInfoData.suite")
        .optional({ checkFalsy: true }),
    body("companyInfoData.city")
        .notEmpty().withMessage("City is required"),
    body("companyInfoData.state")
        .notEmpty().withMessage("State is required"),
    body("companyInfoData.zip")
        .notEmpty().withMessage("ZIP code is required")
        .isNumeric().withMessage("ZIP code must be a number"),
    body("companyInfoData.driverCount")
        .notEmpty().withMessage("Driver count is required")
        .isNumeric().withMessage("Driver count must be a number"),

    // Payment Info
    body("paymentData.creditCardNumber")
        .notEmpty().withMessage("Card Number is Required")
        .isCreditCard().withMessage("Invalid credit card number"),
    body("paymentData.cvv")
        .notEmpty().withMessage("CVV is required")
        .isLength({ min: 3, max: 4 }).withMessage("CVV must be 3 or 4 digits"),
    body("paymentData.expMonth")
        .notEmpty().withMessage("Expiry Month is required")
        .isInt({ min: 1, max: 12 }).withMessage("Expiry Month must be between 1 and 12"),
    body("paymentData.expYear")
        .notEmpty().withMessage("Expiry Year is required")
        .isNumeric().withMessage("Year must be a number"),
    body("paymentData.billingZip")
        .notEmpty().withMessage("Billing Zip  is required")
        .isNumeric().withMessage("Billing Zip must be a number"),
    body("paymentData.accountNumber")
        .notEmpty().withMessage("Account number is required")
        .isNumeric().withMessage("Account number must be a number"),
    body("paymentData.routingNumber")
        .notEmpty().withMessage("Routing number is required")
        .isNumeric().withMessage("Routing number must be a number"),
    body("paymentData.accountName")
        .notEmpty().withMessage("Account holder name is required"),
    body("paymentData.accountType")
        .notEmpty().withMessage("Account type is required"),

    // Submit Form Info
    body("submitFormData.firstName")
        .notEmpty().withMessage("Submission first name is required"),
    body("submitFormData.lastName")
        .notEmpty().withMessage("Submission last name is required"),
    body("submitFormData.date")
        .notEmpty().withMessage("Submission date is required")
        .isISO8601().withMessage("Invalid date format"),
    body("submitFormData.signature")
        .notEmpty().withMessage("Signature is required"),
    body("submitFormData.agree")
        .equals("true").withMessage("You must agree to proceed")
];


exports.forgotPasswordValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
];

exports.resetPasswordValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("token")
        .notEmpty().withMessage("Reset token is required")
        .isLength({ min: 40, max: 40 }).withMessage("Invalid reset token format"),
];
