const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
require("./models");

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

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
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

app.use((req, _res, next) => {
  req.url = req.url.replace(/\/{2,}/g, "/");
  next();
});

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

const apiRoutes = {
  auth: [
    "POST /api/auth/register",
    "POST /api/auth/login",
    "GET /api/auth/me",
    "PUT /api/auth/me",
    "PUT /api/auth/change-password",
  ],
  courses: [
    "GET /api/courses",
    "GET /api/courses/categories",
    "GET /api/courses/teacher/my",
    "GET /api/courses/:id",
    "POST /api/courses",
    "PUT /api/courses/:id",
    "DELETE /api/courses/:id",
  ],
  groups: [
    "GET /api/groups",
    "GET /api/groups/:id",
    "POST /api/groups",
    "PUT /api/groups/:id",
    "DELETE /api/groups/:id",
  ],
  lessons: [
    "GET /api/lessons",
    "GET /api/lessons/:id",
    "POST /api/lessons",
    "PUT /api/lessons/:id",
    "DELETE /api/lessons/:id",
    "POST /api/lessons/:id/complete",
  ],
  payments: [
    "POST /api/payments",
    "GET /api/payments/my",
    "GET /api/payments/all",
    "GET /api/payments/:id/status",
  ],
  enrollments: [
    "GET /api/enrollments/my",
    "GET /api/enrollments/my/:courseId",
    "GET /api/enrollments/all",
  ],
  contact: [
    "POST /api/contact",
    "GET /api/contact",
    "PUT /api/contact/:id",
  ],
  admin: [
    "GET /api/admin/stats",
    "GET /api/admin/users",
    "PUT /api/admin/users/:id",
  ],
  dashboard: [
    "GET /api/dashboard/stats",
    "GET /api/dashboard/courses",
    "GET /api/dashboard/activities",
  ],
  tests: [
    "GET /api/tests",
    "GET /api/tests/:id",
    "POST /api/tests",
    "PUT /api/tests/:id",
    "DELETE /api/tests/:id",
  ],
};

app.get(["/", "/api"], (_req, res) => {
  res.json({
    success: true,
    message: "API ishlayapti",
    routes: apiRoutes,
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
