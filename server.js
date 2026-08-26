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

app.set("io", io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.handshake.headers?.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return next(new Error("Not authenticated"));
  }

  try {
    const payload = jwt.verify(token.split(" ")[1], config.JWT_SECRET);
    socket.user = payload;
    next();
  } catch (err) {
    return next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id} | user: ${socket.user._id}`);

  socket.on("join-event", async (eventId) => {
    try {
      console.log(
        `join-event received | eventId: ${eventId} | socket: ${socket.id}`,
      );

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
app.use("/api/v1/events", requireAuth, require("./routes/event.route"));
app.use(
  "/api/v1/registrations",
  requireAuth,
  require("./routes/registration.route"),
);
app.use("/api/v1/messages", requireAuth, require("./routes/message.route"));
app.use("/api/announcements", require("./routes/announcement.route"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Server is healthy", env: config.NODE_ENV });
});

app.use(errorHandler);

if (require.main === module) {
  async function startServer() {
    await connectDB(config.MONGO_URL);
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
  startServer();
}

module.exports = { app, io };
