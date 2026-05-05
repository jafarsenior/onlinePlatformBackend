const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  ...((process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)),
];

// Mongo ulash
let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;

  console.log("MongoDB connected");
}

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    res.status(500).json({ success: false, message: "Database connection error" });
  }
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "API ishlayapti",
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route topilmadi" });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack || err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server xatosi",
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} da ishlamoqda`);
  });
}

module.exports = app;
