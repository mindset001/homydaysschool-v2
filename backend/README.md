# Backend API for High School Manager

This is the backend API for the High School Manager application, built with Node.js, Express, MongoDB, and Cloudinary.

## Features

- User authentication (JWT-based)
- Role-based access control (Admin, Staff, Student, Guardian)
- Student, Staff, and Guardian management
- File uploads with Cloudinary integration
- MongoDB database
- TypeScript support
- API rate limiting
- Security middleware (Helmet, CORS)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
   - MongoDB connection string
   - JWT secrets
   - Cloudinary credentials
   - API key

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh` - Refresh access token
- POST `/api/auth/logout` - Logout user

### Students (Protected)
- GET `/api/students` - Get all students
- GET `/api/students/:id` - Get student by ID
- POST `/api/students` - Create new student
- PUT `/api/students/:id` - Update student
- DELETE `/api/students/:id` - Delete student
- POST `/api/students/:id/documents` - Upload student document

### Staff (Protected)
- GET `/api/staff` - Get all staff
- GET `/api/staff/:id` - Get staff by ID
- POST `/api/staff` - Create new staff
- PUT `/api/staff/:id` - Update staff
- DELETE `/api/staff/:id` - Delete staff
- POST `/api/staff/:id/documents` - Upload staff document

### Guardians (Protected)
- GET `/api/guardians` - Get all guardians
- GET `/api/guardians/:id` - Get guardian by ID
- POST `/api/guardians` - Create new guardian
- PUT `/api/guardians/:id` - Update guardian
- DELETE `/api/guardians/:id` - Delete guardian

## Environment Variables

See `.env.example` for required environment variables.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## Security Features

- JWT authentication
- API key validation
- Rate limiting
- Helmet security headers
- CORS protection
- Password hashing with bcrypt

## License

ISC
