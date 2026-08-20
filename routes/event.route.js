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
  getAllEvents,
  getAnEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/event.controller");

const router = express.Router();

router.get(
  "/",
  [
    query("title")
      .optional()
      .isString()
      .withMessage("Event title must be a string"),
    query("startDate")
      .optional()
      .isDate({ format: "YYYY-MM-DD", strictMode: true })
      .withMessage("Must be a valid date in YYYY-MM-DD format"),
    query("endDate")
      .optional()
      .isDate({ format: "YYYY-MM-DD", strictMode: true })
      .withMessage("Must be a valid date in YYYY-MM-DD format"),
    query("category")
      .optional()
      .isMongoId()
      .withMessage("Event category must be a valid MongoDB ObjectId"),
    query("city")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Event city is must not be empty and must be a string"),
  ],
  getAllEvents,
);
router.get("/:id", getAnEvent);
router.post(
  "/",
  requireRole("admin"),
  [
    body("title").not().isEmpty().withMessage("Event title is required"),
    body("city").not().isEmpty().withMessage("Event city is required"),
    body("date")
      .not()
      .isEmpty()
      .withMessage("Event date is required")
      .isDate({ format: "YYYY-MM-DD", strictMode: true })
      .withMessage("Must be a valid date in YYYY-MM-DD format"),
    body("capacity")
      .not()
      .isEmpty()
      .withMessage("Event capacity is required")
      .isInt()
      .withMessage("Event capacity must be a Integer (not a Float / Decimal)"),
    body("category")
      .not()
      .isEmpty()
      .withMessage("Event category is required")
      .isMongoId()
      .withMessage("Event category must be a valid MongoDB ObjectId"),
  ],
  validator,
  createEvent,
);
router.patch(
  "/:id",
  requireRole("admin"),
  [
    body("title")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Event title cannot be empty"),
    body("city")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Event city cannot be empty"),
    body("date")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Event date cannot be empty")
      .isDate({ format: "YYYY-MM-DD", strictMode: true })
      .withMessage("Must be a valid date in YYYY-MM-DD format"),
    body("capacity")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Event capacity cannot be empty")
      .isInt()
      .withMessage("Event capacity must be a Integer (not a Float / Decimal)"),
    body("category")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Event category cannot be empty")
      .isMongoId()
      .withMessage("Event category must be a valid MongoDB ObjectId"),
  ],
  validator,
  updateEvent,
);
router.delete("/:id", requireRole("admin"), deleteEvent);

module.exports = router;
