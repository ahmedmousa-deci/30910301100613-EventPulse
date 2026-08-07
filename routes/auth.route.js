const router = require("express").Router();
const { body, validationResult, matchedData } = require("express-validator");
const { signup, login } = require("../controllers/auth.controller");
const validator = require("../middleware/validator");

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
