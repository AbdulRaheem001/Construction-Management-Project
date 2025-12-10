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
  avgUnitCost: number;
  currentStock: number;
  reorderPoint: number;
  supplier?: string;
  images?: string[];
  isActive: boolean;
  totalValue?: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  project: Project | string;
  vendor?: any;
  supplier: string;
  items: POItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Received' | 'Partially Received' | 'Cancelled';
  paymentStatus: 'Pending' | 'Partial' | 'Paid';
  orderDate: string;
  expectedDelivery?: string;
  receivedAt?: string;
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
  project?: Project | string;
}

export interface Inventory {
  _id: string;
  material: Material | string;
  location: Project | Warehouse | string;
  locationType: 'Project' | 'Warehouse';
  quantity: number;
  binLocation?: string;
  lastUpdated: string;
  updatedBy?: User;
}

export interface StockTransferItem {
  material: Material | string;
  quantity: number;
}

export interface StockTransfer {
  _id: string;
  transferNumber: string;
  fromLocation: Project | Warehouse | string;
  fromLocationType: 'Project' | 'Warehouse';
  toLocation: Project | Warehouse | string;
  toLocationType: 'Project' | 'Warehouse';
  items: StockTransferItem[];
  status: 'Pending' | 'In Transit' | 'Received' | 'Cancelled';
  transferDate: string;
  receivedDate?: string;
  requestedBy: User;
  approvedBy?: User;
  receivedBy?: User;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  notes?: string;
  paidBy?: User;
}

export interface Expense {
  _id: string;
  expenseNumber: string;
  project?: Project | string;
  category: string;
  expenseType: 'Material' | 'Labour' | 'Equipment' | 'General' | 'Overhead';
  amount: number;
  amountPaid?: number;
  paymentHistory?: PaymentHistory[];
  description: string;
  date: string;
  paymentStatus: 'Pending' | 'Paid' | 'Partially Paid' | 'Overdue';
  paymentMethod?: string;
  paymentDate?: string;
  vendor?: string;
  invoiceNumber?: string;
  images?: string[];
  notes?: string;
  createdBy: User;
  approvedBy?: User;
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

export interface MaterialIssue {
  _id: string;
  project: Project | string;
  material: Material | string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  issueDate: string;
  issuedBy: User;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialConsumption {
  _id: string;
  consumptionNumber: string;
  project: Project | string;
  material: Material | string;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  date: string;
  purpose?: string;
  consumedBy: User;
  usedBy?: string;
  issuedFrom?: 'Warehouse' | 'Project';
  warehouseId?: Warehouse | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
