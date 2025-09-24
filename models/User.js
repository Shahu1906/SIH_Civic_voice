const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed
  googleId: { type: String }, // for OAuth users
  role: { 
    type: String, 
    enum: ["user", "admin", "superadmin"], 
    default: "user" 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  } // Track who created this user (for admin-created accounts)
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
