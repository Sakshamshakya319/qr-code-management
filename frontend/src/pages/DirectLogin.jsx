import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Shield } from 'lucide-react';

const DirectLogin = () => {
  const [formData, setFormData] = useState({
    email: 'sakshamshakya94@gmail.com',
    password: 'nrt*gam1apt0AZX-gdx'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '80px auto' }}>
        <div className="card">
          <div className="text-center mb-4">
            <Shield size={48} className="text-primary mb-2" />
            <h1 className="mb-2">Admin Login</h1>
            <p className="text-muted">QR Event Management System</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} style={{ marginRight: '8px' }} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} style={{ marginRight: '8px' }} />
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              <LogIn size={16} />
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="text-center mt-3">
            <p className="text-muted">
              <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
                Register as User
              </a>
            </p>
          </div>

          <div className="mt-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '12px' }}>
            <strong>Default Admin Credentials:</strong><br />
            Email: sakshamshakya94@gmail.com<br />
            Password: nrt*gam1apt0AZX-gdx
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectLogin;