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
      validate: {
        validator: async function (value) {
          const category = await mongoose.model("Category").findById(value);
          return !!category; // Returns false if category does not exist
        },
        message: "Referenced category does not exist.",
      },
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Event", eventSchema);
