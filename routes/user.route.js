const express = require("express");
const requireRole = require("../middleware/requireRole");
const { body } = require("express-validator");

const validator = require("../middleware/validator");
const {
  getAllUsers,
  createUser,
  deleteUser,
  getAnUser,
  updateUser,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/", requireRole("admin"), getAllUsers);
router.get("/:id", requireRole("admin"), getAnUser);
router.post(
  "/",
  requireRole("admin"),
  [
    body("name").not().isEmpty().withMessage("User name is required"),
    body("email")
      .not()
      .isEmpty()
      .withMessage("User email is required")
      .isEmail()
      .withMessage("Invalid email"),
    body("passwordHash")
      .not()
      .isEmpty()
      .withMessage("User passwordHash is required"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  ],
  validator,
  createUser,
);
router.patch(
  "/:id",
  requireRole("admin"),
  [
    body("name")
      .optional()
      .not()
      .isEmpty()
      .withMessage("User name cannot be empty"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("passwordHash")
      .optional()
      .not()
      .isEmpty()
      .withMessage("User passwordHash cannot be empty"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  ],
  validator,
  updateUser,
);

router.delete("/:id", requireRole("admin"), deleteUser);

module.exports = router;
