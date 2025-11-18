import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model';
import Material from './models/Material.model';
import Project from './models/Project.model';
import Warehouse from './models/Warehouse.model';
import Employee from './models/Employee.model';
import Equipment from './models/Equipment.model';
import { UserRole } from './types/user.types';
import { logger } from './utils/logger';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Material.deleteMany({}),
      Project.deleteMany({}),
      Warehouse.deleteMany({}),
      Employee.deleteMany({}),
      Equipment.deleteMany({}),
    ]);

    // Create Users
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        email: 'admin@cms.com',
        password: 'Admin@123',
        name: 'System Administrator',
        role: UserRole.ADMINISTRATOR,
        contact: '+1-555-0001',
      },
      {
        email: 'manager@cms.com',
        password: 'Manager@123',
        name: 'John Smith',
        role: UserRole.SITE_MANAGER,
        contact: '+1-555-0002',
      },
      {
        email: 'accountant@cms.com',
        password: 'Account@123',
        name: 'Sarah Johnson',
        role: UserRole.ACCOUNTANT,
        contact: '+1-555-0003',
      },
      {
        email: 'worker@cms.com',
        password: 'Worker@123',
        name: 'Mike Wilson',
        role: UserRole.LABOURER,
        contact: '+1-555-0004',
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Warehouses
    console.log('🏭 Creating warehouses...');
    const warehouses = await Warehouse.create([
      {
        name: 'Main Warehouse',
        code: 'WH-001',
        location: '123 Industrial Ave, City',
        manager: users[0]._id,
        capacity: 10000,
      },
      {
        name: 'North Storage',
        code: 'WH-002',
        location: '456 North St, City',
        capacity: 5000,
      },
    ]);
    console.log(`✅ Created ${warehouses.length} warehouses`);

    // Create Projects
    console.log('🏗️  Creating projects...');
    const projects = await Project.create([
      {
        projectName: 'Downtown Office Complex',
        projectCode: 'PRJ-001',
        client: 'ABC Corporation',
        clientContact: '+1-555-1001',
        startDate: new Date('2024-01-15'),
        targetCompletionDate: new Date('2025-12-31'),
        initialBudget: 5000000,
        status: 'Active',
        location: '789 Downtown Ave, City',
        siteManager: users[1]._id,
        createdBy: users[0]._id,
      },
      {
        projectName: 'Residential Housing Development',
        projectCode: 'PRJ-002',
        client: 'XYZ Developers',
        clientContact: '+1-555-1002',
        startDate: new Date('2024-03-01'),
        targetCompletionDate: new Date('2025-06-30'),
        initialBudget: 3000000,
        status: 'Active',
        location: '321 Suburb Road, City',
        siteManager: users[1]._id,
        createdBy: users[0]._id,
      },
    ]);
    console.log(`✅ Created ${projects.length} projects`);

    // Create Materials
    console.log('📦 Creating materials...');
    const materials = await Material.create([
      {
        sku: 'CEM-001',
        name: 'Portland Cement',
        description: '50kg bags of Portland cement',
        unit: 'bags',
        costPerUnit: 8.50,
        reorderPoint: 100,
        category: 'Cement',
        supplier: 'BuildMart Supplies',
      },
      {
        sku: 'STL-001',
        name: 'Steel Rebar 12mm',
        description: '12mm diameter steel reinforcement bars',
        unit: 'tons',
        costPerUnit: 750,
        reorderPoint: 5,
        category: 'Steel',
        supplier: 'MetalWorks Co',
      },
      {
        sku: 'BRK-001',
        name: 'Red Clay Bricks',
        description: 'Standard size red clay bricks',
        unit: 'pcs',
        costPerUnit: 0.50,
        reorderPoint: 5000,
        category: 'Bricks',
        supplier: 'Brick Factory Ltd',
      },
    ]);
    console.log(`✅ Created ${materials.length} materials`);

    // Create Employees
    console.log('👷 Creating employees...');
    const employees = await Employee.create([
      {
        employeeId: 'EMP-001',
        name: 'Robert Brown',
        role: 'Foreman',
        payRate: 35,
        payType: 'Hourly',
        team: 'Team A',
        contact: '+1-555-2001',
        dateOfJoining: new Date('2023-01-15'),
      },
      {
        employeeId: 'EMP-002',
        name: 'James Miller',
        role: 'Mason',
        payRate: 28,
        payType: 'Hourly',
        team: 'Team A',
        contact: '+1-555-2002',
        dateOfJoining: new Date('2023-03-01'),
      },
    ]);
    console.log(`✅ Created ${employees.length} employees`);

    // Create Equipment
    console.log('🚜 Creating equipment...');
    const equipment = await Equipment.create([
      {
        assetId: 'EQ-001',
        name: 'Excavator',
        makeModel: 'CAT 320D',
        category: 'Heavy Machinery',
        purchaseDate: new Date('2022-06-15'),
        purchaseValue: 250000,
        currentValue: 220000,
        condition: 'Good',
        location: warehouses[0]._id,
        locationType: 'Warehouse',
        serialNumber: 'CAT320D2022001',
      },
    ]);
    console.log(`✅ Created ${equipment.length} equipment`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📝 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Administrator: admin@cms.com / Admin@123');
    console.log('Site Manager: manager@cms.com / Manager@123');
    console.log('Accountant: accountant@cms.com / Account@123');
    console.log('Labourer: worker@cms.com / Worker@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
