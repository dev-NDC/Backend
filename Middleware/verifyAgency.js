const jwt = require("jsonwebtoken");
const User = require("../database/User"); // Import User model
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
            jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
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

                // Fetch user details from the database
                const user = await User.findById(decoded.userId);
                if (!user) {
                    return res.status(404).json({
                        errorStatus: 1,
                        message: "User not found."
                    });
                }
                // Check if user has the "agency" role
                if (!user.role || !user.role.includes("Agency")) {
                    return res.status(403).json({
                        errorStatus: 1,
                        message: "Forbidden: You do not have permission to access this resource."
                    });
                }

                req.user = {
                    id: user._id,
                    role: user.role,
                    email: user.contactInfoData.email
                }; 
                
                next();
            });
        } catch (error) {
            res.status(500).json({
                errorStatus: 1,
                message: "An unexpected error occurred. Please try again later.",
            });
        }
    };
};

module.exports = { Verification };
