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

/**
 * POST /api/announcements
 * Admin-only: broadcast a live announcement for a specific event.
 */
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

/**
 * GET /api/announcements/:eventId
 * Public: fetch announcement history for an event (oldest to newest).
 */
router.get("/:eventId", getAnnouncementsByEvent);

module.exports = router;
