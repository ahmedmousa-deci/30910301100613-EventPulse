const express = require("express");
const { body } = require("express-validator");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const validator = require("../middleware/validator");
const {
  createAnnouncement,
  getAnnouncementsByEvent,
} = require("../controllers/message.controller");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  [
    body("eventId")
      .notEmpty()
      .withMessage("eventId is required")
      .isMongoId()
      .withMessage("eventId must be a valid Mongo ID"),
    body("text").notEmpty().withMessage("text is required"),
  ],
  validator,
  createAnnouncement,
);

router.get("/:eventId", getAnnouncementsByEvent);

module.exports = router;
