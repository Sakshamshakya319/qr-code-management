# Security Guidelines

## 🔒 Environment Variables Security

### ✅ What's Protected
- Database credentials (MONGODB_URI)
- JWT secrets (JWT_SECRET)
- Admin credentials (ADMIN_EMAIL, ADMIN_PASSWORD)
- API keys and sensitive configuration

### ✅ How It's Protected
- All sensitive data is in `.env` files
- `.gitignore` prevents committing `.env` files
- Environment variables are used in deployment platforms
- No hardcoded secrets in source code

## 🚫 Never Commit These Files
- `backend/.env`
- `frontend/.env.local`
- `frontend/.env`
- Any file containing passwords, API keys, or database URLs

## ✅ Safe to Commit
- `.env.example` files (with placeholder values)
- Source code files
- Configuration files without secrets
- Documentation files

## 🔧 Deployment Security

### Render (Backend)
Set these environment variables in Render dashboard:
```
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret
FRONTEND_URL=https://your-vercel-app.vercel.app
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-secure-password
```

### Vercel (Frontend)
Set these environment variables in Vercel dashboard:
```
VITE_API_URL=https://your-render-app.onrender.com/api
```

## 🛡️ Security Best Practices

1. **Strong Passwords**: Use complex passwords for admin accounts
2. **JWT Secrets**: Generate random 32+ character strings
3. **Database Security**: Use MongoDB Atlas with IP whitelisting
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: API has built-in rate limiting
6. **Input Validation**: All inputs are validated server-side
7. **CORS**: Configured for specific domains only

## 🔍 Security Checklist Before Deployment

- [ ] All `.env` files are in `.gitignore`
- [ ] No secrets in source code
- [ ] Strong JWT secret generated
- [ ] Database has proper access controls
- [ ] CORS configured for production domains
- [ ] HTTPS enabled in production
- [ ] Environment variables set in deployment platforms
- [ ] Admin credentials are secure

## 🚨 If Secrets Are Exposed

If you accidentally commit secrets:

1. **Immediately change all exposed credentials**
2. **Rotate JWT secrets**
3. **Update database passwords**
4. **Remove sensitive commits from Git history**
5. **Update deployment environment variables**

## 📞 Security Contact

For security issues, please create an issue in the repository or contact the maintainers directly.