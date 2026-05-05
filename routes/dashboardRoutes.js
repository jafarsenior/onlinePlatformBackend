const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getStats, getDashboardCourses, getActivities } = require("../controllers/dashboardController");

router.get("/stats", protect, getStats);
router.get("/courses", protect, getDashboardCourses);
router.get("/activities", protect, getActivities);

module.exports = router;
