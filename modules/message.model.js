const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
