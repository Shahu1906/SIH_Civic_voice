const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  issueType: {
    type: String,
    required: true,
    enum: ["Road", "Sanitation", "Electricity", "Water", "Other"]
  },
  location: {
    type: Object,
    required: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  geminiValidation: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Verified", "In Progress", "Resolved"],
    default: "Pending"
  }
}, {
  timestamps: true
});

// Add indexes for better performance
IssueSchema.index({ userId: 1 });
IssueSchema.index({ status: 1 });
IssueSchema.index({ issueType: 1 });

module.exports = mongoose.model("Issue", IssueSchema);