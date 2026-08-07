const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const authenticator = asyncHandler(async (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authToken.split(" ")[1];

  const decoded = jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) next(new AppError("Invalid token", 401));
    req.user = decoded;
    next();
  });
});

module.exports = authenticator;
