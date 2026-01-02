import React, { useState } from 'react';
import { QrCode, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const QRTest = () => {
  const [testData, setTestData] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateTestQR = () => {
    if (!testData.trim()) {
      toast.error('Please enter some test data');
      return;
    }

    // Create a test QR code data structure similar to what the backend generates
    const qrData = {
      userId: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      eventId: "test-event",
      generatedAt: new Date().toISOString(),
      generatedBy: "admin",
      testData: testData
    };

    const qrDataString = JSON.stringify(qrData);
    
    // Use a QR code API service to generate the QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataString)}`;
    setQrCodeUrl(qrApiUrl);
    
    toast.success('Test QR code generated!');
  };

  const copyToClipboard = () => {
    if (!testData) return;
    
    const qrData = {
      userId: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      eventId: "test-event",
      generatedAt: new Date().toISOString(),
      generatedBy: "admin",
      testData: testData
    };

    navigator.clipboard.writeText(JSON.stringify(qrData));
    toast.success('QR data copied to clipboard!');
  };

  return (
    <div className="container">
      <div className="mb-4">
        <h1>QR Code Test Generator</h1>
        <p className="text-muted">Generate test QR codes for scanning</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="mb-3">
            <QrCode size={20} style={{ marginRight: '8px' }} />
            Generate Test QR
          </h3>
          
          <div className="form-group">
            <label className="form-label">Test Data</label>
            <input
              type="text"
              className="form-input"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              placeholder="Enter test data (e.g., user name, event info)"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={generateTestQR}
              className="btn btn-primary"
              disabled={!testData.trim()}
            >
              <QrCode size={16} />
              Generate QR Code
            </button>
            
            <button 
              onClick={copyToClipboard}
              className="btn btn-secondary"
              disabled={!testData.trim()}
            >
              <Copy size={16} />
              Copy Data
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3">Generated QR Code</h3>
          
          {qrCodeUrl ? (
            <div className="text-center">
              <img 
                src={qrCodeUrl} 
                alt="Generated QR Code"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <p className="text-muted mt-2">
                Scan this QR code with the scanner to test
              </p>
              <a 
                href="/scanner" 
                className="btn btn-success mt-2"
              >
                Go to Scanner
              </a>
            </div>
          ) : (
            <div className="text-center text-muted">
              <QrCode size={64} className="mb-2" />
              <p>Generate a QR code to see it here</p>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="mb-3">Quick Test QR Codes</h3>
        <p className="text-muted mb-3">Click any button to generate a quick test QR code:</p>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              setTestData('Test User Registration');
              setTimeout(() => generateTestQR(), 100);
            }}
            className="btn btn-secondary"
          >
            User Registration
          </button>
          
          <button 
            onClick={() => {
              setTestData('Event Entry Pass');
              setTimeout(() => generateTestQR(), 100);
            }}
            className="btn btn-secondary"
          >
            Event Entry
          </button>
          
          <button 
            onClick={() => {
              setTestData('VIP Access Code');
              setTimeout(() => generateTestQR(), 100);
            }}
            className="btn btn-secondary"
          >
            VIP Access
          </button>
          
          <button 
            onClick={() => {
              setTestData('Sample QR Data for Testing');
              setTimeout(() => generateTestQR(), 100);
            }}
            className="btn btn-secondary"
          >
            Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRTest;