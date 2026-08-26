const request = require("supertest");
const mongoose = require("mongoose");
const { app, io } = require("../../server");

// Connect to DB before all tests, disconnect after
beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (mongoUrl && mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUrl);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await io.close();
});

// -- Test 1: GET /api/v1/events without token returns 401 ---------------------
describe("GET /api/v1/events", () => {
  test("returns 401 when no auth token is provided", async () => {
    const res = await request(app).get("/api/v1/events");
    expect(res.status).toBe(401);
  });
});

// -- Test 2: POST /api/v1/events without token returns 401 --------------------
describe("POST /api/v1/events — Unauthenticated write", () => {
  test("returns 401 when no JWT token is provided", async () => {
    const res = await request(app)
      .post("/api/v1/events")
      .send({ title: "Test Event" });

    expect(res.status).toBe(401);
  });
});

// -- Test 3: POST /api/auth/login with invalid credentials returns 401 ---------
describe("POST /api/v1/auth/login — Validation", () => {
  test("returns 422 when email is invalid format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "pass123" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("errors");
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

// -- Test 4: POST /api/auth/register with missing fields returns 422 -----------
describe("POST /api/v1/auth/signup — Validation", () => {
  test("returns 422 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({}); // empty body

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("errors");
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test("returns 422 when password is too short (< 6 chars)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ name: "Test", email: "test@test.com", password: "123" });

    expect(res.status).toBe(422);
  });
});

// -- Test 5: Health check ------------------------------------------------------
describe("GET /health", () => {
  test("returns 200 and healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });
});

