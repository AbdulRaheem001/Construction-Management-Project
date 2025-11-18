# User Management & RBAC Analysis

## 📊 Current System State

### ✅ **What Already Exists**

#### Backend
1. **User Model** (`backend/src/models/User.model.ts`)
   - ✅ Basic fields: email, password, name, role, contact, isActive
   - ✅ Password hashing with bcrypt
   - ✅ 4 Roles: Administrator, Site Manager, Accountant, Labourer
   - ✅ Timestamps (createdAt, updatedAt)

2. **User Controller** (`backend/src/controllers/user.controller.ts`)
   - ✅ CRUD operations: getAllUsers, getUserById, createUser, updateUser, deleteUser
   - ✅ Search & filter by role, isActive, name/email
   - ✅ Audit logging for all actions
   - ✅ Soft delete (sets isActive = false)

3. **User Routes** (`backend/src/routes/user.routes.ts`)
   - ✅ All routes protected with authentication
   - ✅ Administrator-only access for create/update/delete
   - ✅ Administrator + Accountant can view users

4. **Auth System**
   - ✅ JWT-based authentication
   - ✅ Login/Register endpoints
   - ✅ Role-based authorization middleware
   - ✅ Token verification

5. **Project Assignment**
   - ✅ Projects have `siteManager` field (ref to User)
   - ✅ Warehouses have `manager` field (ref to User)

#### Frontend
- ❌ **No User Management UI exists yet**
- ✅ Sidebar shows "Users" menu item (but no page)
- ✅ Auth store with login/logout

---

## 🎯 Your Requirements vs Current System

### Requirement 1: **Role-Based Access Control (RBAC)**

| Your Design | Current System | Status |
|-------------|----------------|--------|
| Users table | ✅ User model exists | ✅ Done |
| Roles table | ❌ Hardcoded enum (4 roles) | ⚠️ **Needs Enhancement** |
| Permissions table | ❌ Not implemented | ❌ **Missing** |
| User_Roles (many-to-many) | ❌ User has single role only | ⚠️ **Needs Enhancement** |
| Role_Permissions | ❌ Not implemented | ❌ **Missing** |

**Current Limitation:** 
- Users can only have ONE role (enum field)
- Permissions are hardcoded in frontend (`permissions.ts`)
- No database-driven permission system

### Requirement 2: **Data-Level Access (Project Assignment)**

| Your Design | Current System | Status |
|-------------|----------------|--------|
| User_Project_Access table | ❌ Not implemented | ❌ **Missing** |
| Project.siteManager field | ✅ Exists | ✅ Done |
| Filter projects by user | ❌ Not implemented | ❌ **Missing** |

**Current Limitation:**
- Projects have a siteManager field, but it's ONE manager per project
- No system to assign MULTIPLE users to ONE project
- No system to assign ONE user to MULTIPLE projects
- Controllers don't filter data based on user's assigned projects

### Requirement 3: **"View All Projects" Permission**

| Your Design | Current System | Status |
|-------------|----------------|--------|
| Special "view_all_projects" permission | ❌ Not implemented | ❌ **Missing** |
| Manager role can see everything | ⚠️ Administrator sees all (hardcoded) | ⚠️ **Partial** |

---

## 🔧 What Needs to Be Built

### Phase 1: User Management UI (IMMEDIATE - Keeps Current Simple System)

**Frontend Pages Needed:**
1. ✅ **Users List Page** (`/users`)
   - Table showing all users
   - Search/filter by name, email, role
   - View active/inactive users
   - Action buttons: Edit, Deactivate, Activate

2. ✅ **Create User Modal/Page**
   - Form fields: name, email, password, role, contact
   - Role dropdown (4 options)
   - Submit to POST `/api/users`

3. ✅ **Edit User Modal/Page**
   - Same form as create
   - Pre-filled with existing data
   - Submit to PUT `/api/users/:id`

4. ✅ **Assign Project to User** (Simple Version)
   - When creating/editing a project, select siteManager from users dropdown
   - This is the existing system - just needs UI

**Backend Changes:**
- ✅ No changes needed - all APIs exist

**Estimated Time:** 4-6 hours

---

### Phase 2: Enhanced RBAC System (FUTURE - Your Full Design)

This implements your complete design with dynamic roles and permissions.

#### Database Changes

1. **New Collections:**

```typescript
// Roles Collection (replaces enum)
{
  _id: ObjectId,
  roleName: string,       // "Project Supervisor", "Accountant", "Salesman"
  roleCode: string,       // "supervisor", "accountant", "salesman"
  description: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}

// Permissions Collection
{
  _id: ObjectId,
  permissionName: string,    // "view_projects"
  permissionCode: string,    // "view_projects"
  module: string,            // "Projects", "Accounting", "Sales"
  description: string,
  createdAt: Date
}

// UserRoles (User can have multiple roles)
{
  _id: ObjectId,
  userId: ObjectId,
  roleId: ObjectId,
  assignedBy: ObjectId,
  assignedAt: Date
}

// RolePermissions (Role has many permissions)
{
  _id: ObjectId,
  roleId: ObjectId,
  permissionId: ObjectId
}

// UserProjectAccess (Your key requirement!)
{
  _id: ObjectId,
  userId: ObjectId,
  projectId: ObjectId,
  canView: boolean,
  canEdit: boolean,
  assignedBy: ObjectId,
  assignedAt: Date
}
```

2. **Update User Model:**
```typescript
// Remove: role: enum
// Add: roles: ObjectId[] (references Roles)
```

