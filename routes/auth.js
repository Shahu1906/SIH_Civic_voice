const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { validateRegister, validateLogin } = require("../middleware/validation.js");

const router = express.Router();

// Register
router.post("/register", validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default role
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "user" // Default role
    });

    await user.save();

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ error: "Account is deactivated. Contact administrator." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Create JWT token with role information
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        isActive: user.isActive 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get("/profile", require("../middleware/auth.js").verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("createdBy", "username email");
    
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
