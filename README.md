# Civic Voice Backend

A Node.js backend API for a civic issue reporting platform that allows citizens to report civic problems with AI validation and administrative oversight.

## Features

- **User Authentication**: JWT-based authentication with Google OAuth support
- **Issue Reporting**: Submit civic issues with images and AI-powered validation
- **Admin Panel**: Manage and track reported issues
- **AI Validation**: Uses Google Gemini AI to validate issue descriptions
- **Security**: Rate limiting, input validation, file upload security
- **File Storage**: Cloudinary integration for image storage

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT, Passport.js, Google OAuth
- **AI**: Google Gemini API
- **File Storage**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting

## Environment Setup

1. Copy `.env` file and configure:
```bash
cp .env .env.local
```

2. Update the following variables:
```env
# Required
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
ADMIN_EMAILS=admin@yourdomain.com
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Reports
- `POST /api/report` - Submit new issue report
- `GET /api/user/my-reports` - Get user's reports

### Admin
- `GET /api/admin/issues` - Get all issues (admin only)
- `GET /api/admin/issues/:id` - Get single issue (admin only)
- `PUT /api/admin/issues/:id/status` - Update issue status (admin only)

## Security Features

- **Rate Limiting**: Prevents abuse of auth and report endpoints
- **Input Validation**: Joi validation for all user inputs
- **File Upload Security**: Size and type restrictions
- **CORS Protection**: Configured origins only
- **Error Handling**: Comprehensive error responses
- **Security Headers**: Helmet middleware for HTTP security

## Database Schema

### User Model
- username, email, password (hashed), googleId
- Timestamps

### Issue Model
- userId, description, issueType, location, imageUrl, geminiValidation, status
- Timestamps, indexes for performance

## Development

- Uses nodemon for auto-restart during development
- Environment-based configuration
- Modular middleware structure

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Configure proper SSL certificates
4. Set up monitoring and logging
5. Use environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License
