const jwt = require("jsonwebtoken");
const Agency = require("./../database/Agency");

const agencyAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find agency by decoded ID
    const agency = await Agency.findById(decoded.id);

    if (!agency) {
      return res.status(403).json({ error: "Access denied. Agency not found." });
    }

    // Attach agency info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = {agencyAuth};
