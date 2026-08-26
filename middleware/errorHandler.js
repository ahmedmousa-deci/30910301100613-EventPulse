const config = require("../config/config");
const AppError = require("../utils/appError.util");

const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.name, err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose ValidationError → 400 Bad Request ──────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Invalid input data: ${errors.join(". ")}`;
  }

  // ── Mongoose CastError (invalid ID format) → 400 Bad Request ────────────
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
  }

  // ── Duplicate Key Error (code 11000) → 409 Conflict ─────────────────────
  if (err.code === 11000 || err.cause?.code === 11000) {
    statusCode = 409;
    const keyValue = err.keyValue || err.cause?.keyValue;
    const key = Object.keys(keyValue || {})[0] || "field";
    const value = keyValue?.[key];
    message = `Duplicate value for '${key}': '${value}'. Please use another value!`;
  }

  // ── DocumentNotFoundError → 404 Not Found ───────────────────────────────
  if (err.name === "DocumentNotFoundError") {
    statusCode = 404;
    const modelName = err.model || err.query?.model || "Resource";
    const filter = err.query?._conditions || err.filter || {};
    const filterStr = Object.entries(filter)
      .map(([key, value]) => `${key === "_id" ? "ID" : key} '${value}'`)
      .join(", ");
    message = `${modelName} not found${filterStr ? ": " + filterStr : ""}.`;
  }

  // ── Custom AppError → use its own statusCode ────────────────────────────
  // (Already handled above via err.statusCode, but we set status string here)
  const status =
    err instanceof AppError
      ? err.status
      : `${statusCode}`.startsWith("4")
        ? "fail"
        : "error";

  res.status(statusCode).json({
    status,
    message,
    data: null,
    ...(config.NODE_ENV === "development" && { stack: err.stack }),
  });

  if (config.NODE_ENV === "development") {
    console.error(err.stack);
  }
};

module.exports = errorHandler;
