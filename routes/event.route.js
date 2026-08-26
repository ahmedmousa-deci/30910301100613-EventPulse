const express = require("express");
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
  getAllEvents,
  getAnEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/event.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management (admin) and browsing (all authenticated users)
 */

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all events (paginated, filterable)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by event title
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events until this date (YYYY-MM-DD)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category MongoId
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get(
  "/",
  [
    query("search")
      .optional()
      .isString()
      .withMessage("search must be a string"),
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
  validator,
  getAllEvents,
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Event not found
 */
router.get(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage("Event ID must be a valid MongoDB ObjectId"),
  ],
  validator,
  getAnEvent,
);

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create a new event (Admin only)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
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

/**
 * @swagger
 * /api/v1/events/{id}:
 *   patch:
 *     summary: Update an event (Admin only)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event MongoDB ObjectId
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               city:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               capacity:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid ID or field format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Event not found
 *       422:
 *         description: Validation failed
 *   delete:
 *     summary: Delete an event (Admin only)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event MongoDB ObjectId
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Event not found
 */
router.patch(
  "/:id",
  requireRole("admin"),
  [
    param("id")
      .isMongoId()
      .withMessage("Event ID must be a valid MongoDB ObjectId"),
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
router.delete(
  "/:id",
  requireRole("admin"),
  [
    param("id")
      .isMongoId()
      .withMessage("Event ID must be a valid MongoDB ObjectId"),
  ],
  validator,
  deleteEvent,
);

module.exports = router;
