# Photo Uploader Backend - Yiğit Çiçekci

A professional REST API for photo uploading with authentication, authorization, and media management built with NestJS.

## Features

- **Authentication & Authorization**: JWT-based authentication with access and refresh tokens
- **Media Management**: Upload, download, and manage JPEG images
- **Permission System**: Resource-based authorization with user-specific access control
- **File Storage**: Local file system storage with configurable upload directory
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Database**: MongoDB Atlas integration with Mongoose ODM
- **Internationalization**: Multi-language support (Turkish/English) with automatic error message translation
- **User Roles**: Enum-based user role system (USER/ADMIN)

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT (Access + Refresh tokens) with separate secrets
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Internationalization**: nestjs-i18n with Turkish/English support

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>

# JWT Configuration - Generate secure secrets using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=your_jwt_access_secret_here_minimum_64_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_minimum_64_characters_long

# JWT Token Expiry Times
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Installation

```bash
# Install dependencies
npm install

# Generate JWT secrets (copy output to .env file)
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users/me` - Get current user profile

### Media (Authentication required)
- `POST /media/upload` - Upload a media file
- `GET /media/my` - Get all media files owned by current user
- `GET /media/:id` - Get media file details by ID
- `GET /media/:id/download` - Download media file
- `DELETE /media/:id` - Delete media file
- `GET /media/:id/permissions` - Get media permissions
- `POST /media/:id/permissions` - Manage media permissions

### Health
- `GET /health` - Health check endpoint

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- **API JSON**: `http://localhost:3000/api-json`

## Example Usage

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Passw0rd!"}'
```

### Upload Image
```bash
curl -X POST http://localhost:3000/media/upload \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -F 'file=@/path/to/image.jpg'
```

### Download Image
```bash
curl -X GET http://localhost:3000/media/<MEDIA_ID>/download \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -OJ
```

### Manage Permissions
```bash
curl -X POST http://localhost:3000/media/<MEDIA_ID>/permissions \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"userId":"<USER_ID>","action":"add"}'
```

## Data Models

### User
```typescript
{
  _id: ObjectId,
  email: string (unique),
  passwordHash: string,
  role: 'user' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

### Media
```typescript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: User),
  fileName: string,
  filePath: string,
  mimeType: string,
  size: number,
  allowedUserIds: ObjectId[] (default: []),
  createdAt: Date
}
```

## Security Features

- JWT-based authentication with separate access and refresh tokens
- Password hashing with bcrypt
- File type validation (JPEG only)
- File size limits (5MB max)
- Resource-based access control
- Input validation and sanitization

## File Upload Constraints

- **Supported formats**: JPEG only
- **Maximum file size**: 5MB
- **Storage**: Local file system (`./uploads/` directory)
- **Access control**: Files are not served statically; access is controlled through API endpoints

## Development

```bash
# Run in development mode
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

## License

This project is licensed under the MIT License.
