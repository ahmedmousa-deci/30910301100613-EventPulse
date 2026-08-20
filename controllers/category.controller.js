const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const Category = require("../modules/category.model");

const getAllCategories = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

const getACategory = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const createCategory = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const updateCategory = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const deleteCategory = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

module.exports = {
  getAllCategories,
  getACategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
