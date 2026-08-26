const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const Message = require("../modules/message.model");

const createAnnouncement = asyncHandler(async (req, res, next) => {
  const { eventId, text } = req.body;

  if (!eventId || !text) {
    return next(new AppError("eventId and text are required", 400));
  }

  const message = await Message.create({
    event: eventId,
    user: req.user._id,
    text,
  });

  await message.populate("user", "name email");

  const io = req.app.get("io");
  if (io) {
    io.to(`event_${eventId}`).emit("announcement", message);
  }

  res.status(201).json({ success: true, data: message });
});

const getAnnouncementsByEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const messages = await Message.find({ event: eventId })
    .sort({ createdAt: 1 })
    .populate("user", "name email");

  res.status(200).json({ success: true, data: messages });
});

const getAllMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find()
    .sort({ createdAt: 1 })
    .populate("user", "name email");
  res.status(200).json({ success: true, data: messages });
});

const getAnMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!message) return next(new AppError("Message not found", 404));
  res.status(200).json({ success: true, data: message });
});

const createMessage = asyncHandler(async (req, res, next) => {
  const { text, event, user } = req.body;
  const message = await Message.create({ text, event, user });
  res.status(201).json({ success: true, data: message });
});

const updateMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!message) return next(new AppError("Message not found", 404));
  res.status(200).json({ success: true, data: message });
});

const deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return next(new AppError("Message not found", 404));
  res.status(204).send();
});

module.exports = {
  createAnnouncement,
  getAnnouncementsByEvent,
  getAllMessages,
  getAnMessage,
  createMessage,
  updateMessage,
  deleteMessage,
};
