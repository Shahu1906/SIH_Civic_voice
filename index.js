const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");

// Routes
const authRoutes = require("./routes/auth.js");
const reportRoutes = require("./routes/report.js");
const adminRoutes = require("./routes/admin.js");
const userRoutes = require("./routes/user.js");

// Passport config
require("./utils/passport.js");

// Middleware
const { authLimiter, reportLimiter } = require("./middleware/rateLimit.js");
const { errorHandler, notFound } = require("./middleware/errorHandler.js");

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Basic middleware - IMPORTANT: These must come before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes with increased rate limiting for testing
app.use("/api/auth", authLimiter, authRoutes);  // 50 requests per 15 min
app.use("/api/report", reportLimiter, reportRoutes);  // 50 requests per hour
// Admin routes
app.use("/api/admin", adminRoutes);

// User-specific routes
app.use("/api/user", userRoutes);

// Google OAuth callback route (optional)
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Redirect after successful login
    res.redirect("/dashboard");
  }
);

// Health check route
app.get("/", (req, res) => {
  res.send("Civic Issue Backend is running!");
});

// 404 handler - must be last route
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
