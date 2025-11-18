import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import materialRoutes from './routes/material.routes';
import labourRoutes from './routes/labour.routes';
import equipmentRoutes from './routes/equipment.routes';
import warehouseRoutes from './routes/warehouse.routes';
import expenseRoutes from './routes/expense.routes';
import dailyLogRoutes from './routes/dailyLog.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import materialIssueRoutes from './routes/materialIssue.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(compression()); // Compress responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'CMS Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/daily-logs', dailyLogRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/material-issues', materialIssueRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crm';
  console.log('🔄 Attempting to connect to MongoDB...');
  console.log('📍 MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password in logs
  
  await mongoose.connect(mongoURI);
  
  console.log('✅ MongoDB connected successfully!');
  console.log('📦 Database:', mongoose.connection.name);
  logger.info('MongoDB connected successfully');
};

// Start server
const startServer = async () => {
  console.log('🚀 Starting Construction Management System Backend...');
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  console.log('🌐 Port:', PORT);
  console.log('');
  
  // Try to connect to MongoDB, but don't exit if it fails
  try {
    await connectDB();
  } catch (error) {
    console.log('⚠️  Server starting WITHOUT database connection');
    console.log('💡 The server will run, but database operations will fail');
    console.log('');
  }
  
  app.listen(PORT, () => {
    console.log('');
    console.log('✨ Server is running successfully!');
    console.log('📍 Local URL: http://localhost:' + PORT);
    console.log('🏥 Health Check: http://localhost:' + PORT + '/api/health');
    console.log('');
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

export default app;
