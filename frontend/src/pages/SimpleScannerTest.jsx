import { useState } from 'react';
import SimpleQRScanner from '../components/SimpleQRScanner';
import toast from 'react-hot-toast';
import api from '../config/api';

const SimpleScannerTest = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const handleScanSuccess = async (qrData) => {
    console.log('Scanned QR:', qrData);
    setIsActive(false); // Stop scanner
    
    try {
      // Try to process with backend
      const response = await api.post('/qr/scan', {
        qrData: qrData.trim(),
        scanType: 'approval',
        notes: 'Scanned via Simple Scanner'
      });

      setScanResult(response.data);
      toast.success('QR Code processed successfully!');
      
    } catch (error) {
      console.error('QR processing error:', error);
      const message = error.response?.data?.error || 'Failed to process QR code';
      toast.error(message);
      
      // Show raw data even if processing fails
      setScanResult({
        scanResult: 'raw',
        message: 'Raw QR data (processing failed)',
        rawData: qrData
      });
    }
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
    toast.error(`Scanner error: ${error.message}`);
  };

  const restartScanner = () => {
    setScanResult(null);
    setIsActive(true);
  };

  return (
    <div className="container">
      <div className="mb-4">
        <h1>Simple QR Scanner Test</h1>
        <p className="text-muted">Testing the basic Html5Qrcode implementation</p>
      </div>

      <div className="card">
        <h3 className="mb-3">Camera Scanner</h3>
        
        {isActive ? (
          <div>
            <p className="text-success mb-3">📱 Point your camera at a QR code</p>
            <SimpleQRScanner 
              onScanSuccess={handleScanSuccess}
              onError={handleError}
            />
            <div className="mt-3">
              <button 
                onClick={() => setIsActive(false)}
                className="btn btn-danger"
              >
                Stop Scanner
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted mb-3">Scanner stopped</p>
            <button 
              onClick={restartScanner}
              className="btn btn-primary"
            >
              Start Scanner
            </button>
          </div>
        )}
      </div>

      {scanResult && (
        <div className="card mt-4">
          <h3 className="mb-3">Scan Result</h3>
          
          {scanResult.scanResult === 'raw' ? (
            <div>
              <p className="text-warning mb-2">{scanResult.message}</p>
              <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <strong>Raw QR Data:</strong>
                <pre style={{ fontSize: '12px', marginTop: '8px' }}>
                  {scanResult.rawData}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <p className={scanResult.scanResult === 'success' ? 'text-success' : 'text-danger'}>
                {scanResult.message}
              </p>
              
              {scanResult.user && (
                <div className="mt-3">
                  <h4>User Information</h4>
                  <div><strong>Name:</strong> {scanResult.user.name}</div>
                  <div><strong>Email:</strong> {scanResult.user.email}</div>
                  <div><strong>Status:</strong> 
                    <span className={`badge ${scanResult.user.isApproved ? 'badge-success' : 'badge-warning'} ml-2`}>
                      {scanResult.user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-3">
            <button 
              onClick={restartScanner}
              className="btn btn-primary"
            >
              Scan Another
            </button>
            <a href="/scanner" className="btn btn-secondary ml-2">
              Back to Main Scanner
            </a>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <h3 className="mb-3">Debug Information</h3>
        <div style={{ fontSize: '12px' }}>
          <div><strong>Scanner Active:</strong> {isActive ? 'Yes' : 'No'}</div>
          <div><strong>Browser:</strong> {navigator.userAgent}</div>
          <div><strong>HTTPS:</strong> {window.location.protocol === 'https:' ? 'Yes' : 'No'}</div>
          <div><strong>Media Devices:</strong> {navigator.mediaDevices ? 'Supported' : 'Not Supported'}</div>
          <div><strong>Current URL:</strong> {window.location.href}</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleScannerTest;