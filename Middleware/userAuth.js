const jwt = require("jsonwebtoken");
const User = require("./../database/User"); 
const userAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find user by decoded ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ error: "Access denied. User not found." });
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = {userAuth};
