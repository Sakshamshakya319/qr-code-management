const express = require('express');
const QRCode = require('qrcode');
const User = require('../models/User');
const QRScan = require('../models/QRScan');
const { auth, adminAuth } = require('../middleware/auth');
const { qrScanValidation } = require('../middleware/validation');

const router = express.Router();

// Generate QR code for user (Admin only)
router.post('/generate/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { eventId = 'default-event' } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create unique QR data
    const qrData = {
      userId: user._id,
      email: user.email,
      name: user.name,
      eventId,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user._id
    };
    
    const qrDataString = JSON.stringify(qrData);
    
    // Generate QR code as base64 image
    const qrCodeImage = await QRCode.toDataURL(qrDataString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    // Update user with QR code data
    user.qrCode = qrCodeImage;
    user.qrCodeData = qrDataString;
    user.eventId = eventId;
    await user.save();
    
    res.json({
      message: 'QR code generated successfully',
      qrCode: qrCodeImage,
      qrData: qrDataString,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Scan QR code and approve user (Admin only)
router.post('/scan', adminAuth, qrScanValidation, async (req, res) => {
  try {
    const { qrData, scanType = 'approval', notes = '' } = req.body;
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    
    const { userId } = parsedData;
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid QR code: missing user ID' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify QR code matches user's stored QR data
    if (user.qrCodeData !== qrData) {
      await QRScan.create({
        userId,
        scannedBy: req.user._id,
        qrData,
        scanType,
        scanResult: 'failed',
        notes: 'QR code mismatch'
      });
      
      return res.status(400).json({ error: 'Invalid or expired QR code' });
    }
    
    let scanResult = 'success';
    let message = 'QR code scanned successfully';
    
    // Handle different scan types
    if (scanType === 'approval') {
      if (user.isApproved) {
        scanResult = 'duplicate';
        message = 'User is already approved';
      } else {
        user.isApproved = true;
        user.approvedDate = new Date();
        user.approvedBy = req.user._id;
        await user.save();
        message = 'User approved successfully';
      }
    }
    
    // Record the scan
    const qrScan = await QRScan.create({
      userId,
      scannedBy: req.user._id,
      qrData,
      scanType,
      scanResult,
      notes
    });
    
    await qrScan.populate('userId', 'name email phone');
    await qrScan.populate('scannedBy', 'name email');
    
    res.json({
      message,
      scanResult,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isApproved: user.isApproved,
        approvedDate: user.approvedDate
      },
      scan: qrScan
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ error: 'Failed to process QR scan' });
  }
});

// Get user's QR code
router.get('/my-qr', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('qrCode qrCodeData isApproved');
    
    if (!user.qrCode) {
      return res.status(404).json({ error: 'QR code not generated yet' });
    }
    
    res.json({
      qrCode: user.qrCode,
      isApproved: user.isApproved
    });
  } catch (error) {
    console.error('Get QR error:', error);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// Get scan history (Admin only)
router.get('/scans', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, scanType } = req.query;
    
    let query = {};
    if (userId) query.userId = userId;
    if (scanType) query.scanType = scanType;
    
    const scans = await QRScan.find(query)
      .populate('userId', 'name email phone')
      .populate('scannedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await QRScan.countDocuments(query);
    
    res.json({
      scans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get scans error:', error);
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

// Get scan statistics (Admin only)
router.get('/scans/stats', adminAuth, async (req, res) => {
  try {
    const totalScans = await QRScan.countDocuments();
    const successfulScans = await QRScan.countDocuments({ scanResult: 'success' });
    const failedScans = await QRScan.countDocuments({ scanResult: 'failed' });
    const duplicateScans = await QRScan.countDocuments({ scanResult: 'duplicate' });
    
    // Scans by type
    const approvalScans = await QRScan.countDocuments({ scanType: 'approval' });
    const entryScans = await QRScan.countDocuments({ scanType: 'entry' });
    const verificationScans = await QRScan.countDocuments({ scanType: 'verification' });
    
    // Recent scans (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentScans = await QRScan.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });
    
    res.json({
      totalScans,
      successfulScans,
      failedScans,
      duplicateScans,
      approvalScans,
      entryScans,
      verificationScans,
      recentScans,
      successRate: totalScans > 0 ? ((successfulScans / totalScans) * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Get scan stats error:', error);
    res.status(500).json({ error: 'Failed to fetch scan statistics' });
  }
});

module.exports = router;