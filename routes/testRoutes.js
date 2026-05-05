const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getTests, getTest, createTest, updateTest, deleteTest } = require("../controllers/testController");

router.get("/", getTests);
router.get("/:id", getTest);
router.post("/", protect, adminOnly, createTest);
router.put("/:id", protect, adminOnly, updateTest);
router.delete("/:id", protect, adminOnly, deleteTest);

module.exports = router;
