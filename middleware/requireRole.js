const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const User = require("../modules/user.model");

// in case, we need.
const ROLES = ["admin", "attendee"];
const PERMISSIONS = {
  admin: [
    // category permissions
    "create:category",
    "read:category",
    "update:category",
    "delete:category",
    // event permissions
    "create:event",
    "read:event",
    "update:event",
    "delete:event",
    // message permissions
    "create:message",
    "read:message",
    "update:message",
    "delete:message",
    // registration permissions
    "create:registration",
    "read:registration",
    "update:registration",
    "delete:registration",
    // user permissions
    "create:user",
    "read:user",
    "update:user",
    "delete:user",
  ],
  attendee: [
    "read:category",
    "read:event",
    "read:registration",
    "read:message",
  ],
};

const requireRole = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      // checking if the user still exists in the database
      return res.status(401).json({ error: "User no longer exists" });
    }
    if (!allowedRoles.includes(currentUser.role)) {
      // checking if changed/not changed role is still allowed
      return res.status(403).json({ error: "Insufficient role" });
    }

    req.user.role = currentUser.role;
    next();
  });

module.exports = requireRole;
