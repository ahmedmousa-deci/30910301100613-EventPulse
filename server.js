const config = require("./config/config");
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const connectDB = require("./db/db");
const mongoSanitize = require("express-mongo-sanitize");
const errorHandler = require("./middleware/errorHandler");
const authRoute = require("./routes/auth.route");
const categoryRoute = require("./routes/category.route");
const requireAuth = require("./middleware/requireAuth");
const Event = require("./modules/event.model");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const app = express();
const port = config.PORT;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Attach io to app so controllers can reach it via req.app.get("io")
app.set("io", io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── Socket.io Auth Middleware ────────────────────────────────────────────────
// io.use() runs ONCE for every new socket connection, before "connection" fires.
// If next(new Error()) is called, the client is rejected and never connects.
io.use((socket, next) => {
  // Check both places the token can come from:
  // 1. Socket.io auth object:  io("url", { auth: { token: "Bearer ey..." } })
  // 2. HTTP Authorization header (Postman Headers tab): Authorization: Bearer ey...
  const token =
    socket.handshake.auth?.token || socket.handshake.headers?.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    // Reject the connection — client will receive a connect_error event
    return next(new Error("Not authenticated"));
  }

  try {
    // Verify the token using the same secret as the HTTP requireAuth middleware
    const payload = jwt.verify(token.split(" ")[1], config.JWT_SECRET);
    // Attach the user payload to the socket so handlers can access it later
    socket.user = payload;
    next(); // allow the connection to proceed
  } catch (err) {
    return next(new Error("Invalid or expired token"));
  }
});

// ─── Socket.io Connection Handler ────────────────────────────────────────────
io.on("connection", (socket) => {
  // By this point io.use() has already verified the token
  // socket.user contains the decoded JWT payload (id, role, email, etc.)
  console.log(`Socket connected: ${socket.id} | user: ${socket.user._id}`);

  // Support both naming conventions: hyphenated (task spec) and underscore (legacy)
  socket.on("join-event", async (eventId) => {
    try {
      console.log(
        `join-event received | eventId: ${eventId} | socket: ${socket.id}`,
      );

      // Step 1 — Validate the eventId is a proper MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        socket.emit("join-error", { message: "Invalid event ID format" });
        return;
      }

      // Step 2 — Check the event actually exists in the database
      const event = await Event.findById(eventId);
      if (!event) {
        socket.emit("join-error", { message: "Event not found" });
        return;
      }

      // Step 3 — All valid, join the room named "event_<eventId>"
      const roomName = `event_${eventId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
      socket.emit("joined", { room: roomName });
    } catch (err) {
      console.error("join-event error:", err.message);
      socket.emit("join-error", {
        message: "Server error while joining event",
      });
    }
  });

  socket.on("join_event", async ({ eventId }) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      socket.emit("join-error", { message: "Invalid event ID format" });
      return;
    }
    const event = await Event.findById(eventId);
    if (!event) {
      socket.emit("join-error", { message: "Event not found" });
      return;
    }
    const roomName = `event_${eventId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
    socket.emit("joined", { room: roomName });
  });

  socket.on("leave_event", ({ eventId }) => {
    const roomName = `event_${eventId}`;
    socket.leave(roomName);
    console.log(`Socket ${socket.id} left room: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // to avoid the error of "Cannot assign to read only property 'query' of object '#<Object>'" when using express-mongo-sanitize
  Object.defineProperty(req, "query", {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());

if (config.NODE_ENV === "production") {
  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, "access.log"),
    { flags: "a" },
  );

  app.use(morgan("combined", { stream: accessLogStream }));
} else {
  app.use(morgan("dev"));
}

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/categories", requireAuth, categoryRoute);
app.use("/api/v1/users", requireAuth, require("./routes/user.route"));
app.use("/api/v1/events", requireAuth, require("./routes/event.route"));
app.use(
  "/api/v1/registrations",
  requireAuth,
  require("./routes/registration.route"),
);
app.use("/api/v1/messages", requireAuth, require("./routes/message.route"));
app.use("/api/announcements", require("./routes/announcement.route"));

// ── Swagger UI ─────────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Server is healthy", env: config.NODE_ENV });
});

app.use(errorHandler);

// Only start the HTTP server when this file is run directly (not during tests)
if (require.main === module) {
  async function startServer() {
    await connectDB(config.MONGO_URL);
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
  startServer();
}

// Export app and io for Supertest integration tests
module.exports = { app, io };
