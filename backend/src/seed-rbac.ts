import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Permission from './models/Permission.model';
import Role from './models/Role.model';
import User from './models/User.model';
import { UserRole } from './types/user.types';

dotenv.config();

const PERMISSIONS = [
  // Projects Module
  { name: 'View Projects', code: 'VIEW_PROJECTS', module: 'Projects', description: 'Can view all projects' },
  { name: 'Create Projects', code: 'CREATE_PROJECTS', module: 'Projects', description: 'Can create new projects' },
  { name: 'Edit Projects', code: 'EDIT_PROJECTS', module: 'Projects', description: 'Can edit existing projects' },
  { name: 'Delete Projects', code: 'DELETE_PROJECTS', module: 'Projects', description: 'Can delete projects' },
  
  // Materials Module
  { name: 'View Materials', code: 'VIEW_MATERIALS', module: 'Materials', description: 'Can view all materials' },
  { name: 'Create Materials', code: 'CREATE_MATERIALS', module: 'Materials', description: 'Can add new materials' },
  { name: 'Edit Materials', code: 'EDIT_MATERIALS', module: 'Materials', description: 'Can edit material details' },
  { name: 'Delete Materials', code: 'DELETE_MATERIALS', module: 'Materials', description: 'Can delete materials' },
  { name: 'Manage Purchase Orders', code: 'MANAGE_PURCHASE_ORDERS', module: 'Materials', description: 'Can create and manage purchase orders' },
  { name: 'Manage Goods Receipt', code: 'MANAGE_GOODS_RECEIPT', module: 'Materials', description: 'Can receive goods and update inventory' },
  
  // Labour Module
  { name: 'View Employees', code: 'VIEW_EMPLOYEES', module: 'Labour', description: 'Can view employee list' },
  { name: 'Create Employees', code: 'CREATE_EMPLOYEES', module: 'Labour', description: 'Can add new employees' },
  { name: 'Edit Employees', code: 'EDIT_EMPLOYEES', module: 'Labour', description: 'Can edit employee details' },
  { name: 'Delete Employees', code: 'DELETE_EMPLOYEES', module: 'Labour', description: 'Can delete employees' },
  { name: 'Manage Timesheets', code: 'MANAGE_TIMESHEETS', module: 'Labour', description: 'Can manage employee timesheets' },
  { name: 'View Payroll', code: 'VIEW_PAYROLL', module: 'Labour', description: 'Can view payroll information' },
  
  // Equipment Module
  { name: 'View Equipment', code: 'VIEW_EQUIPMENT', module: 'Equipment', description: 'Can view equipment list' },
  { name: 'Create Equipment', code: 'CREATE_EQUIPMENT', module: 'Equipment', description: 'Can add new equipment' },
  { name: 'Edit Equipment', code: 'EDIT_EQUIPMENT', module: 'Equipment', description: 'Can edit equipment details' },
  { name: 'Delete Equipment', code: 'DELETE_EQUIPMENT', module: 'Equipment', description: 'Can delete equipment' },
  { name: 'Manage Maintenance', code: 'MANAGE_MAINTENANCE', module: 'Equipment', description: 'Can schedule and track maintenance' },
  { name: 'Track Equipment Usage', code: 'TRACK_EQUIPMENT_USAGE', module: 'Equipment', description: 'Can log equipment usage' },
  
  // Warehouse Module
  { name: 'View Warehouses', code: 'VIEW_WAREHOUSES', module: 'Warehouse', description: 'Can view warehouse list' },
  { name: 'Create Warehouses', code: 'CREATE_WAREHOUSES', module: 'Warehouse', description: 'Can create new warehouses' },
  { name: 'Edit Warehouses', code: 'EDIT_WAREHOUSES', module: 'Warehouse', description: 'Can edit warehouse details' },
  { name: 'Delete Warehouses', code: 'DELETE_WAREHOUSES', module: 'Warehouse', description: 'Can delete warehouses' },
  { name: 'View Inventory', code: 'VIEW_INVENTORY', module: 'Warehouse', description: 'Can view inventory levels' },
  { name: 'Manage Stock Transfers', code: 'MANAGE_STOCK_TRANSFERS', module: 'Warehouse', description: 'Can transfer stock between warehouses' },
  { name: 'Adjust Inventory', code: 'ADJUST_INVENTORY', module: 'Warehouse', description: 'Can make inventory adjustments' },
  
  // Expenses Module
  { name: 'View Expenses', code: 'VIEW_EXPENSES', module: 'Expenses', description: 'Can view expense records' },
  { name: 'Create Expenses', code: 'CREATE_EXPENSES', module: 'Expenses', description: 'Can record new expenses' },
  { name: 'Edit Expenses', code: 'EDIT_EXPENSES', module: 'Expenses', description: 'Can edit expense details' },
  { name: 'Delete Expenses', code: 'DELETE_EXPENSES', module: 'Expenses', description: 'Can delete expenses' },
  { name: 'Approve Expenses', code: 'APPROVE_EXPENSES', module: 'Expenses', description: 'Can approve expense claims' },
  
  // Users Module
  { name: 'View Users', code: 'VIEW_USERS', module: 'Users', description: 'Can view user list' },
  { name: 'Create Users', code: 'CREATE_USERS', module: 'Users', description: 'Can create new users' },
  { name: 'Edit Users', code: 'EDIT_USERS', module: 'Users', description: 'Can edit user details' },
  { name: 'Delete Users', code: 'DELETE_USERS', module: 'Users', description: 'Can delete users' },
  { name: 'Assign Roles', code: 'ASSIGN_ROLES', module: 'Users', description: 'Can assign roles to users' },
  
  // Roles Module
  { name: 'View Roles', code: 'VIEW_ROLES', module: 'Roles', description: 'Can view roles list' },
  { name: 'Create Roles', code: 'CREATE_ROLES', module: 'Roles', description: 'Can create new roles' },
  { name: 'Edit Roles', code: 'EDIT_ROLES', module: 'Roles', description: 'Can edit role details' },
  { name: 'Delete Roles', code: 'DELETE_ROLES', module: 'Roles', description: 'Can delete roles' },
  { name: 'Assign Permissions', code: 'ASSIGN_PERMISSIONS', module: 'Roles', description: 'Can assign permissions to roles' },
  
  // System Module
  { name: 'View Audit Logs', code: 'VIEW_AUDIT_LOGS', module: 'System', description: 'Can view system audit logs' },
  { name: 'View Reports', code: 'VIEW_REPORTS', module: 'System', description: 'Can view system reports' },
  { name: 'System Settings', code: 'SYSTEM_SETTINGS', module: 'System', description: 'Can modify system settings' },
];

