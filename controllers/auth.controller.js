const asyncHandler = require("../utils/asyncHandler.util");
const AppError = require("../utils/appError.util");
const User = require("../modules/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  console.log("Signup request body:", req.body);
  console.log("Name:", name, "Email:", email, "Password:", password);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = jwt.sign(
    { _id: user._id, email: user.email },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    },
  );

  res.status(201).json({
    status: 201,
    token,
    data: user,
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError(401, "Invalid email or password"));
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return next(new AppError(401, "Invalid email or password"));
  }

  const token = jwt.sign(
    { _id: user._id, email: user.email },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    },
  );

  res.status(200).json({
    status: 200,
    token,
    data: user,
  });
});

module.exports.signup = signup;
module.exports.login = login;
