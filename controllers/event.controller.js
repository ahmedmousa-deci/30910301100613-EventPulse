const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const Event = require("../modules/event.model");
const Category = require("../modules/category.model");

const getAllEvents = asyncHandler(async (req, res, next) => {
  const {
    search,
    limit,
    page,
    city,
    startDate,
    endDate,
    category,
    sortBy,
    order,
  } = req.query;

  const pageValue = Math.max(parseInt(page) || 1, 1);
  const limitValue = Math.min(parseInt(limit) || 20, 20); // max 20 per page
  const skipValue = (pageValue - 1) * limitValue;

  const query = {
    ...(search ? { title: { $regex: new RegExp(search, "i") } } : {}),
    ...(city ? { city: { $regex: new RegExp(city, "i") } } : {}),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { $gte: new Date(startDate) } : {}),
            ...(endDate ? { $lte: new Date(endDate) } : {}),
          },
        }
      : {}),
    ...(category ? { category } : {}),
  };

  const allowedSortFields = ["date", "registrations"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "date";
  const sortDirection = order === "desc" ? -1 : 1;

  const sort = { [sortField]: sortDirection };

  let events;
  if (sortField === "registrations") {
    const matchQuery = {
      ...(search ? { title: { $regex: new RegExp(search, "i") } } : {}),
      ...(city ? { city: { $regex: new RegExp(city, "i") } } : {}),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { $gte: new Date(startDate) } : {}),
              ...(endDate ? { $lte: new Date(endDate) } : {}),
            },
          }
        : {}),
      ...(category && mongoose.Types.ObjectId.isValid(category)
        ? { category: new mongoose.Types.ObjectId(category) }
        : category
          ? { category }
          : {}),
    };

    events = await Event.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "event",
          as: "registrations",
        },
      },
      {
        $addFields: {
          registrationsCount: { $size: "$registrations" },
        },
      },
      {
        $sort: {
          registrationsCount: sortDirection,
          _id: 1,
        },
      },
      { $skip: skipValue },
      { $limit: limitValue },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          registrations: 0,
          registrationsCount: 0,
          "category.createdAt": 0,
          "category.updatedAt": 0,
          "category.__v": 0,
        },
      },
    ]);
  } else {
    events = await Event.find(query)
      .sort(sort)
      .skip(skipValue)
      .limit(limitValue)
      .populate("category", "name")
      .lean();
  }

  const total = await Event.countDocuments(query);

  res.status(200).json({
    status: 200,
    message: "Events fetched successfully",
    results: events.length,
    data: events,
    page: pageValue,
    limit: limitValue,
    total,
    totalPages: Math.ceil(total / limitValue),
    nextPage: pageValue * limitValue < total ? pageValue + 1 : null,
    prevPage: pageValue > 1 ? pageValue - 1 : null,
  });
});

const getAnEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id)
    .populate("category", "name")
    .lean()
    .orFail();

  if (!event) {
    return next(new AppError(404, "Event not found"));
  }

  res.status(200).json({
    status: 200,
    message: "Event fetched successfully",
    data: event,
  });
});
const createEvent = asyncHandler(async (req, res, next) => {
  const { title, description, date, city, category, capacity } = req.body;

  const event = new Event({
    title,
    description,
    date: new Date(date),
    city,
    category,
    capacity,
  });

  await event.save();
  await event.populate("category", "name");

  res.status(201).json({
    status: 201,
    message: "Event created successfully",
    data: event,
  });
});
const updateEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, date, city, category, capacity } = req.body;

  const event = await Event.findByIdAndUpdate(
    id,
    {
      ...(title && { title }),
      ...(description && { description }),
      ...(date && { date: new Date(date) }),
      ...(city && { city }),
      ...(category && { category }),
      ...(capacity && { capacity }),
    },
    { new: true, runValidators: true },
  ).orFail();

  if (!event) {
    return next(new AppError(404, "Event not found"));
  }

  await event.populate("category", "name");

  res.status(200).json({
    status: 200,
    message: "Event updated successfully",
    data: event,
  });
});

const deleteEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await Event.findByIdAndDelete(id).orFail();

  res.status(204).send();
});

module.exports = {
  getAllEvents,
  getAnEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