3. **Update Project Controller:**
```typescript
// Add data filtering based on UserProjectAccess
async getProjects(req, res) {
  const user = req.user;
  
  // Check if user has "view_all_projects" permission
  const hasViewAll = await checkPermission(user._id, 'view_all_projects');
  
  if (hasViewAll) {
    // Show all projects
    projects = await Project.find();
  } else {
    // Show only assigned projects
    const accessibleProjectIds = await UserProjectAccess.find({ 
      userId: user._id, 
      canView: true 
    }).distinct('projectId');
    
    projects = await Project.find({ 
      _id: { $in: accessibleProjectIds } 
    });
  }
  
  res.json(projects);
}
```

#### New API Endpoints Needed

**Roles Management:**
```
POST   /api/roles              - Create role (Admin only)
GET    /api/roles              - List all roles
PUT    /api/roles/:id          - Update role
DELETE /api/roles/:id          - Delete role
```

**Permissions Management:**
```
POST   /api/permissions        - Create permission (Admin)
GET    /api/permissions        - List all permissions
GET    /api/permissions/by-module  - Group by module
```

**Role-Permission Assignment:**
```
POST   /api/roles/:id/permissions     - Assign permissions to role
GET    /api/roles/:id/permissions     - Get role's permissions
DELETE /api/roles/:id/permissions/:permId  - Remove permission
```

**User-Role Assignment:**
```
POST   /api/users/:id/roles           - Assign role to user
GET    /api/users/:id/roles           - Get user's roles
DELETE /api/users/:id/roles/:roleId   - Remove role from user
```

**Project Access Assignment (YOUR KEY FEATURE!):**
```
POST   /api/users/:id/projects        - Assign projects to user
GET    /api/users/:id/projects        - Get user's assigned projects
DELETE /api/users/:id/projects/:projectId  - Remove project access
POST   /api/projects/:id/users        - Assign users to project (alternative)
GET    /api/projects/:id/users        - Get project's assigned users
```

#### Frontend Pages Needed

1. **Role Management** (`/settings/roles`)
   - List all roles
   - Create/Edit role
   - Delete role (if not assigned to users)

2. **Permission Management** (`/settings/permissions`)
   - List all permissions grouped by module
   - Assign permissions to role (drag-and-drop or checkboxes)

3. **User Management** (Enhanced)
   - Assign multiple roles to user
   - Assign projects to user (multi-select)
   - View user's effective permissions

4. **Project Management** (Enhanced)
   - When viewing a project, show "Assigned Users" section
   - Add/remove users from project
   - Set access level (View only, Edit)

**Estimated Time:** 15-20 hours

---

## 🚀 Recommended Approach

### **Option A: Quick Win (Use Current System)**
**Best for:** Getting User Management working NOW

**What to do:**
1. ✅ Create Users List page (frontend only)
2. ✅ Create/Edit User forms (frontend only)
3. ✅ Keep single role per user
4. ✅ When creating Project, assign one siteManager
5. ⚠️ Limitation: Can't assign multiple supervisors to one project

**Pros:**
- ✅ Fast (4-6 hours)
- ✅ No database changes
- ✅ Works with existing backend
- ✅ Good enough for small teams

**Cons:**
- ❌ User can only have one role
- ❌ Project can only have one supervisor
- ❌ Permissions still hardcoded

---

### **Option B: Full RBAC Implementation (Your Design)**
**Best for:** Enterprise-level access control

**What to do:**
1. Implement all new database collections
2. Build Roles & Permissions management
3. Build UserProjectAccess system
4. Update all controllers to filter by access
5. Build comprehensive UI

**Pros:**
- ✅ Fully flexible role system
- ✅ Multiple users per project
- ✅ Multiple projects per user
- ✅ Dynamic permissions (no hardcoding)
- ✅ Scalable for large organizations

**Cons:**
- ❌ Time-consuming (15-20 hours)
- ❌ Complex database changes
- ❌ Requires thorough testing
- ❌ Migration of existing data needed

---

## 💡 My Recommendation

**Start with Option A, plan for Option B**

### Immediate Steps (Next 2-3 hours):
1. ✅ Create `frontend/src/pages/Users.tsx`
2. ✅ Add Users route to App.tsx
3. ✅ Build User List table with search/filter
4. ✅ Build Create/Edit User modals
5. ✅ Test with existing backend APIs

### Next Phase (Later):
1. Add UserProjectAccess table (just this one!)
2. Update getProjects controller to filter by access
3. Add "Assign Projects" UI to User edit page
4. This gives you 80% of benefits with 20% of effort

### Future (If needed):
1. Implement full RBAC with Roles and Permissions tables
2. Support multiple roles per user
3. Dynamic permission system

---

## 📝 Summary: Current vs Required

| Feature | Current | Your Design | Gap |
|---------|---------|-------------|-----|
| User CRUD | ✅ Backend exists | ✅ Complete | ❌ UI Missing |
| Single Role per User | ✅ Works | ⚠️ Want multiple roles | ⚠️ Enhancement |
| Hardcoded Permissions | ✅ Works | ❌ Want DB-driven | ❌ Missing |
| Project Assignment | ⚠️ 1 manager/project | ✅ Multiple users/project | ❌ Missing |
| Data Filtering | ❌ All see all data | ✅ See only assigned | ❌ Missing |
| "View All" Permission | ⚠️ Admin only | ✅ Configurable | ⚠️ Partial |

---

## 🎯 Next Steps - Choose Your Path:

**Path 1: Quick & Practical** (Recommended to start)
- Build User Management UI (4-6 hours)
- Keep current simple system
- Get it working today
- Plan enhancements for later

**Path 2: Complete Redesign** (For later)
- Implement full RBAC design (15-20 hours)
- Database restructuring
- Comprehensive testing required

**Which would you like to proceed with first?**
