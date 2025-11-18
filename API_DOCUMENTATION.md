# Construction Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require JWT authentication.
Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles & Permissions
- **Administrator**: Full access to all modules
- **Site Manager**: Manage projects, approve timesheets, manage inventory
- **Accountant**: Manage finances, payroll, approve expenses  
- **Labourer**: View assigned projects, submit timesheets

---

## 1. Authentication

### POST `/auth/register`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "name": "John Doe",
  "role": "Site Manager",
  "contact": "+1-555-0123"
}
```

### POST `/auth/login`
Login and receive JWT token
```json
{
  "email": "admin@cms.com",
  "password": "Admin@123"
}
```

---

## 2. Projects

### POST `/projects`
Create a new project (Admin, Site Manager)
```json
{
  "projectName": "Office Building",
  "projectCode": "PRJ-001",
  "client": "ABC Corp",
  "startDate": "2024-01-01",
  "targetCompletionDate": "2025-12-31",
  "initialBudget": 5000000,
  "location": "Downtown"
}
```

### GET `/projects`
Get all projects (with optional filters)
- Query params: `status`, `siteManager`, `search`

### GET `/projects/:id`
Get project details with budget breakdown

### GET `/projects/:id/summary`
Get project summary report

### PUT `/projects/:id`
Update project (Admin, Site Manager)

### DELETE `/projects/:id`
Soft delete project (Admin only)

---

## 3. Materials

### POST `/materials/materials`
Create material (Admin, Accountant)
```json
{
  "sku": "CEM-001",
  "name": "Portland Cement",
  "unit": "bags",
  "costPerUnit": 8.50,
  "reorderPoint": 100,
  "category": "Cement"
}
```

### GET `/materials/materials`
Get all materials
- Query params: `category`, `search`, `lowStock`

### POST `/materials/purchase-orders`
Create purchase order
```json
{
  "poNumber": "PO-2024-001",
  "project": "project_id",
  "supplier": "Supplier Name",
  "items": [
    {
      "material": "material_id",
      "quantity": 100,
      "unitPrice": 8.50,
      "totalPrice": 850
    }
  ],
  "totalAmount": 850,
  "orderDate": "2024-01-15"
}
```

### PUT `/materials/purchase-orders/:id/approve`
Approve purchase order (Admin, Accountant)

### POST `/materials/goods-receipts`
Record goods receipt
```json
{
  "grNumber": "GR-2024-001",
  "purchaseOrder": "po_id",
  "items": [
    {
      "material": "material_id",
      "orderedQuantity": 100,
      "receivedQuantity": 98,
      "damagedQuantity": 2
    }
  ],
  "destination": "project_or_warehouse_id",
  "destinationType": "Project",
  "status": "Complete"
}
```

### POST `/materials/consumption`
Record material consumption
```json
{
  "consumptionNumber": "CON-2024-001",
  "project": "project_id",
  "material": "material_id",
  "quantity": 50,
  "purpose": "Foundation work"
}
```

---

## 4. Labour Management

### POST `/labour/employees`
Create employee (Admin, Accountant)
```json
{
  "employeeId": "EMP-001",
  "name": "John Doe",
  "role": "Mason",
  "payRate": 28,
  "payType": "Hourly",
  "contact": "+1-555-0001"
}
```

### GET `/labour/employees`
Get all employees
- Query params: `team`, `role`, `search`

### POST `/labour/timesheets`
Submit timesheet
```json
{
  "employee": "employee_id",
  "project": "project_id",
  "date": "2024-01-15",
  "hoursWorked": 8,
  "task": "Bricklaying"
}
```

### GET `/labour/timesheets`
Get timesheets
- Query params: `employee`, `project`, `status`, `startDate`, `endDate`

### PUT `/labour/timesheets/:id/approve`
Approve timesheet (Admin, Site Manager)

### GET `/labour/payroll`
Get payroll report (Admin, Accountant)
- Query params: `project`, `startDate`, `endDate`

---

## 5. Equipment

### POST `/equipment`
Create equipment (Admin)
```json
{
  "assetId": "EQ-001",
  "name": "Excavator",
  "makeModel": "CAT 320D",
  "category": "Heavy Machinery",
  "purchaseDate": "2022-06-15",
  "purchaseValue": 250000,
  "currentValue": 220000,
  "location": "warehouse_id",
  "locationType": "Warehouse"
}
```

### GET `/equipment`
Get all equipment
- Query params: `category`, `condition`, `location`, `search`

### POST `/equipment/usage`
Record equipment usage
```json
{
  "equipment": "equipment_id",
  "project": "project_id",
  "startDate": "2024-01-15",
  "hoursUsed": 8,
  "costPerHour": 150,
  "totalCost": 1200
}
```

### POST `/equipment/maintenance`
Schedule maintenance
```json
{
  "equipment": "equipment_id",
  "maintenanceType": "Preventive",
  "scheduledDate": "2024-02-01",
  "cost": 500,
  "description": "Regular service"
}
```

---

## 6. Warehouse

### POST `/warehouse`
Create warehouse (Admin)
```json
{
  "name": "Main Warehouse",
  "code": "WH-001",
  "location": "123 Industrial Ave",
  "capacity": 10000
}
```

### POST `/warehouse/transfers`
Create stock transfer
```json
{
  "transferNumber": "TRN-2024-001",
  "fromLocation": "warehouse_id",
  "fromLocationType": "Warehouse",
  "toLocation": "project_id",
  "toLocationType": "Project",
  "items": [
    {
      "material": "material_id",
      "quantity": 100
    }
  ]
}
```

### PUT `/warehouse/transfers/:id/approve`
Approve stock transfer

### PUT `/warehouse/transfers/:id/receive`
Receive stock transfer

### POST `/warehouse/adjustments`
Create inventory adjustment
```json
{
  "adjustmentNumber": "ADJ-2024-001",
  "material": "material_id",
  "location": "warehouse_id",
  "locationType": "Warehouse",
  "adjustmentType": "Decrease",
  "quantity": 5,
  "reason": "Breakage",
  "explanation": "Damaged during handling"
}
```

### GET `/warehouse/inventory/report`
Get inventory report

---

## 7. Expenses

### POST `/expenses`
Create expense
```json
{
  "expenseNumber": "EXP-2024-001",
  "project": "project_id",
  "category": "Utilities",
  "expenseType": "General",
  "description": "Monthly electricity bill",
  "amount": 1500,
  "vendor": "Power Company",
  "paymentStatus": "Pending"
}
```

### GET `/expenses`
Get expenses
- Query params: `project`, `expenseType`, `category`, `paymentStatus`, `startDate`, `endDate`

### PUT `/expenses/:id/approve`
Approve expense (Admin, Accountant)

### GET `/expenses/reports/financial`
Get financial report (Admin, Accountant)

---

## 8. Daily Logs

### POST `/daily-logs`
Create daily log (Site Manager)
```json
{
  "project": "project_id",
  "date": "2024-01-15",
  "weather": "Sunny",
  "progress": "Foundation work completed",
  "activitiesCompleted": ["Excavation", "Formwork"],
  "workforcePresent": 25,
  "safetyIncidents": "None"
}
```

### GET `/daily-logs`
Get daily logs
- Query params: `project`, `startDate`, `endDate`

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "stack": "..."  // Only in development
}
```

---

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
