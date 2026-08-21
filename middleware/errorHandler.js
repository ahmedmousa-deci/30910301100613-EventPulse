const config = require("../config/config");

const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.name, err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Invalid input data: ${errors.join(". ")}`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
  }

  if (err.code === 11000 || err.cause?.code === 11000) {
    statusCode = 400;
    const keyValue = err.keyValue || err.cause?.keyValue;
    const key = Object.keys(keyValue || {})[0] || "field";
    const value = keyValue?.[key];
    message = `Duplicate value for '${key}': '${value}'. Please use another value!${config.NODE_ENV === "development" ? ", " + err.message : ""}`;
  }

  res.status(statusCode).json({
    status: statusCode,
    message: message,
    data: null,
    ...(config.NODE_ENV === "development" && { stack: err.stack }),
  });
  console.error(err);
};

module.exports = errorHandler;
