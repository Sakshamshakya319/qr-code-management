import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle, XCircle, User } from 'lucide-react';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // In a real implementation, you would use a QR code library here
    // For demo purposes, we'll simulate QR detection
    toast.info('QR detection would happen here. Use manual input for now.');
  };

  const processQRCode = async (qrData, scanType = 'approval') => {
    if (!qrData.trim()) {
      toast.error('Please provide QR code data');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/qr/scan', {
        qrData: qrData.trim(),
        scanType,
        notes: 'Scanned via admin panel'
      });

      setScanResult(response.data);
      toast.success(response.data.message);
      setManualInput('');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to process QR code';
      toast.error(message);
      setScanResult({
        scanResult: 'failed',
        message,
        user: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processQRCode(manualInput);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real implementation, you would process the image file
      // to extract QR code data using a library like jsQR
      toast.info('File upload QR processing would be implemented here');
    }
  };

  return (
    <div className="container">
      <div className="mb-4">
        <h1>QR Code Scanner</h1>
        <p className="text-muted">Scan QR codes to approve users or verify entries</p>
      </div>

      <div className="grid grid-2">
        {/* Camera Scanner */}
        <div className="card">
          <h3 className="mb-3">
            <Camera size={20} style={{ marginRight: '8px' }} />
            Camera Scanner
          </h3>
          
          <div className="qr-scanner">
            {scanning ? (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    border: '2px solid #007bff',
                    borderRadius: '8px'
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="mt-3">
                  <button onClick={captureFrame} className="btn btn-primary mr-2">
                    Capture & Scan
                  </button>
                  <button onClick={stopCamera} className="btn btn-secondary">
                    Stop Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Camera size={64} className="text-muted mb-3" />
                <p className="text-muted mb-3">Click to start camera scanning</p>
                <button onClick={startCamera} className="btn btn-primary">
                  Start Camera
                </button>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="mt-4">
            <h4 className="mb-2">
              <Upload size={16} style={{ marginRight: '8px' }} />
              Upload QR Image
            </h4>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="form-input"
            />
          </div>
        </div>

        {/* Manual Input */}
        <div className="card">
          <h3 className="mb-3">Manual QR Input</h3>
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label className="form-label">QR Code Data</label>
              <textarea
                className="form-input"
                rows="4"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste QR code data here..."
              />
            </div>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || !manualInput.trim()}
            >
              {loading ? 'Processing...' : 'Process QR Code'}
            </button>
          </form>
        </div>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div className="card mt-4">
          <h3 className="mb-3">Scan Result</h3>
          <div className="grid grid-2">
            <div>
              <div className="mb-3">
                {scanResult.scanResult === 'success' ? (
                  <div className="text-success">
                    <CheckCircle size={24} style={{ marginRight: '8px' }} />
                    {scanResult.message}
                  </div>
                ) : (
                  <div className="text-danger">
                    <XCircle size={24} style={{ marginRight: '8px' }} />
                    {scanResult.message}
                  </div>
                )}
              </div>
              
              {scanResult.user && (
                <div>
                  <h4 className="mb-2">
                    <User size={16} style={{ marginRight: '8px' }} />
                    User Information
                  </h4>
                  <div className="mb-1">
                    <strong>Name:</strong> {scanResult.user.name}
                  </div>
                  <div className="mb-1">
                    <strong>Email:</strong> {scanResult.user.email}
                  </div>
                  <div className="mb-1">
                    <strong>Phone:</strong> {scanResult.user.phone}
                  </div>
                  <div className="mb-1">
                    <strong>Status:</strong> 
                    <span className={`badge ${scanResult.user.isApproved ? 'badge-success' : 'badge-warning'} ml-2`}>
                      {scanResult.user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  {scanResult.user.approvedDate && (
                    <div className="mb-1">
                      <strong>Approved:</strong> {new Date(scanResult.user.approvedDate).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              {scanResult.scan && (
                <div>
                  <h4 className="mb-2">Scan Details</h4>
                  <div className="mb-1">
                    <strong>Scan Type:</strong> {scanResult.scan.scanType}
                  </div>
                  <div className="mb-1">
                    <strong>Result:</strong> 
                    <span className={`badge ${
                      scanResult.scan.scanResult === 'success' ? 'badge-success' : 
                      scanResult.scan.scanResult === 'failed' ? 'badge-danger' : 'badge-warning'
                    } ml-2`}>
                      {scanResult.scan.scanResult}
                    </span>
                  </div>
                  <div className="mb-1">
                    <strong>Timestamp:</strong> {new Date(scanResult.scan.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;