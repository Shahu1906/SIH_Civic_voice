import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";

// Routes
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/report.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";

// Passport config
import "./utils/passport.js";

// Middleware
import { authLimiter, reportLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes with rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/report", reportLimiter, reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// Google OAuth callback route
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
