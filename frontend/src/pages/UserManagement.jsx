import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  Search, 
  Filter, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Eye
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter
        }
      });
      
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (userId) => {
    try {
      const response = await api.post(`/qr/generate/${userId}`, {
        eventId: 'default-event'
      });
      
      toast.success('QR code generated successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to generate QR code';
      toast.error(message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete user';
      toast.error(message);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="container">
      <div className="mb-4">
        <h1>
          <Users size={24} style={{ marginRight: '8px' }} />
          User Management
        </h1>
        <p className="text-muted">Manage registered users and generate QR codes</p>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">
              <Search size={16} style={{ marginRight: '8px' }} />
              Search Users
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <Filter size={16} style={{ marginRight: '8px' }} />
              Filter by Status
            </label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <option value="all">All Users</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner text="Loading..." />
        ) : users.length === 0 ? (
          <div className="text-center py-4">
            <Users size={48} className="text-muted mb-2" />
            <p className="text-muted">No users found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>QR Code</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`badge ${user.isApproved ? 'badge-success' : 'badge-warning'}`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {user.qrCode ? (
                          <span className="badge badge-success">Generated</span>
                        ) : (
                          <span className="badge badge-danger">Not Generated</span>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            <Eye size={12} />
                          </button>
                          
                          {!user.qrCode && (
                            <button
                              onClick={() => generateQRCode(user._id)}
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              <QrCode size={12} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="btn btn-danger"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="text-center mt-3">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  
                  <span style={{ padding: '8px 16px', alignSelf: 'center' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="card"
            style={{ 
              maxWidth: '500px', 
              width: '90%', 
              maxHeight: '80vh', 
              overflow: 'auto' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>User Details</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                style={{ padding: '4px 8px' }}
              >
                <XCircle size={16} />
              </button>
            </div>
            
            <div className="mb-3">
              <strong>Name:</strong> {selectedUser.name}
            </div>
            <div className="mb-3">
              <strong>Email:</strong> {selectedUser.email}
            </div>
            <div className="mb-3">
              <strong>Phone:</strong> {selectedUser.phone}
            </div>
            <div className="mb-3">
              <strong>Role:</strong> {selectedUser.role}
            </div>
            <div className="mb-3">
              <strong>Status:</strong> 
              <span className={`badge ${selectedUser.isApproved ? 'badge-success' : 'badge-warning'} ml-2`}>
                {selectedUser.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div className="mb-3">
              <strong>Registered:</strong> {new Date(selectedUser.createdAt).toLocaleString()}
            </div>
            
            {selectedUser.isApproved && selectedUser.approvedDate && (
              <div className="mb-3">
                <strong>Approved:</strong> {new Date(selectedUser.approvedDate).toLocaleString()}
              </div>
            )}
            
            {selectedUser.qrCode && (
              <div className="mb-3">
                <strong>QR Code:</strong>
                <div className="qr-code-display mt-2">
                  <img 
                    src={selectedUser.qrCode} 
                    alt="User QR Code"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {!selectedUser.qrCode && (
                <button
                  onClick={() => {
                    generateQRCode(selectedUser._id);
                    setShowModal(false);
                  }}
                  className="btn btn-primary"
                >
                  <QrCode size={16} />
                  Generate QR
                </button>
              )}
              
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;