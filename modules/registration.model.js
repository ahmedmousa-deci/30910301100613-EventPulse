const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
      validate: {
        validator: async function (value) {
          const eventExists = await mongoose
            .model("Event")
            .exists({ _id: value });
          return Boolean(eventExists);
        },
        message: "Invalid event ID: Event does not exist",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      validate: {
        validator: async function (value) {
          const userExists = await mongoose
            .model("User")
            .exists({ _id: value });
          return Boolean(userExists);
        },
        message: "Invalid user ID: User does not exist",
      },
    },
  },
  { timestamps: true },
);

registrationSchema.index({ user: 1, event: 1 }, { unique: true }); // this line prevents the user from registering for the same event multiple times, by creating a unique index on the combination of user and event fields.

module.exports = mongoose.model("Registration", registrationSchema);
