const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const protect = async (req, res, next) => {
  const [scheme, token] = req.headers.authorization?.split(" ") || [];
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    next();
  } catch { res.status(401).json({ message: "Invalid token" }); }
};
module.exports = { protect };
