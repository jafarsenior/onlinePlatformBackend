const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

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

// Dev: Admin yaratish (faqat dev rejimda)
if (process.env.NODE_ENV === "development") {
  app.post("/api/dev/make-admin", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) return res.status(400).json({ success: false, message: "Telefon kerak" });

      const user = await require("./models/User").findOneAndUpdate(
        { phone },
        { role: "admin" },
        { new: true }
      );

      if (!user) return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
      res.json({ success: true, message: "Admin qilindi", user });
    } catch (_error) {
      res.status(500).json({ success: false, message: "Xato" });
    }
  });
}

// Health check
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Online Platforma API ishlayapti",
    version: "1.0.0",
    routes: {
      auth: "/api/auth",
      courses: "/api/courses",
      groups: "/api/groups",
      lessons: "/api/lessons",
      payments: "/api/payments",
      enrollments: "/api/enrollments",
      contact: "/api/contact",
      admin: "/api/admin",
      dashboard: "/api/dashboard",
      tests: "/api/tests",
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route topilmadi" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server xatosi",
  });
});

// MongoDB + Server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB ga ulandi");
    app.listen(PORT, () => {
      console.log(`Server http://localhost:${PORT} da ishlamoqda`);
    });
  })
  .catch((err) => {
    console.error("MongoDB ulanish xatosi:", err.message);
    process.exit(1);
  });
