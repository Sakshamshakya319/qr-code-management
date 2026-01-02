import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Calendar, Edit, Save, X } from 'lucide-react';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.phone.match(/^\d{10}$/)) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/users/${user._id}`, formData);
      updateUser(response.data.user);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="mb-4">
        <h1>
          <User size={24} style={{ marginRight: '8px' }} />
          My Profile
        </h1>
        <p className="text-muted">View and manage your profile information</p>
      </div>

      <div className="grid grid-2">
        {/* Profile Information */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Profile Information</h3>
            {!editing && (
              <button onClick={handleEdit} className="btn btn-primary">
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div>
              <div className="form-group">
                <label className="form-label">
                  <User size={16} style={{ marginRight: '8px' }} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} style={{ marginRight: '8px' }} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  className="btn btn-success"
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <div className="form-label">
                  <User size={16} style={{ marginRight: '8px' }} />
                  Full Name
                </div>
                <div>{user?.name}</div>
              </div>

              <div className="mb-3">
                <div className="form-label">
                  <Mail size={16} style={{ marginRight: '8px' }} />
                  Email Address
                </div>
                <div>{user?.email}</div>
              </div>

              <div className="mb-3">
                <div className="form-label">
                  <Phone size={16} style={{ marginRight: '8px' }} />
                  Phone Number
                </div>
                <div>{user?.phone}</div>
              </div>

              <div className="mb-3">
                <div className="form-label">Role</div>
                <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-warning'}`}>
                  {user?.role}
                </span>
              </div>

              <div className="mb-3">
                <div className="form-label">
                  <Calendar size={16} style={{ marginRight: '8px' }} />
                  Registration Date
                </div>
                <div>{new Date(user?.registrationDate || user?.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Account Status */}
        <div className="card">
          <h3 className="mb-3">Account Status</h3>
          
          <div className="mb-3">
            <div className="form-label">Approval Status</div>
            <span className={`badge ${user?.isApproved ? 'badge-success' : 'badge-warning'}`}>
              {user?.isApproved ? 'Approved' : 'Pending Approval'}
            </span>
          </div>

          {user?.isApproved && user?.approvedDate && (
            <div className="mb-3">
              <div className="form-label">Approved Date</div>
              <div>{new Date(user.approvedDate).toLocaleDateString()}</div>
            </div>
          )}

          {user?.qrCode ? (
            <div className="mb-3">
              <div className="form-label">QR Code Status</div>
              <span className="badge badge-success">Generated</span>
              <div className="qr-code-display mt-2">
                <img 
                  src={user.qrCode} 
                  alt="Your QR Code"
                  style={{ maxWidth: '200px' }}
                />
                <p className="text-muted mt-2">
                  Show this QR code to admin for verification
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <div className="form-label">QR Code Status</div>
              <span className="badge badge-warning">Not Generated</span>
              <p className="text-muted mt-1">
                QR code will be generated by admin after approval
              </p>
            </div>
          )}

          {!user?.isApproved && (
            <div className="mt-3 p-3" style={{ backgroundColor: '#fff3cd', borderRadius: '6px' }}>
              <h4 className="text-warning mb-2">Pending Approval</h4>
              <p className="text-muted mb-0">
                Your registration is under review. You will be notified once approved by an administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;