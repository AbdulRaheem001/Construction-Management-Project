# Role-Based Access Control (RBAC) Implementation

## Overview
The Construction Management System now has **strict Administrator-only access** for all CREATE, UPDATE, and DELETE operations. Other roles (Site Manager, Accountant, Labourer) can only VIEW data according to their permissions.

## Backend Changes

### 1. Route Protection (All Modules)
All backend routes have been updated to enforce Administrator-only access for modifications:

#### **Projects** (`backend/src/routes/project.routes.ts`)
- ✅ **Create Project**: Administrator only
- ✅ **Update Project**: Administrator only
- ✅ **Delete Project**: Administrator only
- ✅ **View Projects**: All authenticated users

#### **Materials** (`backend/src/routes/material.routes.ts`)
- ✅ **Create Material**: Administrator only
- ✅ **Update Material**: Administrator only
- ✅ **Create Purchase Order**: Administrator only
- ✅ **Approve PO**: Administrator only
- ✅ **Create Goods Receipt**: Administrator only
- ✅ **Record Material Consumption**: Administrator only
- ✅ **View Materials/POs/Consumption**: All authenticated users

#### **Equipment** (`backend/src/routes/equipment.routes.ts`)
- ✅ **Create Equipment**: Administrator only
- ✅ **Update Equipment**: Administrator only
- ✅ **Record Usage**: Administrator only
- ✅ **Schedule Maintenance**: Administrator only
- ✅ **Update Maintenance**: Administrator only
- ✅ **View Equipment/Usage/Maintenance**: All authenticated users

#### **Warehouse** (`backend/src/routes/warehouse.routes.ts`)
- ✅ **Create Warehouse**: Administrator only
- ✅ **Create Stock Transfer**: Administrator only
- ✅ **Approve Transfer**: Administrator only
- ✅ **Receive Transfer**: Administrator only
- ✅ **Create Inventory Adjustment**: Administrator only
- ✅ **Approve Adjustment**: Administrator only
- ✅ **View Warehouses/Transfers/Inventory**: All authenticated users

#### **Labour** (`backend/src/routes/labour.routes.ts`)
- ✅ **Create Employee**: Administrator only
- ✅ **Update Employee**: Administrator only
- ✅ **Approve Timesheet**: Administrator only
- ✅ **Reject Timesheet**: Administrator only
- ✅ **Create Timesheet**: All users (for own timesheet)
- ✅ **View Payroll**: Administrator + Accountant only
- ✅ **View Employees/Timesheets**: All authenticated users

#### **Expenses** (`backend/src/routes/expense.routes.ts`)
- ✅ **Create Expense**: Administrator only
- ✅ **Update Expense**: Administrator only
- ✅ **Approve Expense**: Administrator only
- ✅ **View Financial Reports**: Administrator + Accountant
- ✅ **View Expenses**: All authenticated users

### 2. Authorization Middleware
The `authorize` middleware in `backend/src/middleware/auth.ts` enforces role checks:

```typescript
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
```

## Frontend Changes

### 1. Permission System (`frontend/src/utils/permissions.ts`)
Updated permissions object to reflect Administrator-only access:

```typescript
export const permissions: Record<string, UserRole[]> = {
  // All CREATE/EDIT/DELETE operations - Administrator only
  createProject: ['Administrator'],
  editProject: ['Administrator'],
  createMaterial: ['Administrator'],
  editMaterial: ['Administrator'],
  createEmployee: ['Administrator'],
  editEmployee: ['Administrator'],
  createEquipment: ['Administrator'],
  editEquipment: ['Administrator'],
  createWarehouse: ['Administrator'],
  createExpense: ['Administrator'],
  
  // VIEW permissions - Role-based
  viewProject: ['Administrator', 'Site Manager', 'Accountant'],
  viewMaterial: ['Administrator', 'Site Manager', 'Accountant'],
  viewEquipment: ['Administrator', 'Site Manager', 'Accountant'],
  viewWarehouse: ['Administrator', 'Site Manager', 'Accountant'],
  viewExpense: ['Administrator', 'Site Manager', 'Accountant'],
  
  // Special permissions
  viewPayRate: ['Administrator', 'Accountant'],
  viewFinancialReports: ['Administrator', 'Accountant'],
  generatePayroll: ['Administrator', 'Accountant'],
};
```

