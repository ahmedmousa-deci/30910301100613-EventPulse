const config = require("./config/config");
const express = require("express");
const connectDB = require("./db/db");
const mongoSanitize = require("express-mongo-sanitize");
const errorHandler = require("./middleware/errorHandler");
const authRoute = require("./routes/auth.route");
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
