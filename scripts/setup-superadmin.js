const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
require("dotenv").config();

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      console.log("❌ Super admin already exists:", existingSuperAdmin.email);
      process.exit(0);
    }

    // Create superadmin user
    const superAdminData = {
      username: "superadmin",
      email: "superadmin@civicvoice.com",
      password: "SuperAdmin123!", // Change this password!
      role: "superadmin"
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superAdminData.password, salt);

    // Create user
    const superAdmin = new User({
      username: superAdminData.username,
      email: superAdminData.email,
      password: hashedPassword,
      role: superAdminData.role,
      isActive: true
    });

    await superAdmin.save();

    console.log("✅ Super admin created successfully!");
    console.log("📧 Email:", superAdminData.email);
    console.log("🔑 Password:", superAdminData.password);
    console.log("⚠️  IMPORTANT: Change this password after first login!");

  } catch (error) {
    console.error("❌ Error creating super admin:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createSuperAdmin();