### 2. PermissionGuard Component (`frontend/src/components/PermissionGuard.tsx`)
New reusable component to conditionally show/hide UI elements based on permissions:

```typescript
<PermissionGuard permission="createProject" showMessage>
  <button>New Project</button>
</PermissionGuard>
```

When user lacks permission and `showMessage={true}`:
- Shows: "🛡️ Administrator access required"
- Otherwise: Hides the content completely

### 3. Module Pages Updated
All module pages now use PermissionGuard:

- ✅ **Projects** (`frontend/src/pages/Projects.tsx`) - "New Project" button
- ✅ **Materials** (`frontend/src/pages/Materials.tsx`) - "New Material" and "New PO" buttons
- ✅ **Labour** (`frontend/src/pages/Labour.tsx`) - "Add Employee" / "New Timesheet" button
- ✅ **Equipment** (`frontend/src/pages/Equipment.tsx`) - "Add Equipment" button
- ✅ **Warehouse** (`frontend/src/pages/Warehouse.tsx`) - "Add Warehouse" / "Stock Transfer" button
- ✅ **Expenses** (`frontend/src/pages/Expenses.tsx`) - "New Expense" button

### 4. Dashboard (Same for All Roles)
The Dashboard (`frontend/src/pages/Dashboard.tsx`) displays the same information to all roles:
- ✅ Active Projects count
- ✅ Total Employees count
- ✅ Low Stock Items alert
- ✅ Monthly Expenses total
- ✅ Recent Projects list
- ✅ Quick Actions (with navigation)

All users can see the data, but only Administrators see action buttons in module pages.

## User Roles & Access Matrix

| Feature | Administrator | Site Manager | Accountant | Labourer |
|---------|--------------|--------------|------------|----------|
| **View Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Create/Edit Projects** | ✅ | ❌ | ❌ | ❌ |
| **View Projects** | ✅ | ✅ | ✅ | ❌ |
| **Create/Edit Materials** | ✅ | ❌ | ❌ | ❌ |
| **View Materials** | ✅ | ✅ | ✅ | ❌ |
| **Create/Edit Employees** | ✅ | ❌ | ❌ | ❌ |
| **View Employees** | ✅ | ✅ | ✅ | ✅ |
| **View Pay Rates** | ✅ | ❌ | ✅ | ❌ |
| **Submit Timesheet** | ✅ | ✅ | ❌ | ✅ |
| **Approve Timesheet** | ✅ | ❌ | ❌ | ❌ |
| **View Payroll** | ✅ | ❌ | ✅ | ❌ |
| **Create/Edit Equipment** | ✅ | ❌ | ❌ | ❌ |
| **View Equipment** | ✅ | ✅ | ✅ | ❌ |
| **Create/Edit Warehouse** | ✅ | ❌ | ❌ | ❌ |
| **View Warehouse** | ✅ | ✅ | ✅ | ❌ |
| **Create/Edit Expenses** | ✅ | ❌ | ❌ | ❌ |
| **View Expenses** | ✅ | ✅ | ✅ | ❌ |
| **View Financial Reports** | ✅ | ❌ | ✅ | ❌ |

## Demo User Credentials

```
Administrator:  admin@cms.com        / password
Site Manager:   manager@cms.com      / password
Accountant:     accountant@cms.com   / password
Labourer:       labourer@cms.com     / password
```

## Testing RBAC

### 1. Login as Administrator
- ✅ Should see all action buttons (New Project, New Material, Add Employee, etc.)
- ✅ Can successfully create/edit/delete any resource
- ✅ All API calls succeed

### 2. Login as Site Manager
- ✅ Should see "Administrator access required" message instead of action buttons
- ✅ Can view all projects, materials, equipment, expenses
- ✅ Can submit timesheets
- ✅ Cannot see "New Project", "New Material" buttons
- ✅ API calls to create/edit endpoints return 403 Forbidden

