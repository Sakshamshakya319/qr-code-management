const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Create admin user (simplified approach)
router.post('/create-admin', async (req, res) => {
  try {
    console.log('Admin creation request received');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@example.com'
    });
    
    if (existingAdmin) {
      // Update existing user to admin if needed
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isApproved = true;
        existingAdmin.approvedDate = new Date();
        await existingAdmin.save();
        
        return res.json({ 
          message: 'Existing user updated to admin',
          success: true,
          admin: {
            id: existingAdmin._id,
            name: existingAdmin.name,
            email: existingAdmin.email,
            role: existingAdmin.role
          }
        });
      }
      
      return res.json({ 
        message: 'Admin already exists',
        success: true,
        admin: {
          id: existingAdmin._id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }

    // Create new admin
    console.log('Creating new admin user...');
    const admin = new User({
      name: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      phone: process.env.ADMIN_PHONE || '1234567890',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isApproved: true,
      registrationDate: new Date(),
      approvedDate: new Date()
    });

    await admin.save();
    console.log('Admin created successfully');

    res.status(201).json({
      message: 'Admin user created successfully',
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    
    let errorMessage = 'Failed to create admin user';
    if (error.code === 11000) {
      errorMessage = 'Admin with this email already exists';
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Invalid user data provided';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      success: false,
      details: error.message 
    });
  }
});

// Check if admin exists
router.get('/check-admin', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    const totalUsers = await User.countDocuments();
    const adminUser = await User.findOne({ role: 'admin' }).select('name email role');
    
    res.json({
      hasAdmin: adminCount > 0,
      adminCount,
      totalUsers,
      adminUser: adminUser || null,
      needsSetup: adminCount === 0
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      error: 'Failed to check admin status',
      hasAdmin: false,
      needsSetup: true
    });
  }
});

// Get all users (for debugging)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('name email role isApproved createdAt');
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;