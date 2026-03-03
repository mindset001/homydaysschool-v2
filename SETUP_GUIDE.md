# High School Manager - Setup Guide

## ✅ Backend Setup Complete!

Your backend has been successfully created with the following structure:

### 📁 Directory Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── index.ts              # Configuration management
│   │   ├── database.ts           # MongoDB connection
│   │   ├── cloudinary.ts         # Cloudinary setup
│   │   └── multer.ts             # File upload configuration
│   ├── models/
│   │   ├── User.ts               # User model (all roles)
│   │   ├── Student.ts            # Student model
│   │   ├── Staff.ts              # Staff model
│   │   └── Guardian.ts           # Guardian model
│   ├── controllers/
│   │   ├── authController.ts     # Authentication logic
│   │   ├── studentController.ts  # Student CRUD operations
│   │   ├── staffController.ts    # Staff CRUD operations
│   │   └── guardianController.ts # Guardian CRUD operations
│   ├── routes/
│   │   ├── authRoutes.ts         # Auth endpoints
│   │   ├── studentRoutes.ts      # Student endpoints
│   │   ├── staffRoutes.ts        # Staff endpoints
│   │   └── guardianRoutes.ts     # Guardian endpoints
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   ├── apiKey.ts             # API key validation
│   │   └── errorHandler.ts       # Error handling
│   ├── utils/
│   │   ├── jwt.ts                # JWT token utilities
│   │   └── password.ts           # Password hashing
│   └── server.ts                 # Server entry point
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

### 🔧 Next Steps

1. **Configure MongoDB:**
   - Install MongoDB locally OR use MongoDB Atlas
   - Update `MONGODB_URI` in `.env` file

2. **Configure Cloudinary:**
   - Sign up at https://cloudinary.com
   - Get your credentials from dashboard
   - Update these in `.env`:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`

3. **Update Frontend Configuration:**
   - Create `.env` in root folder
   - Add: `VITE_REACT_APP_API_URL=http://localhost:5000/api`
   - Add: `VITE_REACT_APP_API_KEY=hsm-api-key-2026`

4. **Start the Backend:**
   ```bash
   cd backend
   npm run dev
   ```

5. **Test the API:**
   - Health check: GET http://localhost:5000/health
   - Register user: POST http://localhost:5000/api/auth/register
   - Login: POST http://localhost:5000/api/auth/login

### 🔑 API Endpoints

#### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user

#### Students (Protected)
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/documents` - Upload document

#### Staff (Protected)
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff
- `POST /api/staff/:id/documents` - Upload document

#### Guardians (Protected)
- `GET /api/guardians` - Get all guardians
- `GET /api/guardians/:id` - Get guardian by ID
- `POST /api/guardians` - Create guardian
- `PUT /api/guardians/:id` - Update guardian
- `DELETE /api/guardians/:id` - Delete guardian

### 🔐 Security Features

✅ JWT Authentication
✅ API Key Validation
✅ Rate Limiting
✅ CORS Protection
✅ Helmet Security Headers
✅ Password Hashing (bcrypt)
✅ Role-Based Access Control

### 🎯 User Roles

- **Admin**: Full access to all resources
- **Staff**: Access to students, limited staff info
- **Student**: Access to own profile and data
- **Guardian**: Access to ward information

### 📝 Example Usage

#### 1. Register a User
```bash
POST http://localhost:5000/api/auth/register
Headers: X-API-Key: hsm-api-key-2026
Body:
{
  "email": "admin@school.com",
  "password": "admin123",
  "role": "admin",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### 2. Login
```bash
POST http://localhost:5000/api/auth/login
Headers: X-API-Key: hsm-api-key-2026
Body:
{
  "email": "admin@school.com",
  "password": "admin123"
}
```

#### 3. Create Student
```bash
POST http://localhost:5000/api/students
Headers: 
  X-API-Key: hsm-api-key-2026
  Authorization: Bearer <access_token>
Body:
{
  "userId": "<user_id>",
  "studentId": "STU001",
  "class": "Grade 10",
  "section": "A",
  "admissionDate": "2026-01-01",
  "dateOfBirth": "2010-05-15",
  "gender": "male",
  "address": "123 Main St"
}
```

### 💡 Tips

- All protected routes require `Authorization: Bearer <token>` header
- All routes require `X-API-Key` header
- Files are uploaded to Cloudinary automatically
- Local uploads folder is temporary (files deleted after upload)
- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days

### 🚀 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### 📦 Installed Dependencies

**Production:**
- express - Web framework
- mongoose - MongoDB ODM
- cloudinary - Cloud storage
- multer - File uploads
- bcryptjs - Password hashing
- jsonwebtoken - JWT tokens
- cors - CORS handling
- helmet - Security headers
- morgan - Request logging
- express-rate-limit - Rate limiting
- express-validator - Input validation

**Development:**
- typescript - Type checking
- tsx - TypeScript execution
- @types/* - Type definitions

---

**Need help?** Check the README.md file in the backend folder for more details!