### 3. Login as Accountant
- ✅ Should see "Administrator access required" message
- ✅ Can view financial reports and payroll
- ✅ Can view pay rates
- ✅ Cannot create/edit any resource
- ✅ API calls to create/edit endpoints return 403 Forbidden

### 4. Login as Labourer
- ✅ Should see "Administrator access required" message
- ✅ Can only view dashboard
- ✅ Can submit own timesheet
- ✅ Cannot access most modules
- ✅ Very limited permissions

## Security Implementation

### Backend Security
1. ✅ **JWT Authentication** - All routes require valid token
2. ✅ **Role Authorization** - `authorize()` middleware on all sensitive endpoints
3. ✅ **403 Forbidden** - Returns proper HTTP error for unauthorized access
4. ✅ **User Context** - `req.user` contains authenticated user info

### Frontend Security
1. ✅ **Permission Checks** - UI hides unauthorized actions
2. ✅ **Token Storage** - JWT stored in localStorage
3. ✅ **Auth State** - Zustand store manages authentication
4. ✅ **Protected Routes** - ProtectedRoute component guards pages
5. ✅ **Visual Feedback** - Shows "Administrator access required" message

## Remaining Features from README

The following features from README.md still need implementation:

### High Priority (Core Features Missing)
- ❌ **Daily Logs (DLR)** - Site managers create daily reports (SITE-03)
- ❌ **Goods Receipt UI** - Record goods against PO (MAT-03)
- ❌ **Timesheet Approval UI** - Approve/reject timesheets (LAB-03)
- ❌ **Payroll Report Export** - CSV export of payroll (LAB-04)
- ❌ **Stock Transfer UI** - Warehouse-to-Site transfers (WAR-02)
- ❌ **Inventory Adjustments UI** - Record breakage/theft (WAR-03)

### Medium Priority (Enhanced Features)
- ❌ **File Upload** - Attach invoices/receipts to expenses (EXP-02)
- ❌ **Low Stock Alerts** - Automated notifications (MAT-05)
- ❌ **Budget Tracking** - Real-time budget utilization (SITE-02)
- ❌ **Equipment Maintenance Log** - Track maintenance history (EQU-04)
- ❌ **Physical Inventory Count** - Warehouse stock verification (WAR-04)

### Low Priority (Reports & Analytics)
- ❌ **Project Summary Reports** - Aggregate costs by category (SITE-04)
- ❌ **Financial Reports** - Trial Balance, P&L, Cash Flow (EXP-05)
- ❌ **COGS Calculation** - Automatic cost tracking (EXP-04)

## Next Steps

1. **Test RBAC thoroughly** with all 4 user roles
2. **Implement Create/Edit Forms** for each module (Administrator only)
3. **Add Daily Logs feature** (high priority per README)
4. **Build Timesheet approval workflow**
5. **Implement file upload for expenses**
6. **Create comprehensive reports**

## Files Changed

### Backend
- `backend/src/routes/project.routes.ts`
- `backend/src/routes/material.routes.ts`
- `backend/src/routes/equipment.routes.ts`
- `backend/src/routes/warehouse.routes.ts`
- `backend/src/routes/labour.routes.ts`
- `backend/src/routes/expense.routes.ts`

### Frontend
- `frontend/src/utils/permissions.ts`
- `frontend/src/components/PermissionGuard.tsx` (NEW)
- `frontend/src/pages/Projects.tsx`
- `frontend/src/pages/Materials.tsx`
- `frontend/src/pages/Labour.tsx`
- `frontend/src/pages/Equipment.tsx`
- `frontend/src/pages/Warehouse.tsx`
- `frontend/src/pages/Expenses.tsx`
- `frontend/src/App.tsx` (auth initialization fix)
- `frontend/src/components/ProtectedRoute.tsx`

## Servers Running

✅ **Backend**: http://localhost:5000
✅ **Frontend**: http://localhost:5173

Both servers are running and ready for testing!
