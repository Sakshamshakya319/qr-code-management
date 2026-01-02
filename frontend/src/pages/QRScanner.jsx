import React, { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle, XCircle, User, StopCircle, Play, Settings } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setScannerError('');
      setIsScanning(true);

      // Configuration for the scanner
      const config = {
        fps: 10, // Frames per second for scanning
        qrbox: { width: 250, height: 250 }, // QR code scanning box
        aspectRatio: 1.0, // Square aspect ratio
        disableFlip: false, // Allow flipping for better detection
        videoConstraints: {
          facingMode: "environment" // Use back camera
        }
      };

      // Success callback when QR code is detected
      const onScanSuccess = (decodedText, decodedResult) => {
        console.log('QR Code detected:', decodedText);
        
        // Stop the scanner
        stopScanner();
        
        // Process the QR code
        processQRCode(decodedText);
        
        toast.success('QR Code detected successfully!');
      };

      // Error callback (optional, for debugging)
      const onScanFailure = (error) => {
        // This is called frequently when no QR code is detected
        // We don't need to show these errors to the user
        console.debug('QR scan attempt:', error);
      };

      // Create and start the scanner
      html5QrCodeRef.current = new Html5QrcodeScanner(
        "qr-reader", // Element ID
        config,
        false // Verbose logging
      );

      html5QrCodeRef.current.render(onScanSuccess, onScanFailure);

    } catch (error) {
      console.error('Scanner start error:', error);
      setScannerError(`Failed to start scanner: ${error.message}`);
      setIsScanning(false);
      toast.error('Failed to start camera scanner');
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setIsScanning(false);
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
        notes: 'Scanned via HTML5 QR Scanner'
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("file-upload-scanner");
      
      const qrCodeMessage = await html5QrCode.scanFile(file, true);
      console.log('QR Code from file:', qrCodeMessage);
      
      processQRCode(qrCodeMessage);
      toast.success('QR Code found in image!');
      
    } catch (error) {
      console.error('File scan error:', error);
      toast.error('No QR code found in the uploaded image');
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
          
          {!isScanning ? (
            <div className="text-center">
              <Camera size={64} className="text-muted mb-3" />
              {scannerError ? (
                <div className="mb-3">
                  <p className="text-danger mb-2" style={{ fontSize: '14px' }}>
                    {scannerError}
                  </p>
                  <button onClick={startScanner} className="btn btn-primary">
                    <Camera size={16} />
                    Try Again
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-muted mb-3">
                    Click to start camera scanning
                  </p>
                  <button onClick={startScanner} className="btn btn-primary">
                    <Play size={16} />
                    Start Camera Scanner
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-3 text-center">
                <p className="text-success mb-2">
                  📱 Point your camera at the QR code
                </p>
                <button onClick={stopScanner} className="btn btn-danger">
                  <StopCircle size={16} />
                  Stop Scanner
                </button>
              </div>
              
              {/* QR Scanner Container */}
              <div 
                id="qr-reader" 
                style={{ 
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}
              ></div>
            </div>
          )}

          {/* File Upload Scanner */}
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
            <small className="text-muted">
              Upload an image containing a QR code to scan it
            </small>
            
            {/* Hidden element for file scanning */}
            <div id="file-upload-scanner" style={{ display: 'none' }}></div>
          </div>

          {/* Camera Tips */}
          <div className="mt-4">
            <h4 className="mb-2">
              <Settings size={16} style={{ marginRight: '8px' }} />
              Scanning Tips
            </h4>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <ul style={{ marginLeft: '16px' }}>
                <li>Hold your device steady</li>
                <li>Ensure good lighting</li>
                <li>Keep QR code within the scanning box</li>
                <li>Allow camera permissions when prompted</li>
                <li>Use back camera for better results</li>
              </ul>
            </div>
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

          {/* Quick Test */}
          <div className="mt-4">
            <h4 className="mb-2">Quick Test</h4>
            <p className="text-muted mb-2" style={{ fontSize: '12px' }}>
              Need a QR code to test? Visit the QR Test page to generate one.
            </p>
            <a href="/qr-test" className="btn btn-secondary">
              Generate Test QR Code
            </a>
          </div>
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
              
              <div className="mt-3">
                <button 
                  onClick={() => setScanResult(null)}
                  className="btn btn-secondary"
                >
                  Clear Result
                </button>
                <button 
                  onClick={() => {
                    setScanResult(null);
                    if (!isScanning) {
                      startScanner();
                    }
                  }}
                  className="btn btn-primary ml-2"
                  disabled={isScanning}
                >
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;