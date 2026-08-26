const { validationResult } = require("express-validator");

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // Return 422 with an array of field-specific error objects
  return res.status(422).json({
    status: 422,
    message: "Validation failed",
    errors: errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    })),
  });
};

module.exports = validator;
