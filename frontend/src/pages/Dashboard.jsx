import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { User, Calendar, CheckCircle, Clock, QrCode, Download, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      fetchMyQR();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchMyQR = async () => {
    try {
      const response = await api.get('/qr/my-qr');
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMyQR = async () => {
    try {
      setGeneratingQR(true);
      const response = await api.post('/qr/generate-my-qr', {
        eventId: 'user-dashboard-generated'
      });
      
      setQrCode(response.data.qrCode);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      const message = error.response?.data?.error || 'Failed to generate QR code';
      toast.error(message);
    } finally {
      setGeneratingQR(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${user?.name || 'user'}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="container">
      <div className="mb-4">
        <h1>Welcome back, {user?.name}!</h1>
        <p className="text-muted">
          {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
        </p>
      </div>

      <div className="grid grid-2">
        {/* User Info Card */}
        <div className="card">
          <h3 className="mb-3">
            <User size={20} style={{ marginRight: '8px' }} />
            Profile Information
          </h3>
          <div className="mb-2">
            <strong>Name:</strong> {user?.name}
          </div>
          <div className="mb-2">
            <strong>Email:</strong> {user?.email}
          </div>
          <div className="mb-2">
            <strong>Phone:</strong> {user?.phone}
          </div>
          <div className="mb-2">
            <strong>Role:</strong> 
            <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-warning'} ml-2`}>
              {user?.role}
            </span>
          </div>
          <div className="mb-2">
            <strong>Status:</strong> 
            <span className={`badge ${user?.isApproved ? 'badge-success' : 'badge-warning'} ml-2`}>
              {user?.isApproved ? 'Approved' : 'Pending Approval'}
            </span>
          </div>
        </div>

        {/* Registration Status Card */}
        <div className="card">
          <h3 className="mb-3">
            <Calendar size={20} style={{ marginRight: '8px' }} />
            Registration Status
          </h3>
          <div className="text-center">
            {user?.isApproved ? (
              <div>
                <CheckCircle size={48} className="text-success mb-2" />
                <h4 className="text-success">Approved!</h4>
                <p className="text-muted">
                  Your registration has been approved. You can now participate in events.
                </p>
                {user?.approvedDate && (
                  <small className="text-muted">
                    Approved on: {new Date(user.approvedDate).toLocaleDateString()}
                  </small>
                )}
              </div>
            ) : (
              <div>
                <Clock size={48} className="text-warning mb-2" />
                <h4 className="text-warning">Pending Approval</h4>
                <p className="text-muted">
                  Your registration is pending admin approval. Please wait for confirmation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Section for Users */}
      {!isAdmin && (
        <div className="card mt-4">
          <h3 className="mb-3">
            <QrCode size={20} style={{ marginRight: '8px' }} />
            Your QR Code
          </h3>
          
          {qrCode ? (
            <div className="qr-code-display">
              <div className="text-center mb-3">
                <img 
                  src={qrCode} 
                  alt="Your QR Code" 
                  style={{ 
                    maxWidth: '256px', 
                    width: '100%', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
              
              <div className="text-center">
                <p className="text-muted mb-3">
                  Show this QR code to admin for approval or event entry
                </p>
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={downloadQR}
                    className="btn btn-secondary"
                  >
                    <Download size={16} />
                    Download QR Code
                  </button>
                  
                  <button 
                    onClick={generateMyQR}
                    className="btn btn-primary"
                    disabled={generatingQR}
                  >
                    <RefreshCw size={16} />
                    {generatingQR ? 'Regenerating...' : 'Regenerate QR Code'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <QrCode size={64} className="text-muted mb-3" />
              <p className="text-muted mb-3">
                Generate your personal QR code for event registration and entry
              </p>
              
              <button 
                onClick={generateMyQR}
                className="btn btn-primary"
                disabled={generatingQR}
              >
                <QrCode size={16} />
                {generatingQR ? 'Generating...' : 'Generate My QR Code'}
              </button>
              
              <div className="mt-3">
                <small className="text-muted">
                  Your QR code will contain your registration information for quick scanning
                </small>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Quick Actions */}
      {isAdmin && (
        <div className="card mt-4">
          <h3 className="mb-3">Quick Actions</h3>
          <div className="grid grid-3">
            <a href="/admin" className="btn btn-primary">
              View Admin Panel
            </a>
            <a href="/scanner" className="btn btn-success">
              Open QR Scanner
            </a>
            <a href="/users" className="btn btn-secondary">
              Manage Users
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;