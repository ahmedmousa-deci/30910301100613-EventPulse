const { validationResult } = require("express-validator");
const AppError = require("../utils/appError.util");

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return next(
    new AppError(
      400,
      errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    ),
  );
};

module.exports = validator;
