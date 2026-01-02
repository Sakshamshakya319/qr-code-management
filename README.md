# QR Code Event Management System

A complete event management system with QR code generation and scanning capabilities built with React.js, Node.js, and MongoDB. Features a robust QR scanner with camera support for real-time user approval and event management.

## 🚀 Features

- **User Registration & Authentication**: Secure user registration and login system with JWT
- **Admin Panel**: Comprehensive admin dashboard for user management and analytics
- **QR Code Generation**: Generate unique QR codes for registered users with custom data
- **Advanced QR Code Scanner**: Real-time camera scanning with multiple fallback options
- **User Management**: View, approve, and manage registered users with detailed profiles
- **Real-time Statistics**: Dashboard with user and scan statistics and analytics
- **Responsive Design**: Mobile-friendly interface optimized for all devices
- **Security Features**: Rate limiting, CORS protection, and secure environment handling

## 📱 QR Scanner Features

### Camera Scanner
- **Real-time scanning** with live camera feed
- **Back camera preference** for mobile devices
- **Auto-detection** with visual QR code overlay
- **HTTPS support** for secure camera access
- **Cross-browser compatibility** (Chrome, Firefox, Safari, Edge)

### Fallback Options
- **File upload scanning** for QR code images
- **Manual QR data input** as backup method
- **Test QR generator** for development and testing
- **Debug information** panel for troubleshooting

### Scanner Pages
- **Main Scanner** (`/scanner`) - Full-featured admin scanner
- **Simple Scanner** (`/simple-scanner`) - Minimal test implementation
- **QR Test Generator** (`/qr-test`) - Create test QR codes

## 🛠 Tech Stack

### Frontend
- **React.js 18** with modern hooks
- **Vite** (Fast build tool and dev server)
- **React Router** (Client-side routing)
- **Axios** (HTTP client with interceptors)
- **React Hot Toast** (Beautiful notifications)
- **Lucide React** (Modern icon library)
- **html5-qrcode** (Camera QR scanning library)

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **bcryptjs** (Secure password hashing)
- **QRCode** library for generation
- **Helmet** (Security middleware)
- **CORS** with origin validation
- **Express Rate Limit** (API protection)

## 📁 Project Structure

```
qr-event-management/
├── frontend/                    # React.js frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AdminSetup.jsx  # Initial admin setup
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx      # Navigation component
│   │   │   └── SimpleQRScanner.jsx  # Clean scanner component
│   │   ├── pages/              # Page components
│   │   │   ├── AdminDashboard.jsx   # Admin control panel
│   │   │   ├── Dashboard.jsx        # User dashboard
│   │   │   ├── Login.jsx           # Authentication
│   │   │   ├── QRScanner.jsx       # Main scanner page
│   │   │   ├── QRTest.jsx          # QR code generator
│   │   │   ├── SimpleScannerTest.jsx # Scanner testing
│   │   │   ├── Register.jsx        # User registration
│   │   │   ├── UserManagement.jsx  # Admin user control
│   │   │   └── UserProfile.jsx     # Profile management
│   │   ├── context/            # React context providers
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── config/             # Configuration files
│   │   │   └── api.js          # Axios configuration
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # App entry point
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json             # Vercel deployment config
├── backend/                     # Node.js backend API
│   ├── models/                 # MongoDB data models
│   │   ├── User.js             # User schema
│   │   └── QRScan.js           # Scan history schema
│   ├── routes/                 # API route handlers
│   │   ├── auth.js             # Authentication routes
│   │   ├── users.js            # User management routes
│   │   ├── qr.js               # QR code routes
│   │   └── setup.js            # System setup routes
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js             # JWT verification
│   │   └── validation.js       # Input validation
│   ├── scripts/                # Utility scripts
│   │   └── createAdmin.js      # Admin creation script
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── server.js               # Express server setup
├── DEPLOYMENT.md               # Deployment instructions
├── CAMERA_FIX_GUIDE.md        # QR scanner troubleshooting
├── render.yaml                 # Render deployment config
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **Git** for version control
- **Modern browser** with camera support for QR scanning

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd qr-event-management

# Install all dependencies (frontend + backend)
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies  
cd ../backend && npm install
```

### 2. Environment Setup

**Backend Environment** (`backend/.env`):
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/qr-event-management
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/qr-event-management

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
BCRYPT_ROUNDS=12

# CORS & Frontend
FRONTEND_URL=http://localhost:5173

# Admin Credentials (for initial setup)
ADMIN_EMAIL=sakshamshakya94@gmail.com
ADMIN_NAME=Saksham Shakya
ADMIN_PHONE=9876543210
ADMIN_PASSWORD=nrt*gam1apt0AZX-gdx
```

**Frontend Environment** (`frontend/.env.local`):
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development

```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start individually:
# Backend (from backend folder)
npm run dev

