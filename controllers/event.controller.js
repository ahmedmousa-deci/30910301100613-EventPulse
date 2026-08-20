const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const Event = require("../modules/event.model");

const getAllEvents = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

const getAnEvent = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const createEvent = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const updateEvent = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const deleteEvent = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

module.exports = {
  getAllEvents,
  getAnEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
