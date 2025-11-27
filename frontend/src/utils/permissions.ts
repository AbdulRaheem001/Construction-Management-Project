import type { UserRole } from '../types';

export const permissions: Record<string, UserRole[]> = {
  // Project permissions - ONLY Administrator can create/edit/delete
  createProject: ['Administrator'],
  editProject: ['Administrator'],
  viewProject: ['Administrator', 'Site Manager', 'Accountant'],
  deleteProject: ['Administrator'],
  
  // Material permissions - ONLY Administrator
  createMaterial: ['Administrator'],
  editMaterial: ['Administrator'],
  viewMaterial: ['Administrator', 'Site Manager', 'Accountant'],
  approvePO: ['Administrator'],
  
  // Labour permissions - ONLY Administrator for management
  viewPayRate: ['Administrator', 'Accountant'],
  approveTimesheet: ['Administrator'],
  createTimesheet: ['Administrator', 'Site Manager', 'Labourer'],
  createEmployee: ['Administrator'],
  editEmployee: ['Administrator'],
  generatePayroll: ['Administrator', 'Accountant'],
  
  // Equipment permissions - ONLY Administrator
  createEquipment: ['Administrator'],
  editEquipment: ['Administrator'],
  viewEquipment: ['Administrator', 'Site Manager', 'Accountant'],
  
  // Warehouse permissions - ONLY Administrator
  createWarehouse: ['Administrator'],
  editWarehouse: ['Administrator'],
  viewWarehouse: ['Administrator', 'Site Manager', 'Accountant'],
  
  // Vendor permissions - ONLY Administrator
  createVendor: ['Administrator'],
  editVendor: ['Administrator'],
  viewVendor: ['Administrator', 'Site Manager', 'Accountant'],
  
  // Expense permissions - Administrator and Site Manager can update
  createExpense: ['Administrator'],
  editExpense: ['Administrator'],
  updateExpense: ['Administrator', 'Site Manager'],
  viewExpense: ['Administrator', 'Site Manager', 'Accountant'],
  approveExpense: ['Administrator'],
  viewFinancialReports: ['Administrator', 'Accountant'],
  
  // User management - ONLY Administrator
  manageUsers: ['Administrator'],
  
  // Role management - ONLY Administrator
  createRoles: ['Administrator'],
  editRoles: ['Administrator'],
  deleteRoles: ['Administrator'],
  viewRoles: ['Administrator'],
};

export const hasPermission = (userRole: UserRole, permission: keyof typeof permissions): boolean => {
  return permissions[permission].includes(userRole);
};

export const canAccessModule = (userRole: UserRole, module: string): boolean => {
  switch (module) {
    case 'dashboard':
      return true; // All users can access dashboard
    case 'projects':
      return hasPermission(userRole, 'viewProject');
    case 'materials':
      return hasPermission(userRole, 'viewMaterial');
    case 'labour':
      return userRole !== 'Labourer' || hasPermission(userRole, 'createTimesheet');
    case 'equipment':
      return hasPermission(userRole, 'viewEquipment');
    case 'warehouse':
      return hasPermission(userRole, 'viewWarehouse');
    case 'vendors':
      return hasPermission(userRole, 'viewVendor');
    case 'expenses':
      return hasPermission(userRole, 'viewExpense');
    case 'users':
      return hasPermission(userRole, 'manageUsers');
    case 'roles':
      return hasPermission(userRole, 'viewRoles');
    default:
      return false;
  }
};
