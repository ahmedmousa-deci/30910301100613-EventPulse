const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Paluse API",
      version: "1.0.0",
      description:
        "Interactive API documentation for the Event Paluse platform. Use the Authorize button to add your Bearer token before testing protected endpoints.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token (without the Bearer prefix)",
        },
      },
      schemas: {
        // ── Auth schemas ───────────────────────────────────────────────────
        SignupRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", minLength: 6, example: "secret123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", example: "secret123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            data: { $ref: "#/components/schemas/User" },
          },
        },
        // ── User schema ────────────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f3a1b2c5d6e7f8a9b0c1d2" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: { type: "string", enum: ["admin", "attendee"], example: "attendee" },
          },
        },
        // ── Event schemas ──────────────────────────────────────────────────
        Event: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f3a1b2c5d6e7f8a9b0c1d2" },
            title: { type: "string", example: "Tech Conference 2026" },
            description: { type: "string", example: "A conference about technology" },
            date: { type: "string", format: "date", example: "2026-09-15" },
            city: { type: "string", example: "Cairo" },
            capacity: { type: "integer", example: 200 },
            category: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string", example: "Technology" },
              },
            },
          },
        },
        CreateEventRequest: {
          type: "object",
          required: ["title", "date", "city", "capacity", "category"],
          properties: {
            title: { type: "string", example: "Tech Conference 2026" },
            description: { type: "string", example: "A conference about technology" },
            date: { type: "string", format: "date", example: "2026-09-15" },
            city: { type: "string", example: "Cairo" },
            capacity: { type: "integer", example: 200 },
            category: { type: "string", example: "64f3a1b2c5d6e7f8a9b0c1d2" },
          },
        },
        // ── Error schemas ──────────────────────────────────────────────────
        ValidationError: {
          type: "object",
          properties: {
            status: { type: "integer", example: 422 },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Must be a valid email" },
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "fail" },
            message: { type: "string", example: "Resource not found" },
            data: { type: "null", example: null },
          },
        },
      },
    },
  },
  // Where swagger-jsdoc should look for @swagger JSDoc comments
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
