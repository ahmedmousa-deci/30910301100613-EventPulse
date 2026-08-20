const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const Registration = require("../modules/registration.model");

const getAllRegistrations = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

const getAnRegistration = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const createRegistration = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const updateRegistration = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const deleteRegistration = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

module.exports = {
  getAllRegistrations,
  getAnRegistration,
  createRegistration,
  updateRegistration,
  deleteRegistration,
};
