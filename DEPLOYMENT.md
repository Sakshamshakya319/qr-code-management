# Deployment Guide

This guide will help you deploy the QR Event Management System to Vercel (frontend) and Render (backend) without exposing any secrets.

## Prerequisites

- GitHub account
- Vercel account
- Render account
- MongoDB Atlas account (for cloud database)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/qr-event-management.git
   git push -u origin main
   ```

2. **Ensure .gitignore is properly configured**
   - The provided `.gitignore` file already excludes `.env` files
   - Never commit environment files to version control

## Step 2: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas account** at https://www.mongodb.com/atlas
2. **Create a new cluster** (free tier is sufficient for testing)
3. **Create a database user**:
   - Go to Database Access
   - Add New Database User
   - Choose password authentication
   - Save the username and password securely
4. **Whitelist IP addresses**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows access from anywhere)
5. **Get connection string**:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 3: Deploy Backend to Render

1. **Create Render account** at https://render.com

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure the service**:
   - **Name**: `qr-event-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

4. **Set Environment Variables** (CRITICAL - DO NOT EXPOSE THESE):
   
   In Render dashboard, go to Environment tab and add:
   
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qr-event-management?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-random-string
   FRONTEND_URL=https://your-app-name.vercel.app
   BCRYPT_ROUNDS=12
   ```

   **Important Notes**:
   - Replace `username:password` in MONGODB_URI with your actual MongoDB credentials
   - Generate a strong JWT_SECRET (use a password generator for 32+ characters)
   - You'll update FRONTEND_URL after deploying to Vercel

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-service-name.onrender.com`

## Step 4: Deploy Frontend to Vercel

1. **Create Vercel account** at https://vercel.com

2. **Import your project**:
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure build settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variables**:
   
   In Vercel dashboard, go to Settings → Environment Variables:
   
   ```env
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```
   
   Replace with your actual Render backend URL from Step 3.

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL: `https://your-app-name.vercel.app`

## Step 5: Update Backend Configuration

1. **Update FRONTEND_URL in Render**:
   - Go back to your Render service
   - Update the `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy the service

## Step 6: Create Admin Account

The system will automatically prompt you to create an admin account on first visit. The default admin credentials are:

**Admin Credentials:**
- **Email**: sakshamshakya94@gmail.com
- **Password**: nrt*gam1apt0AZX-gdx
- **Name**: Saksham Shakya
- **Role**: Administrator

### Automatic Setup Process

1. **Visit your deployed app** - The system will detect no admin exists
2. **Click "Create Admin Account"** - This will create the admin with the above credentials
3. **Login with admin credentials** - Use the email and password above
4. **Start managing users** - You can now approve users and generate QR codes

### Manual Setup (Alternative Methods)

If you prefer to create the admin manually:

#### Method 1: Using the Setup Script

```bash
# In your local backend directory
cd backend
npm run create-admin
```

#### Method 2: Register and Update Database

1. **Register a normal account** through your deployed app
2. **Connect to MongoDB Atlas**:
   - Go to MongoDB Atlas → Clusters → Browse Collections
   - Find your user in the `users` collection
   - Edit the document and change `role` from `"user"` to `"admin"`

#### Method 3: Use MongoDB Compass

1. **Download MongoDB Compass**
2. **Connect using your connection string**
3. **Navigate to your database → users collection**
4. **Find your user and update the role field**

## Step 7: Test Your Deployment

1. **Visit your Vercel URL**
2. **Complete admin setup** (if prompted)
3. **Login with admin credentials**:
   - Email: sakshamshakya94@gmail.com
   - Password: nrt*gam1apt0AZX-gdx
4. **Register a test user account**
5. **Generate QR code for the user**
6. **Test QR code scanning**

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] No secrets are committed to GitHub
- [ ] MongoDB Atlas has proper access controls
- [ ] JWT secret is strong and unique
- [ ] CORS is configured for your specific domain
- [ ] Environment variables are set in deployment platforms only

## Troubleshooting

### Backend Issues

1. **Check Render logs**:
   - Go to your Render service → Logs tab
   - Look for connection errors or startup issues

2. **Common fixes**:
   - Verify MongoDB connection string
   - Check all environment variables are set
   - Ensure Node.js version compatibility

### Frontend Issues

1. **Check Vercel deployment logs**:
   - Go to your Vercel project → Deployments
   - Click on a deployment to see build logs

2. **Common fixes**:
   - Verify API URL is correct
   - Check environment variables
   - Clear browser cache

### CORS Issues

1. **Update FRONTEND_URL** in Render environment variables
2. **Redeploy backend** after updating CORS settings
3. **Check browser console** for specific CORS errors

## Monitoring and Maintenance

### Render (Backend)
- Monitor service health in Render dashboard
- Check logs regularly for errors
- Set up alerts for downtime

### Vercel (Frontend)
- Monitor deployment status
- Check analytics for usage patterns
- Set up domain if needed

### MongoDB Atlas
- Monitor database performance
- Set up alerts for connection issues
- Regular backups (automatic in Atlas)

## Scaling Considerations

### For Higher Traffic
- Upgrade Render plan for better performance
- Consider CDN for static assets
- Implement database indexing
- Add Redis for session management

### Security Enhancements
- Implement rate limiting per user
- Add request logging
- Set up monitoring and alerts
- Regular security audits

## Cost Optimization

### Free Tier Limits
- **Render**: 750 hours/month (sufficient for 1 service)
- **Vercel**: 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage

### Upgrade Triggers
- Render: When you need more than 750 hours or better performance
- Vercel: When you exceed bandwidth limits
- MongoDB: When you exceed storage or need better performance

This deployment setup ensures your secrets are never exposed while providing a robust, scalable foundation for your QR Event Management System.