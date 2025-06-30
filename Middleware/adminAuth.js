const jwt = require("jsonwebtoken");
const Admin = require("./../database/AdminSchema");
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find admin by decoded ID
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(403).json({ error: "Access denied. Admin not found." });
    }

    // Attach admin info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = {adminAuth};
