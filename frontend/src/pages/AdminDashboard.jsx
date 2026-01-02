import React, { useState, useEffect } from 'react';
import api from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, QrCode, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [scanStats, setScanStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [userStatsRes, scanStatsRes] = await Promise.all([
        api.get('/users/stats/overview'),
        api.get('/qr/scans/stats')
      ]);
      
      setStats(userStatsRes.data);
      setScanStats(scanStatsRes.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  return (
    <div className="container">
      <div className="mb-4">
        <h1>Admin Dashboard</h1>
        <p className="text-muted">Overview of system statistics and recent activity</p>
      </div>

      {/* User Statistics */}
      <div className="mb-4">
        <h2 className="mb-3">User Statistics</h2>
        <div className="grid grid-3">
          <div className="card text-center">
            <Users size={32} className="text-primary mb-2" />
            <h3>{stats?.totalUsers || 0}</h3>
            <p className="text-muted">Total Users</p>
          </div>
          
          <div className="card text-center">
            <CheckCircle size={32} className="text-success mb-2" />
            <h3>{stats?.approvedUsers || 0}</h3>
            <p className="text-muted">Approved Users</p>
          </div>
          
          <div className="card text-center">
            <Clock size={32} className="text-warning mb-2" />
            <h3>{stats?.pendingUsers || 0}</h3>
            <p className="text-muted">Pending Approval</p>
          </div>
        </div>
      </div>

      {/* QR Code Statistics */}
      <div className="mb-4">
        <h2 className="mb-3">QR Code Statistics</h2>
        <div className="grid grid-3">
          <div className="card text-center">
            <QrCode size={32} className="text-primary mb-2" />
            <h3>{scanStats?.totalScans || 0}</h3>
            <p className="text-muted">Total Scans</p>
          </div>
          
          <div className="card text-center">
            <CheckCircle size={32} className="text-success mb-2" />
            <h3>{scanStats?.successfulScans || 0}</h3>
            <p className="text-muted">Successful Scans</p>
          </div>
          
          <div className="card text-center">
            <TrendingUp size={32} className="text-info mb-2" />
            <h3>{scanStats?.successRate || 0}%</h3>
            <p className="text-muted">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="mb-3">Registration Overview</h3>
          <div className="mb-2">
            <strong>Approval Rate:</strong> {stats?.approvalRate || 0}%
          </div>
          <div className="mb-2">
            <strong>Recent Registrations (7 days):</strong> {stats?.recentRegistrations || 0}
          </div>
          <div className="mb-2">
            <strong>Recent Scans (24 hours):</strong> {scanStats?.recentScans || 0}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3">Scan Breakdown</h3>
          <div className="mb-2">
            <strong>Approval Scans:</strong> {scanStats?.approvalScans || 0}
          </div>
          <div className="mb-2">
            <strong>Entry Scans:</strong> {scanStats?.entryScans || 0}
          </div>
          <div className="mb-2">
            <strong>Verification Scans:</strong> {scanStats?.verificationScans || 0}
          </div>
          <div className="mb-2">
            <strong>Failed Scans:</strong> {scanStats?.failedScans || 0}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-4">
        <h3 className="mb-3">Quick Actions</h3>
        <div className="grid grid-3">
          <a href="/users" className="btn btn-primary">
            <Users size={16} />
            Manage Users
          </a>
          <a href="/scanner" className="btn btn-success">
            <QrCode size={16} />
            Open QR Scanner
          </a>
          <button 
            onClick={fetchStats}
            className="btn btn-secondary"
          >
            <TrendingUp size={16} />
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;