import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model';
import { UserRole } from './types/user.types';
import { logger } from './utils/logger';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = 'mongodb+srv://femonaofficials:Z7EiKSQV0usvHIGP@cluster0.aydpswq.mongodb.net/crm';
    await mongoose.connect(mongoURI);
    logger.info('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // logger.info('Cleared existing users');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@cms.com' });
    if (!adminExists) {
      await User.create({
        email: 'admin@cms.com',
        password: 'password',
        name: 'System Administrator',
        role: UserRole.ADMINISTRATOR,
        contact: '+1234567890',
        isActive: true,
      });
      logger.info('Admin user created');
    } else {
      logger.info('Admin user already exists');
    }

    // Create site manager
    const managerExists = await User.findOne({ email: 'manager@cms.com' });
    if (!managerExists) {
      await User.create({
        email: 'manager@cms.com',
        password: 'password',
        name: 'Site Manager',
        role: UserRole.SITE_MANAGER,
        contact: '+1234567891',
        isActive: true,
      });
      logger.info('Site Manager user created');
    }

    // Create accountant
    const accountantExists = await User.findOne({ email: 'accountant@cms.com' });
    if (!accountantExists) {
      await User.create({
        email: 'accountant@cms.com',
        password: 'password',
        name: 'Accountant User',
        role: UserRole.ACCOUNTANT,
        contact: '+1234567892',
        isActive: true,
      });
      logger.info('Accountant user created');
    }

    // Create labourer
    const labourerExists = await User.findOne({ email: 'labourer@cms.com' });
    if (!labourerExists) {
      await User.create({
        email: 'labourer@cms.com',
        password: 'password',
        name: 'Labourer User',
        role: UserRole.LABOURER,
        contact: '+1234567893',
        isActive: true,
      });
      logger.info('Labourer user created');
    }

    logger.info('Seed data completed successfully!');
    logger.info('\nDemo Credentials:');
    logger.info('Admin: admin@cms.com / password');
    logger.info('Site Manager: manager@cms.com / password');
    logger.info('Accountant: accountant@cms.com / password');
    logger.info('Labourer: labourer@cms.com / password');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
