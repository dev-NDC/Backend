const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errorStatus: 1,
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    next();
};

module.exports = validate;
