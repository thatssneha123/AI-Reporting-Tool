const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/dataset", require("./routes/dataset.routes"));
app.use("/api/analyze", require("./routes/analyze.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/subscription", require("./routes/subscription.routes"));
app.use(require("./middleware/error.middleware"));
module.exports = app;
