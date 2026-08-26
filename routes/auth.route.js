const router = require("express").Router();
const { body, validationResult, matchedData } = require("express-validator");
const { signup, login } = require("../controllers/auth.controller");
const validator = require("../middleware/validator");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and login
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/signup",
  [
    body("name").not().isEmpty().withMessage("User name is required"),
    body("email")
      .not()
      .isEmpty()
      .withMessage("User email is required")
      .isEmail()
      .withMessage("Please fill a valid email address")
      .normalizeEmail(),
    body("password")
      .not()
      .isEmpty()
      .withMessage("User password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validator,
  signup,
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/login",
  [
    body("email")
      .not()
      .isEmpty()
      .withMessage("User email is required")
      .isEmail()
      .withMessage("Please fill a valid email address")
      .normalizeEmail(),
    body("password").not().isEmpty().withMessage("User password is required"),
  ],
  validator,
  login,
);

module.exports = router;
