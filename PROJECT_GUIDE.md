# Construction Management System (CMS)

## 🎉 Project Overview

A comprehensive **Construction Management System** built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring:

- ✅ **5 Core Modules**: Projects, Materials, Labour, Equipment, Warehouse
- ✅ **Role-Based Access Control (RBAC)**: 4 user roles with granular permissions
- ✅ **Modern UI**: Clean, responsive design with Tailwind CSS
- ✅ **Real-time Budget Tracking**: Monitor project expenses and utilization
- ✅ **Complete Inventory Management**: Track materials, POs, and stock levels
- ✅ **Labour & Payroll**: Timesheets, employee management, and pay rates
- ✅ **Equipment Tracking**: Asset register, usage, and maintenance logs
- ✅ **Expense Management**: Comprehensive financial tracking and reporting

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already exists)
# Make sure MongoDB connection string is correct

# Seed database with demo users
npm run seed

# Start development server
npm run dev
```

Backend will run on: **http://localhost:5000**

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5174** (or 5173)

## 🔐 Demo Credentials

Access the system with these pre-configured accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Administrator** | admin@cms.com | password | Full system access |
| **Site Manager** | manager@cms.com | password | Project & site management |
| **Accountant** | accountant@cms.com | password | Financial access, no payrates visible to others |
| **Labourer** | labourer@cms.com | password | Limited access, can log timesheets |

## 📁 Project Structure

```
Construction Management/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & error handling
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities (JWT, logger)
│   │   └── server.ts        # Express server
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   │   ├── Layout.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── Header.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── pages/           # Page components
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Projects.tsx
    │   │   ├── Materials.tsx
    │   │   ├── Labour.tsx
    │   │   ├── Equipment.tsx
    │   │   ├── Warehouse.tsx
    │   │   └── Expenses.tsx
    │   ├── store/           # Zustand state management
    │   ├── lib/             # API client
    │   ├── types/           # TypeScript types
    │   ├── utils/           # Utilities & permissions
    │   ├── App.tsx          # Main app component
    │   └── main.tsx         # Entry point
    ├── package.json
    └── tailwind.config.js
```

## 🎯 Features by Module

### 1. Dashboard
- Overview statistics
- Active projects summary
- Quick action buttons
- Budget utilization charts

### 2. Project Management
- Create and manage projects
- Track project status
- Budget monitoring
- Real-time expense tracking
- Daily logs (upcoming)

### 3. Material Management
- Material master list
- Purchase order creation & approval
- Goods receipt processing
- Stock level tracking
- Low stock alerts

### 4. Labour Management
- Employee database
- Timesheet submission & approval
- Payroll calculation (role-based visibility)
- Work hours tracking per project

### 5. Equipment Management
- Asset register
- Equipment assignment to sites
- Usage tracking
- Maintenance scheduling
- Condition monitoring

### 6. Warehouse Management
- Multiple warehouse support
- Inventory tracking
- Stock transfers (Warehouse ↔ Site)
- Bin location management
- Stock adjustments

### 7. Expense Management
- Expense logging
- Payment tracking
- Category-wise filtering
- Financial reports
- Receipt attachments

## 🔒 Security & Permissions

### Role-Based Access Control

The system implements comprehensive RBAC with the following permission structure:

- **Administrator**: Full access to all modules
- **Site Manager**: Project, material, labour, equipment management
- **Accountant**: Financial access, reports, pay rates (hidden from others)
- **Labourer**: Limited access, timesheet submission only

### Key Security Features
- JWT-based authentication
- Protected routes
- Role-based component rendering
- Secure password hashing (bcrypt)
- Request validation
- Audit logging

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Winston
- **Security**: Helmet, CORS
- **Language**: TypeScript

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Materials
- `GET /api/materials` - List materials
- `POST /api/materials` - Create material
- `GET /api/materials/purchase-orders` - List POs
- `POST /api/materials/purchase-orders` - Create PO
- `PUT /api/materials/purchase-orders/:id/approve` - Approve PO
- `POST /api/materials/goods-receipt` - Record goods receipt
- `POST /api/materials/consumption` - Record consumption

### Labour
- `GET /api/labour/employees` - List employees
- `POST /api/labour/employees` - Add employee
- `GET /api/labour/timesheets` - List timesheets
- `POST /api/labour/timesheets` - Submit timesheet
- `PUT /api/labour/timesheets/:id/approve` - Approve timesheet
- `GET /api/labour/payroll` - Generate payroll report

### Equipment
- `GET /api/equipment` - List equipment
- `POST /api/equipment` - Add equipment
- `POST /api/equipment/usage` - Record usage
- `POST /api/equipment/maintenance` - Log maintenance

### Warehouse
- `GET /api/warehouse` - List warehouses
- `POST /api/warehouse` - Create warehouse
- `GET /api/warehouse/inventory` - View inventory
- `POST /api/warehouse/transfer` - Create stock transfer
- `POST /api/warehouse/adjustment` - Record adjustment

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Log expense
- `PUT /api/expenses/:id` - Update expense
- `GET /api/expenses/reports` - Generate reports

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Intuitive Navigation**: Sidebar with role-based menu items
- **Real-time Updates**: Instant feedback on actions
- **Status Indicators**: Color-coded badges for quick status recognition
- **Search & Filter**: Easy data discovery
- **Toast Notifications**: User-friendly feedback messages
- **Loading States**: Smooth loading indicators
- **Empty States**: Helpful messages when no data exists

## 📈 Future Enhancements

- [ ] Daily log reports with weather tracking
- [ ] Advanced analytics & charts
- [ ] File upload for receipts/invoices
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced permission customization
- [ ] Backup & restore functionality
- [ ] Multi-language support

## 🐛 Troubleshooting

### Backend not connecting to MongoDB
- Check your MongoDB connection string in `.env`
- Ensure MongoDB service is running
- Verify network connectivity

### Frontend cannot reach backend
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify API_URL in frontend (should be http://localhost:5000/api)

### Port already in use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

## 📝 Development Notes

### Database Seeding
Run `npm run seed` in the backend directory to populate the database with demo users.

### Environment Variables
Backend `.env` file includes:
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRES_IN`: Token expiration time
- `CORS_ORIGIN`: Allowed frontend origin

## 👥 Contributing

This project was built as a comprehensive construction management solution. Feel free to fork and customize for your needs.

## 📄 License

ISC License

## 🙏 Acknowledgments

Built with modern web technologies to provide a complete solution for construction project management.

---

**Ready to use!** 🎉

Start both servers and login with any of the demo credentials above to explore the full Construction Management System.
