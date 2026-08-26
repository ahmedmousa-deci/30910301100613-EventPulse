const asyncHandler = require("../../utils/asyncHandler.util");

describe("asyncHandler utility", () => {
  // Test 1: calls the wrapped function with req, res, next
  test("invokes wrapped function with req, res, next", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const mockFn = jest.fn().mockResolvedValue("ok");

    const wrapped = asyncHandler(mockFn);
    await wrapped(mockReq, mockRes, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  // Test 2: passes errors to next() when the wrapped function rejects
  test("passes error to next() when wrapped function throws", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const error = new Error("Something went wrong");
    const mockFn = jest.fn().mockRejectedValue(error);

    const wrapped = asyncHandler(mockFn);
    await wrapped(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  // Test 3: does not call next() when wrapped function resolves successfully
  test("does not call next() when wrapped function resolves", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const mockFn = jest.fn().mockResolvedValue("success");

    const wrapped = asyncHandler(mockFn);
    await wrapped(mockReq, mockRes, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
  });
});
