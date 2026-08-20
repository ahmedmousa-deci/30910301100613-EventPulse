const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const User = require("../modules/user.model");

const getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

const getAnUser = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const createUser = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const updateUser = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const deleteUser = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

module.exports = {
  getAllUsers,
  getAnUser,
  createUser,
  updateUser,
  deleteUser,
};
