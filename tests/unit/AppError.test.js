const AppError = require("../../utils/appError.util");

describe("AppError utility", () => {
  // Test 1: 4xx error produces status = "fail"
  test("new AppError(404, msg) sets statusCode=404 and status=fail", () => {
    const err = new AppError(404, "Not found");
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe("fail");
  });

  // Test 2: 5xx error produces status = "error"
  test("new AppError(500, msg) sets status=error", () => {
    const err = new AppError(500, "Server error");
    expect(err.status).toBe("error");
  });

  // Test 3: isOperational defaults to true
  test("isOperational is true by default", () => {
    const err = new AppError(400, "Bad request");
    expect(err.isOperational).toBe(true);
  });

  // Test 4: AppError is an instance of native Error
  test("AppError is an instance of Error", () => {
    const err = new AppError(401, "Unauthorized");
    expect(err).toBeInstanceOf(Error);
  });

  // Test 5: message is set correctly
  test("message is set from constructor argument", () => {
    const err = new AppError(403, "Forbidden");
    expect(err.message).toBe("Forbidden");
  });
});
