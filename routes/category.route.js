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
    query("name")
      .optional()
      .isString()
      .withMessage("Category name must be a string"),
  ],
  validator,
  getAllCategories,
);
router.get("/:id", getACategory);
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
router.delete("/:id", requireRole("admin"), deleteCategory);

module.exports = router;
