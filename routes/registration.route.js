const express = require("express");
const requireRole = require("../middleware/requireRole");
const {
  body,
  query,
  validationResult,
  matchedData,
} = require("express-validator");
const validator = require("../middleware/validator");
const {
  getAllRegistrations,
  createRegistration,
  deleteRegistration,
  getAnRegistration,
  updateRegistration,
} = require("../controllers/registration.controller");

const router = express.Router();

router.get("/", getAllRegistrations);

router.get("/:id", getAnRegistration);

router.post(
  "/",
  requireRole("admin"),
  [
    body("event")
      .not()
      .isEmpty()
      .withMessage("Registration event is required")
      .isMongoId()
      .withMessage("Invalid event ID"),
    body("user")
      .not()
      .isEmpty()
      .withMessage("Registration user is required")
      .isMongoId()
      .withMessage("Invalid user ID"),
  ],
  validator,
  createRegistration,
);

router.patch(
  "/:id",
  requireRole("admin"),
  [
    body("event").optional().isMongoId().withMessage("Invalid event ID"),
    body("user").optional().isMongoId().withMessage("Invalid user ID"),
  ],
  validator,
  updateRegistration,
);

router.delete("/:id", deleteRegistration);

module.exports = router;
