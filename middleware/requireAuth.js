const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const User = require("../modules/user.model");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  const payload = jwt.verify(token, config.JWT_SECRET);

  console.log("Decoded JWT payload:", payload);

  const user = await User.findById(payload._id);
  if (!user) {
    return res.status(401).json({ error: "User no longer exists" });
  }

  if (user.role !== payload.role) {
    return res.status(403).json({ error: "User role has changed" });
  }

  req.user = user;
  next();
});

module.exports = requireAuth;
