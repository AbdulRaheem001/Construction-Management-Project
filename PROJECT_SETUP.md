# Construction Management System (CMS)

A comprehensive web-based Construction Management System built with the MERN stack (MongoDB, Express.js, React, Node.js) with TypeScript.

## 🏗️ Project Overview

This system integrates project management with detailed financial and operational expense tracking across five core modules:

- **Material Management** - Track materials, purchase orders, and inventory
- **Labour Management** - Manage employees, timesheets, and payroll
- **Site/Project Management** - Monitor projects, budgets, and daily logs
- **Equipment Management** - Asset tracking, usage, and maintenance
- **Warehouse Management** - Inventory control and stock transfers

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type safety
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher recommended)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn**
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd "/Users/fawad/Desktop/Ali Rehman/Construction Managment"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already exists)
# Update MongoDB URI if needed
# Default: MONGODB_URI=mongodb://localhost:27017/cms_db

# Start MongoDB (if not running)
# macOS with Homebrew:
brew services start mongodb-community

# Or manually:
mongod --config /usr/local/etc/mongod.conf

# Seed the database with demo users
npm run seed

# Start the backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

### 3. Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies (already done)
# npm install

# Start the frontend development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 👥 Demo Credentials

After running `npm run seed`, you can login with these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | admin@cms.com | password |
| **Site Manager** | manager@cms.com | password |
| **Accountant** | accountant@cms.com | password |
| **Labourer** | labourer@cms.com | password |

## 🔐 Role-Based Access Control (RBAC)

The system implements strict role-based access control:

| Feature | Administrator | Site Manager | Accountant | Labourer |
|---------|--------------|--------------|------------|----------|
| User Management | ✅ Full Access | ❌ | ✅ View Only | ❌ |
| Projects | ✅ | ✅ | ✅ View | ❌ |
| Materials | ✅ | ✅ | ✅ | ❌ |
| Labour & Payroll | ✅ | ✅ Manage | ✅ View Rates | ✅ Log Hours |
| Equipment | ✅ | ✅ | ✅ View | ❌ |
| Warehouse | ✅ | ✅ | ❌ | ❌ |
| Financial Reports | ✅ | ❌ | ✅ | ❌ |

## 📁 Project Structure

```
Construction Managment/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, error handling
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Helper functions
│   │   ├── server.ts         # Express app entry
│   │   └── seed.ts           # Database seeding
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities (axios)
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── .env                  # Environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md
```

## 🎯 Current Implementation Status

### ✅ Phase 1: User Management & RBAC (COMPLETED)
- [x] User authentication (login/register)
- [x] JWT token-based sessions
- [x] Role-based access control
- [x] User CRUD operations
- [x] Admin dashboard
- [x] User management UI
- [x] Audit logging

### 🚧 Next Phases (Planned)

- **Phase 2**: Site/Project Management
- **Phase 3**: Material Management
- **Phase 4**: Warehouse Management
- **Phase 5**: Labour Management
- **Phase 6**: Equipment Management
- **Phase 7**: Expense Management & Reporting

## 🔧 Available Scripts

### Backend
```bash
npm run dev        # Start development server with hot reload
npm run build      # Compile TypeScript to JavaScript
npm start          # Run production build
npm run seed       # Seed database with demo data
npm test           # Run tests
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Users (Protected)
- `GET /api/users` - Get all users (Admin, Accountant)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Deactivate user (Admin only)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Secure HTTP headers with Helmet
- CORS configuration
- Input validation
- XSS protection
- Audit logging for all actions

## 📊 Database Schema

### Users Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: Enum [Administrator, Site Manager, Accountant, Labourer],
  contact: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Audit Logs Collection
```javascript
{
  userId: ObjectId,
  action: String,
  resource: String,
  resourceId: String,
  changes: Object,
  ipAddress: String,
  timestamp: Date
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Port Already in Use
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Clear node_modules and Reinstall
```bash
# Backend
cd backend && rm -rf node_modules package-lock.json && npm install

# Frontend
cd frontend && rm -rf node_modules package-lock.json && npm install
```

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cms_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

This project is in active development. Future modules will be added according to the roadmap.

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using MERN Stack + TypeScript**
