const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const Registration = require("../modules/registration.model");
const Event = require("../modules/event.model");

const getAllRegistrations = asyncHandler(async (req, res, next) => {
  const registrations = await Registration.find()
    .lean()
    .populate("event")
    .populate({
      path: "user",
      select: "name email",
    });
  res.status(200).json({
    status: "success",
    results: registrations.length,
    data: registrations,
  });
});

const getAnRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id)
    .orFail()
    .lean()
    .populate("event")
    .populate({
      path: "user",
      select: "name email",
    });

  res.status(200).json({
    status: "success",
    data: registration,
  });
});
const getUserRegistrations = asyncHandler(async (req, res, next) => {
  const userid = req.user._id;
  const registrations = await Registration.find({ user: userid })
    .lean()
    .populate("event")
    .populate({
      path: "user",
      select: "name email",
    });
  res.status(200).json({
    status: "success",
    results: registrations.length,
    data: registrations,
  });
});

const createRegistration = asyncHandler(async (req, res, next) => {
  const userid = req.body.user || req.user._id;
  const event = req.body.event;

  const capacity = await Event.findById(event)
    .select("capacity")
    .lean()
    .orFail();

  const registrationCount = await Registration.countDocuments({ event });

  if (registrationCount >= capacity.capacity) {
    return next(new AppError(400, "Event is full"));
  }

  const registration = new Registration({
    event,
    user: userid,
  });

  await registration.save();

  await registration.populate("event");
  await registration.populate({ path: "user", select: "name email" });

  res.status(201).json({
    status: "success",
    data: registration,
  });
});

const deleteRegistration = asyncHandler(async (req, res, next) => {
  const userid = req.user._id;
  const isAdmin = req.user.role === "admin";
  const isOwner = await Registration.exists({
    _id: req.params.id,
    user: userid,
  });

  if ((await Registration.exists({ _id: req.params.id })) === null) {
    return next(new AppError(404, "Registration not found"));
  }

  if (!isOwner && !isAdmin) {
    return next(
      new AppError(403, "You are not the owner of this registration"),
    );
  }

  const registration = await Registration.findByIdAndDelete(
    req.params.id,
  ).orFail();
  res.status(204).send();
});

module.exports = {
  getAllRegistrations,
  getAnRegistration,
  createRegistration,
  deleteRegistration,
  getUserRegistrations,
};
