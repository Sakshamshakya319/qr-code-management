import { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle, XCircle, User, StopCircle, Play, Settings, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [cameraPermission, setCameraPermission] = useState('unknown');
  
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    checkCameraPermission();
    
    // Wait for DOM to be ready, then create Html5Qrcode instance ONCE
    const initializeScanner = () => {
      const element = document.getElementById('qr-reader');
      if (element) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
        console.log('Html5Qrcode instance created successfully');
      } else {
        // Retry if element not found
        setTimeout(initializeScanner, 100);
      }
    };
    
    initializeScanner();
    
    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {
          console.log('Scanner was not running');
        });
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('not-supported');
        setScannerError('Camera not supported on this device/browser');
        return;
      }

      // Check if we can access camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        setCameraPermission('denied');
        setScannerError('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        setCameraPermission('no-camera');
        setScannerError('No camera found on this device.');
      } else {
        setCameraPermission('error');
        setScannerError(`Camera error: ${error.message}`);
      }
    }
  };

  const startScanner = async () => {
    try {
      setScannerError('');
      
      // Ensure Html5Qrcode instance exists
      if (!html5QrCodeRef.current) {
        throw new Error('Scanner not initialized');
      }

      setIsScanning(true);

      // Success callback
      const onScanSuccess = (decodedText) => {
        console.log('QR Code detected:', decodedText);
        
        // Stop the scanner immediately
        stopScanner();
        
        // Process the QR code
        processQRCode(decodedText);
        
        toast.success('QR Code detected!');
      };

      // Error callback (for debugging only, don't show to user)
      const onScanFailure = (error) => {
        // These errors happen frequently during scanning, so we don't show them
        console.debug('QR scan attempt:', error);
      };

      // Start the camera (Html5Qrcode instance already created in useEffect)
      await html5QrCodeRef.current.start(
        { facingMode: "environment" }, // Back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanFailure
      );

      console.log('Scanner started successfully');

    } catch (error) {
      console.error('Scanner start error:', error);
      setScannerError(`Failed to start scanner: ${error.message || 'Unknown error'}`);
      setIsScanning(false);
      toast.error('Failed to start camera scanner');
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && isScanning) {
        console.log('Stopping scanner...');
        await html5QrCodeRef.current.stop();
        console.log('Scanner stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const processQRCode = async (qrData, scanType = 'approval') => {
    if (!qrData || !qrData.trim()) {
      toast.error('Invalid QR code data');
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
      console.error('QR processing error:', error);
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
    if (manualInput.trim()) {
      processQRCode(manualInput);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      toast.loading('Scanning image...');
      
      // Create a temporary Html5Qrcode instance for file scanning
      const html5QrCode = new Html5Qrcode("file-upload-scanner");
      
      const qrCodeMessage = await html5QrCode.scanFile(file, true);
      console.log('QR Code from file:', qrCodeMessage);
      
      processQRCode(qrCodeMessage);
      toast.dismiss();
      toast.success('QR Code found in image!');
      
    } catch (error) {
      console.error('File scan error:', error);
      toast.dismiss();
      toast.error('No QR code found in the uploaded image');
    } finally {
      setLoading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setScannerError('');
      toast.success('Camera permission granted!');
    } catch (error) {
      setCameraPermission('denied');
      setScannerError('Camera permission denied. Please allow camera access in your browser settings.');
      toast.error('Camera permission denied');
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
          
          {/* Camera Permission Status */}
          {cameraPermission !== 'granted' && (
            <div className="mb-3 p-3" style={{ 
              backgroundColor: cameraPermission === 'denied' ? '#fff3cd' : '#f8d7da', 
              borderRadius: '6px' 
            }}>
              <div className="mb-2">
                <AlertCircle size={16} className="text-warning" style={{ marginRight: '8px' }} />
                <strong>Camera Status:</strong> {
                  cameraPermission === 'denied' ? 'Permission Denied' :
                  cameraPermission === 'no-camera' ? 'No Camera Found' :
                  cameraPermission === 'not-supported' ? 'Not Supported' :
                  'Checking...'
                }
              </div>
              {cameraPermission === 'denied' && (
                <button onClick={requestCameraPermission} className="btn btn-warning">
                  Request Camera Permission
                </button>
              )}
            </div>
          )}
          
          {/* Scanner Controls */}
          {cameraPermission === 'granted' && (
            <div className="mb-3 text-center">
              {!isScanning ? (
                <div>
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
                        Ready to scan QR codes
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
                  <p className="text-success mb-2">
                    📱 Point your camera at the QR code
                  </p>
                  <button onClick={stopScanner} className="btn btn-danger">
                    <StopCircle size={16} />
                    Stop Scanner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* QR Scanner Container - ALWAYS RENDERED */}
          <div 
            id="qr-reader" 
            style={{ 
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
              minHeight: '300px',
              display: isScanning ? 'block' : 'none'
            }}
          ></div>

          {cameraPermission !== 'granted' && (
            <div className="text-center">
              <AlertCircle size={64} className="text-muted mb-3" />
              <p className="text-muted">Camera not available</p>
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

          {/* Browser Compatibility & Troubleshooting */}
          <div className="mt-4">
            <h4 className="mb-2">
              <Settings size={16} style={{ marginRight: '8px' }} />
              Troubleshooting
            </h4>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <p><strong>Camera not working?</strong></p>
              <ul style={{ marginLeft: '16px', marginBottom: '12px' }}>
                <li>Ensure you're using HTTPS (required for camera access)</li>
                <li>Allow camera permissions when prompted</li>
                <li>Close other apps/tabs using the camera</li>
                <li>Try refreshing the page</li>
                <li>Use Chrome, Firefox, or Safari for best results</li>
              </ul>
              
              <p><strong>Still having issues?</strong></p>
              <ul style={{ marginLeft: '16px' }}>
                <li>Try the file upload option above</li>
                <li>Use manual input as a backup</li>
                <li>Check browser console for detailed errors</li>
                <li>Ensure good lighting conditions</li>
              </ul>
              
              <div className="mt-2 p-2" style={{ backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                <strong>Debug Info:</strong>
                <div>Camera Permission: {cameraPermission}</div>
                <div>Scanner Active: {isScanning ? 'Yes' : 'No'}</div>
                <div>Scanner Instance: {html5QrCodeRef.current ? 'Created' : 'Not Created'}</div>
                <div>QR Reader Element: {document.getElementById('qr-reader') ? 'Found' : 'Missing'}</div>
                <div>Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                              navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                              navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}</div>
                <div>HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No'}</div>
                <div>Media Devices: {navigator.mediaDevices ? 'Supported' : 'Not Supported'}</div>
              </div>
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
              Need a QR code to test? Generate one below:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  const testData = JSON.stringify({
                    userId: "test-user-123",
                    email: "test@example.com",
                    name: "Test User",
                    eventId: "test-event",
                    generatedAt: new Date().toISOString()
                  });
                  setManualInput(testData);
                }}
                className="btn btn-secondary"
              >
                Load Test QR Data
              </button>
              <a href="/qr-test" className="btn btn-secondary">
                QR Test Page
              </a>
              <a href="/simple-scanner" className="btn btn-primary">
                Simple Scanner Test
              </a>
            </div>
            
            {/* Simple QR Code for Testing */}
            <div className="mt-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <p className="mb-2" style={{ fontSize: '12px' }}><strong>Test QR Code:</strong></p>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Hello%20World%20QR%20Test" 
                alt="Test QR Code"
                style={{ border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <p className="mt-2" style={{ fontSize: '10px', color: '#666' }}>
                Scan this test QR code to verify scanner functionality
              </p>
            </div>
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
                    if (!isScanning && cameraPermission === 'granted') {
                      startScanner();
                    }
                  }}
                  className="btn btn-primary ml-2"
                  disabled={isScanning || cameraPermission !== 'granted'}
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