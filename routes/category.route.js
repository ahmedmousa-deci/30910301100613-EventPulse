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
  getAllCategories,
  getACategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const router = express.Router();

router.get(
  "/",
  [
    query("search")
      .optional()
      .isString()
      .withMessage("Category search term must be a string")
      .notEmpty()
      .withMessage("Category search term cannot be empty"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Category limit must be a positive integer"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Category page must be a positive integer"),
  ],
  validator,
  getAllCategories,
);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid category ID")],
  validator,
  getACategory,
);
router.post(
  "/",
  requireRole("admin"),
  [body("name").not().isEmpty().withMessage("Category name is required")],
  validator,
  createCategory,
);
router.patch(
  "/:id",
  requireRole("admin"),
  [
    param("id").isMongoId().withMessage("Invalid category ID"),
    body("name")
      .not()
      .isEmpty()
      .withMessage(
        "Category name is required (category name is the only field that can be updated)",
      ),
  ],
  validator,
  updateCategory,
);
router.delete(
  "/:id",
  requireRole("admin"),
  [param("id").isMongoId().withMessage("Invalid category ID")],
  validator,
  deleteCategory,
);

module.exports = router;
