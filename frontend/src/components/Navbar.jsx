import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, QrCode, Users, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            QR Event Manager
          </Link>
          
          <div className="navbar-nav">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <BarChart3 size={16} />
              Dashboard
            </Link>
            
            {isAdmin && (
              <>
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                >
                  <Users size={16} />
                  Admin Panel
                </Link>
                <Link 
                  to="/scanner" 
                  className={`nav-link ${isActive('/scanner') ? 'active' : ''}`}
                >
                  <QrCode size={16} />
                  QR Scanner
                </Link>
                <Link 
                  to="/users" 
                  className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                >
                  <Users size={16} />
                  Users
                </Link>
                <Link 
                  to="/qr-test" 
                  className={`nav-link ${isActive('/qr-test') ? 'active' : ''}`}
                >
                  <QrCode size={16} />
                  QR Test
                </Link>
              </>
            )}
            
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              <User size={16} />
              Profile
            </Link>
            
            <button 
              onClick={logout}
              className="btn btn-secondary"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;