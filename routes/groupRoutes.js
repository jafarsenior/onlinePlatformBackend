// ─── groupRoutes.js ───────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getGroups, getGroup, createGroup, updateGroup, deleteGroup } = require("../controllers/groupController");

router.get("/", getGroups);
router.get("/:id", getGroup);
router.post("/", protect, adminOnly, createGroup);
router.put("/:id", protect, adminOnly, updateGroup);
router.delete("/:id", protect, adminOnly, deleteGroup);

module.exports = router;
