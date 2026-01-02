import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, AlertCircle, Users, RefreshCw } from 'lucide-react';

const AdminSetup = ({ onSetupComplete }) => {
  const [setupStatus, setSetupStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking admin status...');
      
      const response = await api.get('/setup/check-admin');
      console.log('Admin status response:', response.data);
      
      setSetupStatus(response.data);
      
      if (response.data.hasAdmin) {
        console.log('Admin exists, completing setup');
        onSetupComplete?.();
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
      toast.error('Failed to check system status');
      // Set default state if check fails
      setSetupStatus({ hasAdmin: false, needsSetup: true, adminCount: 0, totalUsers: 0 });
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    setCreating(true);
    try {
      console.log('Creating admin...');
      const response = await api.post('/setup/create-admin');
      console.log('Admin creation response:', response.data);
      
      if (response.data.success) {
        toast.success('Admin account created successfully!');
        setSetupStatus({ ...setupStatus, hasAdmin: true });
        onSetupComplete?.();
      } else {
        toast.error('Failed to create admin account');
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      const message = error.response?.data?.error || 'Failed to create admin account';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const fetchDebugInfo = async () => {
    try {
      const response = await api.get('/setup/users');
      setDebugInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p className="mt-2 text-muted">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (setupStatus?.hasAdmin) {
    return (
      <div className="container">
        <div className="card text-center" style={{ maxWidth: '500px', margin: '80px auto' }}>
          <CheckCircle size={64} className="text-success mb-3" />
          <h2 className="text-success mb-2">System Ready!</h2>
          <p className="text-muted mb-3">
            Admin account is configured. You can now log in to access the system.
          </p>
          
          {setupStatus.adminUser && (
            <div className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <h4 className="mb-2">Admin Account</h4>
              <div><strong>Name:</strong> {setupStatus.adminUser.name}</div>
              <div><strong>Email:</strong> {setupStatus.adminUser.email}</div>
              <div><strong>Role:</strong> {setupStatus.adminUser.role}</div>
            </div>
          )}
          
          <div className="mb-3">
            <strong>Total Users:</strong> {setupStatus.totalUsers}
          </div>
          <div className="mb-3">
            <strong>Admin Accounts:</strong> {setupStatus.adminCount}
          </div>
          
          <a href="/login" className="btn btn-primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card text-center" style={{ maxWidth: '600px', margin: '80px auto' }}>
        <AlertCircle size={64} className="text-warning mb-3" />
        <h2 className="text-warning mb-2">System Setup Required</h2>
        <p className="text-muted mb-4">
          No admin account found. Click the button below to create the admin account.
        </p>
        
        <div className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px', textAlign: 'left' }}>
          <h4 className="mb-2">
            <Shield size={20} style={{ marginRight: '8px' }} />
            Admin Credentials
          </h4>
          <div className="mb-1">
            <strong>Email:</strong> sakshamshakya94@gmail.com
          </div>
          <div className="mb-1">
            <strong>Name:</strong> Saksham Shakya
          </div>
          <div className="mb-1">
            <strong>Role:</strong> Administrator
          </div>
          <div className="mb-1">
            <strong>Password:</strong> nrt*gam1apt0AZX-gdx
          </div>
        </div>

        <div className="mb-3" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={createAdmin}
            disabled={creating}
            className="btn btn-primary"
          >
            <Shield size={16} />
            {creating ? 'Creating Admin...' : 'Create Admin Account'}
          </button>
          
          <button
            onClick={checkAdminStatus}
            disabled={loading}
            className="btn btn-secondary"
          >
            <RefreshCw size={16} />
            Refresh Status
          </button>
        </div>

        {setupStatus && (
          <div className="mb-3 p-2" style={{ backgroundColor: '#e9ecef', borderRadius: '4px', fontSize: '12px' }}>
            <strong>Status:</strong> Admin Count: {setupStatus.adminCount}, Total Users: {setupStatus.totalUsers}
          </div>
        )}

        <div className="mb-3">
          <button
            onClick={fetchDebugInfo}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            <Users size={12} />
            Show Debug Info
          </button>
        </div>

        {debugInfo && (
          <div className="mt-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px', textAlign: 'left', fontSize: '12px' }}>
            <h5>Debug Information</h5>
            <div><strong>Total Users in DB:</strong> {debugInfo.count}</div>
            {debugInfo.users.map((user, index) => (
              <div key={index} style={{ marginTop: '4px', padding: '4px', backgroundColor: 'white', borderRadius: '2px' }}>
                <strong>{user.name}</strong> ({user.email}) - Role: {user.role} - Approved: {user.isApproved ? 'Yes' : 'No'}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            This is a one-time setup. The admin account will be created with the credentials shown above.
          </small>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;