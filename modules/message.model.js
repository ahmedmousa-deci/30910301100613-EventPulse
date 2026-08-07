const mongooose = require("mongoose");

const messageSchema = new mongooose.Schema(
  {
    event: {
      type: mongooose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    user: {
      type: mongooose.Schema.Types.ObjectId,
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

module.exports = mongooose.model("Message", messageSchema);
