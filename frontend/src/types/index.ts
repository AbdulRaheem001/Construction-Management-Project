export const UserRole = {
  ADMINISTRATOR: 'Administrator',
  SITE_MANAGER: 'Site Manager',
  ACCOUNTANT: 'Accountant',
  LABOURER: 'Labourer',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  contact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  projectCode: string;
  projectName: string;
  client: string;
  location: string;
  startDate: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  initialBudget: number;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  description?: string;
  manager?: User;
  siteManager?: User;
  totalExpenses?: number;
  budgetUtilization?: number;
}

export interface Material {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  costPerUnit: number;
  reorderPoint: number;
  supplier?: string;
  isActive: boolean;
  currentStock?: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  project: Project | string;
  supplier: string;
  items: POItem[];
  totalAmount: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Partially Received' | 'Fully Received' | 'Cancelled';
  orderDate: string;
  expectedDelivery?: string;
  notes?: string;
  createdBy: User;
  approvedBy?: User;
  approvedAt?: string;
}

export interface POItem {
  material: Material | string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  role: string;
  payRate: number;
  team?: string;
  contactInfo?: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

export interface Timesheet {
  _id: string;
  employee: Employee | string;
  project: Project | string;
  date: string;
  hoursWorked: number;
  task: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  approvedBy?: User;
  notes?: string;
}

export interface Equipment {
  _id: string;
  assetId: string;
  name: string;
  make?: string;
  model?: string;
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  status: 'Available' | 'In Use' | 'Under Maintenance' | 'Retired';
  location: string;
  locationType: 'Project' | 'Warehouse';
}

export interface Warehouse {
  _id: string;
  code: string;
  name: string;
  location: string;
  capacity: number;
  manager?: User;
  isActive: boolean;
}

export interface Inventory {
  _id: string;
  material: Material | string;
  location: string;
  locationType: 'Project' | 'Warehouse';
  quantity: number;
  binLocation?: string;
  lastUpdated: string;
}

export interface Expense {
  _id: string;
  expenseNumber: string;
  project?: Project | string;
  category: 'Material' | 'Labour' | 'Equipment' | 'General' | 'Overhead';
  amount: number;
  description: string;
  date: string;
  paymentStatus: 'Pending' | 'Paid' | 'Overdue';
  paymentMethod?: string;
  paymentDate?: string;
  attachments?: string[];
  createdBy: User;
}

export interface DailyLog {
  _id: string;
  project: Project | string;
  date: string;
  weather: string;
  progressSummary: string;
  activities: string[];
  safetyIncidents?: string;
  workersPresent: number;
  equipmentUsed?: string[];
  materialsReceived?: string[];
  remarks?: string;
  createdBy: User;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalEmployees: number;
  lowStockMaterials: number;
  pendingPOs: number;
  pendingTimesheets: number;
  totalExpenses: number;
  monthlyExpenses: number;
}
