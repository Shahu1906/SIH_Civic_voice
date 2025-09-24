const express = require("express");
const Issue = require("../models/Issue.js");
const { verifyToken } = require("../middleware/auth.js");

const router = express.Router();

// Get all reports of logged-in user
router.get("/my-reports", verifyToken, async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.user.id });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
