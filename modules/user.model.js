const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: [true, "Email already exists"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "User password is required"],
    },
    role: {
      type: String,
      enum: ["attendee", "admin"],
      default: "attendee",
    },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
