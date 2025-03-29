const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const Verification = () => {
    return async (req, res, next) => {
        try {
            // Extract token from headers
            const token = req.header("Authorization")?.split(" ")[1];

            if (!token) {
                return res.status(401).json({
                    errorStatus: 1,
                    message: "Unauthorized: No token provided"
                });
            }

            // Verify Token
            jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        return res.status(401).json({
                            errorStatus: 1,
                            message: "Token expired. Please log in again."
                        });
                    }
                    if (err.name === "JsonWebTokenError") {
                        return res.status(401).json({
                            errorStatus: 1,
                            message: "Invalid token. Authentication failed."
                        });
                    }
                    return res.status(401).json({
                        errorStatus: 1,
                        message: "Token verification failed.",
                        error: err.message
                    });
                }

                console.log("Decoded Token:", decoded);
                req.user = decoded; // Attach user info to request
                next();
            });
        } catch (error) {
            res.status(500).json({
                errorStatus: 1,
                message: "Internal Server Error",
                error: error.message
            });
        }
    };
};

module.exports = { Verification };
