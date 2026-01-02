const mongoose = require('mongoose');

const qrScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qrData: {
    type: String,
    required: true
  },
  scanType: {
    type: String,
    enum: ['approval', 'entry', 'verification'],
    default: 'approval'
  },
  scanResult: {
    type: String,
    enum: ['success', 'failed', 'duplicate'],
    required: true
  },
  scanLocation: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better performance
qrScanSchema.index({ userId: 1 });
qrScanSchema.index({ scannedBy: 1 });
qrScanSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QRScan', qrScanSchema);