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
  getAllMessages,
  createMessage,
  deleteMessage,
  getAnMessage,
  updateMessage,
} = require("../controllers/message.controller");

const router = express.Router();

router.get("/", getAllMessages);

router.get("/:id", getAnMessage);

router.post(
  "/",
  requireRole("admin"),
  [
    body("text").not().isEmpty().withMessage("Message text is required"),
    body("event")
      .not()
      .isEmpty()
      .withMessage("Message event is required")
      .isMongoId()
      .withMessage("Invalid event ID"),
    body("user")
      .not()
      .isEmpty()
      .withMessage("Message user is required")
      .isMongoId()
      .withMessage("Invalid user ID"),
  ],
  validator,
  createMessage,
);

router.patch(
  "/:id",
  requireRole("admin"),
  [
    body("text")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Message text is required"),
    body("event")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Message event is required")
      .isMongoId()
      .withMessage("Invalid event ID"),
    body("user")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Message user is required")
      .isMongoId()
      .withMessage("Invalid user ID"),
  ],
  validator,
  updateMessage,
);

router.delete("/:id", requireRole("admin"), deleteMessage);

module.exports = router;
