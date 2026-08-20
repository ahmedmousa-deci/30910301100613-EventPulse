const config = require("./config/config");
const express = require("express");
const connectDB = require("./db/db");
const mongoSanitize = require("express-mongo-sanitize");
const errorHandler = require("./middleware/errorHandler");
const authRoute = require("./routes/auth.route");
const categoryRoute = require("./routes/category.route");
const requireAuth = require("./middleware/requireAuth");
const app = express();
const port = config.PORT;

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

app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

app.use(errorHandler);
async function startServer() {
  await connectDB(config.MONGO_URL);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer();
