const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const Category = require("../modules/category.model");

const getAllCategories = asyncHandler(async (req, res, next) => {
  const { search, limit, page } = req.query;

  const isPaginated = page !== undefined || limit !== undefined;

  if (isPaginated) {
    const limitValue = Math.min(parseInt(limit), 20);
    const pageValue = Math.max(parseInt(page), 1);
    const skipValue = (pageValue - 1) * limitValue;

    const categories = await Category.find({
      name: { $regex: search || "", $options: "i" },
    })
      .skip(skipValue)
      .limit(limitValue)
      .lean()
      .orFail();

    const totalCategories = await Category.countDocuments();

    return res.status(200).json({
      status: 200,
      results: categories.length,
      data: categories,
      total: totalCategories,
      page: pageValue,
      totalPages: Math.ceil(totalCategories / limitValue),
      limit: limitValue,
      nextPage: pageValue * limitValue < totalCategories ? pageValue + 1 : null,
      prevPage: pageValue > 1 ? pageValue - 1 : null,
    });
  }

  const categories = await Category.find({
    name: { $regex: search || "", $options: "i" },
  })
    .lean()
    .orFail();

  res.status(200).json({
    status: 200,
    results: categories.length,
    data: categories,
  });
});

const getACategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).lean().orFail();

  return res.status(200).json({
    status: 200,
    data: category,
  });
});
const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const category = await Category.create({ name });

  res.status(201).json({
    status: 200,
    data: category,
  });
});
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true },
  )
    .lean()
    .orFail();

  res.status(200).json({
    status: 200,
    data: category,
  });
});
const deleteCategory = asyncHandler(async (req, res, next) => {
  await Category.findByIdAndDelete(req.params.id).lean().orFail();

  res.status(204).send();
});

module.exports = {
  getAllCategories,
  getACategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
