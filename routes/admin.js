const express = require("express");
const bcrypt = require("bcryptjs");
const Issue = require("../models/Issue.js");
const User = require("../models/User.js");
const { verifyToken } = require("../middleware/auth.js");
const { isAdmin, isSuperAdmin, isActiveUser } = require("../middleware/admin.js");
const { validateAdminCreation, validateRoleUpdate, validateStatusUpdate, validateIssueStatusUpdate } = require("../middleware/validation.js");

const router = express.Router();

// ===== ISSUE MANAGEMENT =====

// Get all issues
router.get("/issues", verifyToken, isActiveUser, isAdmin, async (req, res) => {
  try {
    const issues = await Issue.find().populate("userId", "username email role");
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single issue
router.get("/issues/:id", verifyToken, isActiveUser, isAdmin, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("userId", "username email role");
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update issue status
router.put("/issues/:id/status", verifyToken, isActiveUser, isAdmin, validateIssueStatusUpdate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ["Pending", "In Progress", "Resolved", "Verified"];
    if (!validStatus.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user.id },
      { new: true }
    ).populate("userId", "username email");
    
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    res.json({ message: "Status updated", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete issue (Super admin only)
router.delete("/issues/:id", verifyToken, isActiveUser, isSuperAdmin, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== USER MANAGEMENT =====

// Get all users
router.get("/users", verifyToken, isActiveUser, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single user
router.get("/users/:id", verifyToken, isActiveUser, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("createdBy", "username email");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new admin (Super admin only)
router.post("/users/create-admin", verifyToken, isActiveUser, isSuperAdmin, validateAdminCreation, async (req, res) => {
  try {
    const { username, email, password, role = "admin" } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    // Validate role
    const validRoles = ["user", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Use 'user' or 'admin'" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      createdBy: req.user.id
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      message: `${role} created successfully`, 
      user: userResponse 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role (Super admin only)
router.put("/users/:id/role", verifyToken, isActiveUser, isSuperAdmin, validateRoleUpdate, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["user", "admin", "superadmin"];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Prevent self-demotion from superadmin
    if (req.params.id === req.user.id && req.user.role === 'superadmin' && role !== 'superadmin') {
      return res.status(400).json({ error: "Cannot demote yourself from superadmin" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activate/Deactivate user (Admin only)
router.put("/users/:id/status", verifyToken, isActiveUser, isAdmin, validateStatusUpdate, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: "isActive must be true or false" });
    }

    // Prevent self-deactivation
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ 
      message: `User ${isActive ? 'activated' : 'deactivated'}`, 
      user 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (Super admin only)
router.delete("/users/:id", verifyToken, isActiveUser, isSuperAdmin, async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ADMIN DASHBOARD STATS =====

// Get dashboard statistics
router.get("/dashboard/stats", verifyToken, isActiveUser, isAdmin, async (req, res) => {
  try {
    const [
      totalIssues,
      pendingIssues,
      resolvedIssues,
      totalUsers,
      adminUsers,
      recentIssues
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: "Pending" }),
      Issue.countDocuments({ status: "Resolved" }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $in: ["admin", "superadmin"] } }),
      Issue.find().populate("userId", "username email").sort({ createdAt: -1 }).limit(5)
    ]);

    const issuesByType = await Issue.aggregate([
      { $group: { _id: "$issueType", count: { $sum: 1 } } }
    ]);

    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      overview: {
        totalIssues,
        pendingIssues,
        resolvedIssues,
        totalUsers,
        adminUsers
      },
      charts: {
        issuesByType,
        issuesByStatus
      },
      recentIssues
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
