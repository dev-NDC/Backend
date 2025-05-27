const jwt = require("jsonwebtoken");
const User = require("../database/schema")

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticateAndAuthorize = (requiredRoles) => {
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
            jwt.verify(token, JWT_SECRET_KEY, async(err, decoded) => {
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
                req.user = decoded;
                const user = await User.findById(decoded.userId);
                if (!user) {
                    return res.status(401).json({
                        errorStatus: 1,
                        message: "User not found"
                    });
                }
                // Check if user has at least one of the required roles
                const hasRole = user.role.some(role => requiredRoles.includes(role));
                if (!hasRole) {
                    return res.status(403).json({
                        errorStatus: 1,
                        message: "Access Denied: Insufficient permissions"
                    });
                }
                next();
            });
        } catch (error) {
            res.status(401).json({
                errorStatus: 1,
                message: "An unexpected error occurred. Please try again later.",
                error
            });
        }
    };
};

module.exports = { authenticateAndAuthorize };
