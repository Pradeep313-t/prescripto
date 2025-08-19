# Troubleshooting Guide: Doctor Data Not Being Added to MongoDB

## Issues Fixed

### 1. Address Format Mismatch
- **Problem**: Frontend was sending `{ line1: address1, line2: address2 }` but backend expected `{ addressLine: address }`
- **Fix**: Updated backend to handle both formats and standardized on `{ addressLine: address1, addressLine2: address2 }`

### 2. Missing Error Handling
- **Problem**: No proper error handling for Cloudinary uploads and MongoDB connection issues
- **Fix**: Added comprehensive error handling with specific error messages

### 3. File Cleanup
- **Problem**: Uploaded files were not being cleaned up after Cloudinary upload
- **Fix**: Added automatic file cleanup after successful upload

### 4. Enhanced Logging
- **Problem**: Insufficient logging to debug issues
- **Fix**: Added detailed console logging throughout the process

## How to Test

### 1. Check Environment Variables
```bash
cd backend
node check-env.js
```

### 2. Test Database Connection
```bash
cd backend
node test-db.js
```

### 3. Test Login Functionality
```bash
cd backend
node test-login.js
```

### 4. Check Environment Variables
Make sure your `.env` file has all required variables:
```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

### 5. Test the API
1. Start the server: `npm start`
2. Check console logs for environment variable status
3. Try logging in with admin credentials
4. Try adding a doctor through the admin panel
5. Check the console for detailed logs

### 6. Verify Data in MongoDB
- Check MongoDB Atlas dashboard
- Use the new `/api/admin/doctors` endpoint (requires admin token)

## Common Issues and Solutions

### 1. MongoDB Connection Failed
- Check if `MONGODB_URI` is set correctly
- Verify network connectivity
- Check if IP is whitelisted in MongoDB Atlas

### 2. Cloudinary Upload Failed
- Check if Cloudinary credentials are correct
- Verify image file format (jpeg, jpg, png, webp)
- Check file size (max 5MB)

### 3. Authentication Issues
- Make sure admin is logged in
- Check if `aToken` is being sent correctly
- Verify JWT_SECRET is set
- **Login Issues**: 
  - Backend returns `atoken` but frontend expects `token` (FIXED)
  - Missing `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
  - No navigation after successful login (FIXED)
  - Empty default route (FIXED)

### 4. Validation Errors
- Password must be at least 8 characters
- All required fields must be filled
- Email must be unique
- Image is required

## Debug Steps

1. **Check Server Logs**: Look for detailed console output
2. **Check Network Tab**: Verify request/response in browser dev tools
3. **Test Database**: Run `test-db.js` to verify MongoDB connection
4. **Check Environment**: Verify all environment variables are set
5. **Test API Endpoints**: Use Postman or similar to test endpoints directly

## Recent Changes Made

1. Fixed address format handling in `adminController.js`
2. Added comprehensive error handling
3. Added file cleanup after Cloudinary upload
4. Enhanced logging throughout the application
5. Added environment variable checking
6. Created test script for database connection
7. Added getAllDoctors endpoint for debugging
8. Fixed variable reference in success response
9. Fixed admin login token field mismatch
10. Added navigation after successful login
11. Fixed default route redirection
12. Enhanced login error handling and logging
