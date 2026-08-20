const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const Message = require("../modules/message.model");

const getAllMessages = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

const getAnMessage = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const createMessage = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const updateMessage = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});
const deleteMessage = asyncHandler(async (req, res, next) => {
  res.status(200).send();
});

module.exports = {
  getAllMessages,
  getAnMessage,
  createMessage,
  updateMessage,
  deleteMessage,
};
