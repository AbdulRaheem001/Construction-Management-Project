# Quick Start Guide - Construction Management System

## 🚨 Important: MongoDB Installation Required

The backend requires MongoDB to be installed and running. Follow these steps:

### Installing MongoDB on macOS

```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify MongoDB is running
brew services list | grep mongodb
```

### Alternative: Start MongoDB manually
```bash
mongod --config /usr/local/etc/mongod.conf --fork
```

### Check if MongoDB is running
```bash
# Try connecting
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017
```

---

## 🚀 Starting the Application

### 1. Start Backend (Terminal 1)

```bash
cd "/Users/fawad/Desktop/Ali Rehman/Construction Managment/backend"

# Seed the database with demo users
npm run seed

# Start the backend server
npm run dev
```

**Expected output:**
```
Server running in development mode on port 5000
MongoDB connected successfully
```

### 2. Start Frontend (Terminal 2)

```bash
cd "/Users/fawad/Desktop/Ali Rehman/Construction Managment/frontend"

# Start the frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Open the Application

Navigate to: **http://localhost:5173**

Login with:
- **Email**: `admin@cms.com`
- **Password**: `password`

---

## 📋 Demo Users

After running `npm run seed`, these users will be available:

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@cms.com | password |
| Site Manager | manager@cms.com | password |
| Accountant | accountant@cms.com | password |
| Labourer | labourer@cms.com | password |

---

## ✅ What's Been Completed

### Phase 1: User Management & RBAC ✓

**Backend:**
- ✅ Express + TypeScript server setup
- ✅ MongoDB + Mongoose integration
- ✅ JWT authentication
- ✅ User model with password hashing
- ✅ Auth routes (login, register, profile)
- ✅ User CRUD routes with role-based access
- ✅ Audit logging system
- ✅ Error handling middleware
- ✅ CORS and security headers (Helmet)

**Frontend:**
- ✅ React + TypeScript + Vite setup
- ✅ Tailwind CSS styling
- ✅ React Router for navigation
- ✅ Zustand for state management
- ✅ Axios HTTP client with interceptors
- ✅ Login page with form validation
- ✅ Dashboard with role-based module access
- ✅ User Management page (CRUD)
- ✅ Protected routes
- ✅ Toast notifications

**Security:**
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Audit logging for all user actions

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Start MongoDB
brew services start mongodb-community@7.0

# Or manually
mongod --dbpath /usr/local/var/mongodb
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Frontend Can't Connect to Backend
1. Check backend is running on http://localhost:5000
2. Check `frontend/.env` has: `VITE_API_URL=http://localhost:5000/api`
3. Check CORS settings in `backend/.env`: `CORS_ORIGIN=http://localhost:5173`

---

## 📂 Project Structure

```
Construction Managment/
├── backend/               # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Database schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & error handling
│   │   ├── types/        # TypeScript interfaces
│   │   ├── utils/        # Helper functions
│   │   └── server.ts     # App entry point
│   └── package.json
│
├── frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # State management
│   │   ├── types/       # TypeScript types
│   │   └── App.tsx      # Main app
│   └── package.json
│
└── README.md            # Requirements document
```

---

## 🎯 Current Features

### User Roles & Permissions

| Feature | Administrator | Site Manager | Accountant | Labourer |
|---------|--------------|--------------|------------|----------|
| Login/Logout | ✅ | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Users | ✅ | ❌ | ✅ | ❌ |
| Create Users | ✅ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | ❌ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ |

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user
- `PUT /api/auth/profile` - Update profile

**Users (Protected):**
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID  
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Deactivate user (Admin only)

---

## 📋 Next Development Phases

### Phase 2: Site/Project Management (Upcoming)
- Project CRUD operations
- Budget tracking
- Daily Log Reports (DLR)
- Project dashboard

### Phase 3: Material Management
- Materials master list
- Purchase Orders
- Goods Receipt
- Material consumption
- Low stock alerts

### Phase 4: Warehouse Management
- Warehouse & bin locations
- Stock transfers
- Inventory adjustments
- Physical count reconciliation

### Phase 5: Labour Management
- Employee database
- Timesheet entry & approval
- Payroll reporting
- Labour cost allocation

### Phase 6: Equipment Management
- Equipment asset register
- Assignment & transfers
- Usage recording
- Maintenance scheduling

### Phase 7: Expense Management & Reports
- General expense entry
- Receipt uploads
- Payment tracking
- Financial reports (P&L, Cash Flow, Trial Balance)

---

## 🔍 Testing the System

### 1. Test Login
```
URL: http://localhost:5173/login
Email: admin@cms.com
Password: password
```

### 2. Test User Management
- Login as Administrator
- Navigate to "User Management"
- Try creating/editing/viewing users

### 3. Test Role-Based Access
- Login as Labourer (labourer@cms.com / password)
- Notice "User Management" is not visible
- Only accessible dashboard is shown

### 4. Test API Directly
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cms.com","password":"password"}'

# Get users (requires token)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 💾 Database Seeding

The seed script creates 4 demo users:

```bash
cd backend
npm run seed
```

**Output:**
```
MongoDB connected
Admin user created
Site Manager user created
Accountant user created
Labourer user created
Seed data completed successfully!

Demo Credentials:
Admin: admin@cms.com / password
Site Manager: manager@cms.com / password
Accountant: accountant@cms.com / password
Labourer: labourer@cms.com / password
```

---

## 📊 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| HTTP | Axios |
| Forms | React Hook Form |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Security | Helmet, CORS |
| Logging | Winston |

---

**🎉 System is now ready for development!**

For questions or issues, check the troubleshooting section above.
