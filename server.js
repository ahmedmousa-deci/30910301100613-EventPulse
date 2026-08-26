const config = require("./config/config");
const express = require("express");
const cors = require("cors");
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

// Middleware
app.use(cors());
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

// Logger configuration (Vercel-compatible read-only filesystem check)
if (config.NODE_ENV === "production" && !process.env.VERCEL) {
  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, "access.log"),
    { flags: "a" },
  );

  app.use(morgan("combined", { stream: accessLogStream }));
} else if (config.NODE_ENV === "production" && process.env.VERCEL) {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Ensure database connection before handling requests
app.use(async (req, res, next) => {
  try {
    if (config.MONGO_URL) {
      await connectDB(config.MONGO_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// API Routes
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

// Swagger Documentation with CDN assets for Serverless compatibility
const SWAGGER_CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css";
const SWAGGER_JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js",
];

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: SWAGGER_CSS_URL,
    customJs: SWAGGER_JS_URLS,
  }),
);

// Root & Health Check Endpoints
app.get("/", (req, res) => {
  res.status(200).json({
    name: "EventPulse API",
    version: "1.0.0",
    status: "active",
    docs: "/api-docs",
    health: "/health",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy",
    env: config.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use(errorHandler);

// Initial DB connection attempt
if (config.MONGO_URL) {
  connectDB(config.MONGO_URL).catch((err) => {
    console.error("Initial DB connection failed:", err.message);
  });
}

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.io = io;
module.exports.server = server;
