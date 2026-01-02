import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle, XCircle, User, StopCircle, Play } from 'lucide-react';
import jsQR from 'jsqr';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    getCameraDevices();
    return () => {
      stopCamera();
    };
  }, []);

  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Prefer back camera
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      if (backCamera) {
        setSelectedDevice(backCamera.deviceId);
      } else if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting camera devices:', error);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Camera constraints for better QR scanning
      const constraints = {
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          aspectRatio: { ideal: 16/9 }
        }
      };

      // If specific device selected, use it
      if (selectedDevice) {
        constraints.video.deviceId = { exact: selectedDevice };
        delete constraints.video.facingMode; // Remove facingMode when using deviceId
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setScanning(true);
          startQRDetection();
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += 'Please check camera permissions and try again.';
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setScanning(false);
    setCameraError('');
  };

  const startQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      scanForQR();
    }, 500); // Scan every 500ms
  };

  const scanForQR = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        // QR code detected!
        console.log('QR Code detected:', code.data);
        stopCamera();
        processQRCode(code.data);
        
        // Visual feedback
        toast.success('QR Code detected!');
      }
    }
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
        notes: 'Scanned via camera'
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            processQRCode(code.data);
            toast.success('QR Code found in image!');
          } else {
            toast.error('No QR code found in the image');
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
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
          
          {/* Camera Device Selection */}
          {devices.length > 1 && (
            <div className="form-group">
              <label className="form-label">Select Camera</label>
              <select 
                className="form-input"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                disabled={scanning}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="qr-scanner">
            {scanning ? (
              <div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: 'auto',
                      border: '2px solid #007bff',
                      borderRadius: '8px'
                    }}
                  />
                  {/* Scanning overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '2px solid #00ff00',
                    borderRadius: '8px',
                    pointerEvents: 'none'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      width: '20px',
                      height: '20px',
                      borderTop: '4px solid #00ff00',
                      borderLeft: '4px solid #00ff00'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '20px',
                      height: '20px',
                      borderTop: '4px solid #00ff00',
                      borderRight: '4px solid #00ff00'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '-2px',
                      width: '20px',
                      height: '20px',
                      borderBottom: '4px solid #00ff00',
                      borderLeft: '4px solid #00ff00'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '20px',
                      height: '20px',
                      borderBottom: '4px solid #00ff00',
                      borderRight: '4px solid #00ff00'
                    }}></div>
                  </div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="mt-3 text-center">
                  <p className="text-success mb-2">📱 Point camera at QR code</p>
                  <button onClick={stopCamera} className="btn btn-danger">
                    <StopCircle size={16} />
                    Stop Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Camera size={64} className="text-muted mb-3" />
                {cameraError ? (
                  <div className="mb-3">
                    <p className="text-danger mb-2">{cameraError}</p>
                    <button onClick={startCamera} className="btn btn-primary">
                      <Camera size={16} />
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted mb-3">Click to start camera scanning</p>
                    <button onClick={startCamera} className="btn btn-primary">
                      <Play size={16} />
                      Start Camera
                    </button>
                  </div>
                )}
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
            <small className="text-muted">Upload an image containing a QR code</small>
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
              
              <div className="mt-3">
                <button 
                  onClick={() => setScanResult(null)}
                  className="btn btn-secondary"
                >
                  Clear Result
                </button>
                <button 
                  onClick={startCamera}
                  className="btn btn-primary ml-2"
                  disabled={scanning}
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