# Frontend (from frontend folder) 
npm run dev
```

**Access the application:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### 4. Initial Setup

1. **Visit the application** at http://localhost:5173
2. **Admin Setup**: The app will prompt you to create an admin account
3. **Login** with the admin credentials from your `.env` file
4. **Test QR Scanner**: Go to Admin → QR Scanner to test camera functionality

## 📱 QR Scanner Usage

### For Admins

1. **Navigate to Scanner**
   ```
   Admin Dashboard → QR Scanner (/scanner)
   ```

2. **Start Camera Scanner**
   - Click "Start Camera Scanner"
   - Allow camera permissions when prompted
   - Point camera at QR codes to scan

3. **Alternative Methods**
   - **File Upload**: Upload QR code images
   - **Manual Input**: Paste QR data directly
   - **Test Scanner**: Use `/simple-scanner` for debugging

### QR Code Testing

1. **Generate Test QR Codes**
   ```
   Admin Dashboard → QR Test (/qr-test)
   ```

2. **Create Test Data**
   - Enter custom test data
   - Generate QR code image
   - Use with scanner for testing

### Troubleshooting Scanner Issues

If camera doesn't work:

1. **Check Requirements**
   - ✅ HTTPS connection (required for camera)
   - ✅ Camera permissions granted
   - ✅ Modern browser (Chrome, Firefox, Safari)
   - ✅ No other apps using camera

2. **Debug Information**
   - Check debug panel in scanner
   - View browser console for errors
   - Try simple scanner test page

3. **Fallback Options**
   - Use file upload for QR images
   - Manual QR data input
   - Test with generated QR codes

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create Web Service on Render**
   - Connect your GitHub repository
   - **Root Directory**: Leave empty (uses root)
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node.js

2. **Environment Variables** (Set in Render Dashboard):
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qr-event-management
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-production
   FRONTEND_URL=https://your-frontend-app.vercel.app
   BCRYPT_ROUNDS=12
   ADMIN_EMAIL=sakshamshakya94@gmail.com
   ADMIN_NAME=Saksham Shakya
   ADMIN_PHONE=9876543210
   ADMIN_PASSWORD=nrt*gam1apt0AZX-gdx
   ```

3. **Deploy**: Render auto-deploys on git push to main branch

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Link GitHub repository to Vercel
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`

2. **Build Settings**:
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables** (Set in Vercel Dashboard):
   ```env
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

4. **Deploy**: Vercel auto-deploys on git push

### Alternative: Manual Deployment

**Using Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variables
vercel env add VITE_API_URL
```

**Using Render CLI:**
```bash
# Install Render CLI
npm i -g @render/cli

# Deploy backend
render deploy
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** with secure secret keys
- **Password Hashing** using bcryptjs with configurable rounds
- **Role-based Access** (Admin/User permissions)
- **Token Expiration** and refresh mechanisms

### API Security
- **Rate Limiting** to prevent API abuse
- **CORS Configuration** with specific origin validation
- **Helmet Middleware** for security headers
- **Input Validation** on all endpoints
- **Environment Variables** for all sensitive data

### QR Code Security
- **Unique QR Data** with timestamps and user validation
- **QR Code Verification** against stored user data
- **Scan History Tracking** for audit trails
- **Admin-only Scanning** for controlled access

### Data Protection
- **No Hardcoded Secrets** - all in environment variables
- **Secure Database Connections** with authentication
- **HTTPS Enforcement** for camera access and production
- **Proper Error Handling** without data leakage

## 📡 API Endpoints

### Authentication Routes
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login  
GET    /api/auth/me           # Get current user profile
POST   /api/auth/verify-token # Verify JWT token validity
```

### User Management Routes
```
GET    /api/users             # Get all users (Admin only)
GET    /api/users/:id         # Get specific user by ID
PUT    /api/users/:id         # Update user profile
DELETE /api/users/:id         # Delete user (Admin only)
GET    /api/users/stats/overview # Get user statistics (Admin only)
```

### QR Code Routes
```
POST   /api/qr/generate/:userId  # Generate QR code for user (Admin only)
POST   /api/qr/scan             # Scan and process QR code (Admin only)
GET    /api/qr/my-qr           # Get current user's QR code
GET    /api/qr/scans           # Get scan history (Admin only)
GET    /api/qr/scans/stats     # Get scan statistics (Admin only)
```

### System Setup Routes
```
GET    /api/setup/check-admin  # Check if admin exists
POST   /api/setup/create-admin # Create initial admin account
GET    /api/health             # Health check endpoint
GET    /api/test               # Test API connectivity
```

### QR Code Data Format

**Generated QR Code Structure:**
```json
{
  "userId": "64c91d...",
  "email": "user@example.com", 
  "name": "User Name",
  "eventId": "event-123",
  "generatedAt": "2024-01-02T10:30:00.000Z",
  "generatedBy": "admin-user-id"
}
```

**Scan Request Format:**
```json
{
  "qrData": "{\"userId\":\"64c91d...\",\"email\":\"user@example.com\"}",
  "scanType": "approval",
  "notes": "Scanned at event entrance"
}
```

## 👤 Admin Account Setup

### Automatic Setup (Recommended)

1. **Visit Application**: Navigate to your deployed app URL
2. **Admin Setup Prompt**: Click "Create Admin Account" when prompted  
3. **Login**: Use the credentials from your environment variables

### Default Admin Credentials

```
Email: sakshamshakya94@gmail.com
Password: nrt*gam1apt0AZX-gdx
Name: Saksham Shakya
Role: Administrator
```

### Manual Setup Options

**Option 1: Environment Script**
```bash
cd backend
npm run create-admin
```

**Option 2: Direct Database Update**
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      role: "admin",
      isApproved: true 
    } 
  }
)
```

**Option 3: API Call**
```bash
curl -X POST http://localhost:5000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure-password",
    "name": "Admin User"
  }'
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly in backend environment
   - Check that frontend is making requests to correct API URL

2. **Database Connection**
   - Verify MongoDB URI is correct
   - Ensure database is accessible from your deployment platform

3. **Environment Variables**
   - Double-check all environment variables are set
   - Ensure no trailing spaces or quotes in values

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Deployment Checklist

- [ ] MongoDB database is accessible
- [ ] All environment variables are set
- [ ] Frontend API URL points to deployed backend
- [ ] Backend CORS allows frontend domain
- [ ] JWT secret is secure and consistent
- [ ] Build commands are correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.