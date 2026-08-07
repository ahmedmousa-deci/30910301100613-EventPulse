const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
    },
    city: {
      type: String,
      required: [true, "Event city is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Event capacity is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Event category is required"],
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Event", eventSchema);
