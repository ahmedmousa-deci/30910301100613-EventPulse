const express = require("express");
const AppError = require("../utils/appError.util");
const requireRole = require("../middleware/requireRole");
const {
  body,
  query,
  param,
  validationResult,
  matchedData,
} = require("express-validator");
const validator = require("../middleware/validator");
const {
  getAllRegistrations,
  createRegistration,
  deleteRegistration,
  getAnRegistration,
  getUserRegistrations,
} = require("../controllers/registration.controller");

const router = express.Router();

router.get("/", requireRole("admin"), getAllRegistrations);

router.get("/my", requireRole("attendee"), getUserRegistrations);

router.get(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage("Registration ID must be a valid MongoDB ObjectId"),
  ],
  validator,
  getAnRegistration,
);

router.post(
  "/",
  requireRole("attendee", "admin"),
  [
    body("event")
      .notEmpty()
      .withMessage("Registration event is required")
      .isMongoId()
      .withMessage("Invalid event ID"),
    body("user")
      .optional()
      .isMongoId()
      .withMessage("Invalid user ID")
      .custom((value, { req }) => {
        if (req.user?.role !== "admin") {
          throw new AppError(
            403,
            "Only admin can specify a user for registration",
          );
        }
        return true;
      }),
  ],
  validator,
  createRegistration,
);

router.delete(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage("Registration ID must be a valid MongoDB ObjectId"),
  ],
  validator,
  deleteRegistration,
);

module.exports = router;
