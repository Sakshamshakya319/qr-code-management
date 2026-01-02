require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    console.log('🔄 Starting admin creation process...');
    console.log('📡 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Get admin details from environment variables or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const adminPhone = process.env.ADMIN_PHONE || '1234567890';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    const existingAdmin = await User.findOne({ 
      email: adminEmail
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isApproved = true;
        existingAdmin.approvedDate = new Date();
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    console.log('👤 Creating new admin user...');
    const admin = new User({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
      role: 'admin',
      isApproved: true,
      registrationDate: new Date(),
      approvedDate: new Date()
    });

    await admin.save();
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('✅ Status: Approved');
    console.log('');
    console.log('🚀 You can now login with the provided credentials');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:');
    console.error('   Message:', error.message);
    if (error.code === 11000) {
      console.error('   Cause: Duplicate email - admin might already exist');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
console.log('🔧 QR Event Management - Admin Setup');
console.log('=====================================');
createAdmin();