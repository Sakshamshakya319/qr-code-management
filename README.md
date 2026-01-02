# QR Code Event Management System

A complete event management system with QR code generation and scanning capabilities built with React.js, Node.js, and MongoDB.

## Features

- **User Registration & Authentication**: Secure user registration and login system
- **Admin Panel**: Comprehensive admin dashboard for user management
- **QR Code Generation**: Generate unique QR codes for registered users
- **QR Code Scanner**: Scan QR codes to approve users and verify entries
- **User Management**: View, approve, and manage registered users
- **Real-time Statistics**: Dashboard with user and scan statistics
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- React.js 18
- Vite (Build tool)
- React Router (Navigation)
- Axios (HTTP client)
- React Hot Toast (Notifications)
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (Password hashing)
- QRCode library
- Helmet (Security)
- CORS
- Rate limiting

## Project Structure

```
qr-event-management/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── config/         # Configuration files
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── package.json
│   └── server.js
├── vercel.json             # Vercel deployment config
├── render.yaml             # Render deployment config
└── README.md
```

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd qr-event-management
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   **Backend (.env)**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/qr-event-management
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   FRONTEND_URL=http://localhost:5173
   BCRYPT_ROUNDS=12
   ```

   **Frontend (.env.local)**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
   Edit `frontend/.env.local`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend server on http://localhost:5173

## Deployment

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Use the following settings:
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Environment**: Node

2. **Set Environment Variables in Render Dashboard**
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qr-event-management
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   FRONTEND_URL=https://your-frontend-app.vercel.app
   BCRYPT_ROUNDS=12
   ```

3. **Deploy**
   - Render will automatically deploy when you push to your main branch

### Frontend Deployment (Vercel)

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Or use CLI: `vercel --prod`

3. **Set Environment Variables in Vercel Dashboard**
   ```env
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

4. **Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

## Security Features

- **Environment Variables**: All secrets are stored in environment variables
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with configurable rounds
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Server-side validation for all inputs

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-token` - Verify JWT token

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/stats/overview` - Get user statistics (Admin only)

### QR Codes
- `POST /api/qr/generate/:userId` - Generate QR code (Admin only)
- `POST /api/qr/scan` - Scan QR code (Admin only)
- `GET /api/qr/my-qr` - Get user's QR code
- `GET /api/qr/scans` - Get scan history (Admin only)
- `GET /api/qr/scans/stats` - Get scan statistics (Admin only)

## Default Admin Account

The system includes an automatic admin setup process. When you first visit the deployed application, it will prompt you to create an admin account with these credentials:

**Admin Login Credentials:**
- **Email**: sakshamshakya94@gmail.com
- **Password**: nrt*gam1apt0AZX-gdx
- **Name**: Saksham Shakya
- **Role**: Administrator

### Admin Setup Options

**Option 1: Automatic Setup (Recommended)**
1. Visit your deployed application
2. Click "Create Admin Account" when prompted
3. Login with the credentials above

**Option 2: Manual Script**
```bash
cd backend
npm run create-admin
```

**Option 3: Database Update**
1. Register a normal account through the app
2. Update the user's role to "admin" in MongoDB
   ```javascript
   // In MongoDB
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
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