const seedRBACSystem = async () => {
  try {
    console.log('🌱 Starting RBAC System Seed...\n');

    // Connect to MongoDB
    const mongoURI = 'mongodb+srv://femonaofficials:Z7EiKSQV0usvHIGP@cluster0.aydpswq.mongodb.net/crm';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing permissions and roles...');
    await Permission.deleteMany({});
    await Role.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create Permissions
    console.log('📝 Creating permissions...');
    const createdPermissions = await Permission.insertMany(PERMISSIONS);
    console.log(`✅ Created ${createdPermissions.length} permissions\n`);

    // Create permission code to ID map
    const permissionMap = createdPermissions.reduce((acc: any, perm) => {
      acc[perm.code] = perm._id;
      return acc;
    }, {});

    // Define Roles with their permissions
    const ROLES = [
      {
        name: 'Administrator',
        code: 'ADMINISTRATOR',
        description: 'Full system access with all permissions',
        isSystem: true,
        permissions: createdPermissions.map(p => p._id), // All permissions
      },
      {
        name: 'Site Manager',
        code: 'SITE_MANAGER',
        description: 'Manage projects, materials, labour, and equipment on site',
        isSystem: true,
        permissions: [
          // Projects
          permissionMap.VIEW_PROJECTS,
          permissionMap.CREATE_PROJECTS,
          permissionMap.EDIT_PROJECTS,
          // Materials
          permissionMap.VIEW_MATERIALS,
          permissionMap.CREATE_MATERIALS,
          permissionMap.MANAGE_PURCHASE_ORDERS,
          permissionMap.MANAGE_GOODS_RECEIPT,
          // Labour
          permissionMap.VIEW_EMPLOYEES,
          permissionMap.CREATE_EMPLOYEES,
          permissionMap.EDIT_EMPLOYEES,
          permissionMap.MANAGE_TIMESHEETS,
          // Equipment
          permissionMap.VIEW_EQUIPMENT,
          permissionMap.CREATE_EQUIPMENT,
          permissionMap.EDIT_EQUIPMENT,
          permissionMap.MANAGE_MAINTENANCE,
          permissionMap.TRACK_EQUIPMENT_USAGE,
          // Warehouse
          permissionMap.VIEW_WAREHOUSES,
          permissionMap.VIEW_INVENTORY,
          permissionMap.MANAGE_STOCK_TRANSFERS,
          // Expenses
          permissionMap.VIEW_EXPENSES,
          permissionMap.CREATE_EXPENSES,
        ],
      },
      {
        name: 'Accountant',
        code: 'ACCOUNTANT',
        description: 'Manage finances, expenses, and view reports',
        isSystem: true,
        permissions: [
          // View all modules
          permissionMap.VIEW_PROJECTS,
          permissionMap.VIEW_MATERIALS,
          permissionMap.VIEW_EMPLOYEES,
          permissionMap.VIEW_EQUIPMENT,
          permissionMap.VIEW_WAREHOUSES,
          permissionMap.VIEW_INVENTORY,
          // Expenses (full access)
          permissionMap.VIEW_EXPENSES,
          permissionMap.CREATE_EXPENSES,
          permissionMap.EDIT_EXPENSES,
          permissionMap.APPROVE_EXPENSES,
          // Labour
          permissionMap.VIEW_PAYROLL,
          // Materials
          permissionMap.MANAGE_PURCHASE_ORDERS,
          // System
          permissionMap.VIEW_REPORTS,
          permissionMap.VIEW_AUDIT_LOGS,
        ],
      },
      {
        name: 'Labourer',
        code: 'LABOURER',
        description: 'Basic access to view assigned projects and log work',
        isSystem: true,
        permissions: [
          permissionMap.VIEW_PROJECTS,
          permissionMap.VIEW_MATERIALS,
          permissionMap.VIEW_EQUIPMENT,
        ],
      },
    ];

    // Create Roles
    console.log('👥 Creating roles...');
    const createdRoles = await Role.insertMany(ROLES);
    console.log(`✅ Created ${createdRoles.length} roles\n`);

    // Update existing users to have roles array
    console.log('🔄 Migrating existing users to new RBAC system...');
    const users = await User.find({});
    
    const roleMap: any = {
      [UserRole.ADMINISTRATOR]: createdRoles.find(r => r.code === 'ADMINISTRATOR')?._id,
      [UserRole.SITE_MANAGER]: createdRoles.find(r => r.code === 'SITE_MANAGER')?._id,
      [UserRole.ACCOUNTANT]: createdRoles.find(r => r.code === 'ACCOUNTANT')?._id,
      [UserRole.LABOURER]: createdRoles.find(r => r.code === 'LABOURER')?._id,
    };

    for (const user of users) {
      const roleId = roleMap[user.role];
      if (roleId) {
        user.roles = [roleId];
        await user.save();
        console.log(`  ✓ Migrated ${user.email} (${user.role}) → Role ID: ${roleId}`);
      }
    }

    console.log(`✅ Migrated ${users.length} users\n`);

    // Print summary
    console.log('📊 RBAC System Summary:');
    console.log('═══════════════════════════════════════════════════\n');
    
    for (const role of createdRoles) {
      const populatedRole = await Role.findById(role._id).populate('permissions');
      console.log(`Role: ${populatedRole!.name} (${populatedRole!.code})`);
      console.log(`  Description: ${populatedRole!.description}`);
      console.log(`  Permissions: ${populatedRole!.permissions.length}`);
      console.log(`  System Role: ${populatedRole!.isSystem ? 'Yes' : 'No'}`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✨ RBAC System seeded successfully!\n');
    console.log('🎯 Next Steps:');
    console.log('  1. Restart your backend server');
    console.log('  2. Login with existing credentials');
    console.log('  3. Navigate to Roles page to manage roles');
    console.log('  4. Edit user roles in Users page\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding RBAC system:', error);
    process.exit(1);
  }
};

seedRBACSystem();
