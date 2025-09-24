const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const cloudinary = require("../utils/cloudinary.js");
const Issue = require("../models/Issue.js");
const { validateIssue } = require("../utils/gemini.js");
const { verifyToken } = require("../middleware/auth.js");
const { validateReport } = require("../middleware/validation.js");

const router = express.Router();
const upload = multer({
  dest: "tmp/",
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
    }
  }
});

// POST /api/report
router.post("/", verifyToken, validateReport, upload.single("image"), async (req, res) => {
  try {
    const { description, issueType, location } = req.body;

    if (!req.file) return res.status(400).json({ error: "Image is required" });

    console.log("Processing report with image:", req.file.path);

    // 1️⃣ Validate description with Gemini AI (with image analysis)
    const geminiValidation = await validateIssue(description, null, req.file.path);
    console.log("Gemini validation result:", geminiValidation);

    // 2️⃣ Upload image to Cloudinary
    const cldResp = await cloudinary.uploader.upload(req.file.path, {
      folder: "civic_issues",
      use_filename: true,
      unique_filename: true,
    });

    // Delete temp file after Cloudinary upload
    await fs.unlink(req.file.path);

    const imageUrl = cldResp.secure_url;

    // 3️⃣ Save report to MongoDB, link to logged-in user
    const issue = new Issue({
      userId: req.user.id, // from JWT
      description,
      issueType,
      location: location ? JSON.parse(location) : undefined,
      imageUrl,
      geminiValidation,
      status: geminiValidation.match ? "Verified" : "Pending"
    });

    await issue.save();

    res.status(201).json({ 
      message: "Report submitted successfully", 
      issue: {
        ...issue.toObject(),
        ai_analysis: {
          description_match: geminiValidation.match,
          confidence: geminiValidation.confidence,
          image_analysis: geminiValidation.image_analysis,
          severity: geminiValidation.severity,
          suggested_category: geminiValidation.category_suggestion,
          validation_method: geminiValidation.validation_method
        }
      }
    });
  } catch (err) {
    console.error("Report submission error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
