const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { sendContact, getContacts, updateContactStatus } = require("../controllers/contactController");

router.post("/", sendContact);
router.get("/", protect, adminOnly, getContacts);
router.put("/:id", protect, adminOnly, updateContactStatus);

module.exports = router;
