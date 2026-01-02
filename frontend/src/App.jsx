import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminSetup from './components/AdminSetup';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import QRScanner from './pages/QRScanner';
import UserManagement from './pages/UserManagement';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const [setupComplete, setSetupComplete] = React.useState(false);
  const [checkingSetup, setCheckingSetup] = React.useState(true);

  React.useEffect(() => {
    checkSystemSetup();
  }, []);

  const checkSystemSetup = async () => {
    try {
      console.log('Checking system setup...');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/setup/check-admin`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Setup check response:', data);
      
      setSetupComplete(data.hasAdmin === true);
    } catch (error) {
      console.error('Setup check failed:', error);
      // If we can't check, assume setup is needed
      setSetupComplete(false);
    } finally {
      setCheckingSetup(false);
    }
  };

  if (checkingSetup) {
    return <LoadingSpinner text="Checking system setup..." />;
  }

  if (!setupComplete) {
    return <AdminSetup onSetupComplete={() => {
      console.log('Setup completed, refreshing...');
      setSetupComplete(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/scanner" 
            element={
              <ProtectedRoute adminOnly>
                <QRScanner />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;