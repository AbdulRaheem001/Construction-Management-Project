Here is a `README.md` file formatted as a set of instructions for an AI agent, based on the requirements file you provided.

---

# Project Brief: Construction Management System (CMS)

## 1. Project Overview

[cite_start]Your task is to build a **web-based Construction Management System (CMS)**[cite: 3]. [cite_start]The primary goal of this system is to integrate project management with detailed financial and operational expense tracking[cite: 3].

[cite_start]The system must provide a unified view of project expenses [cite: 4] and include core functionality across the following five modules:
* [cite_start]Material Management [cite: 4]
* [cite_start]Labour Management [cite: 4]
* [cite_start]Site Management [cite: 4]
* [cite_start]Equipment Management [cite: 4]
* [cite_start]Warehouse Management [cite: 4]

## 2. Core User Roles & Security

[cite_start]The system **must** be built using **Role-Based Access Control (RBAC)**[cite: 6]. [cite_start]Access to modules and data will be dictated by the user's role[cite: 6].

**Defined Roles:**
* [cite_start]Administrator [cite: 6]
* [cite_start]Site Manager [cite: 6]
* [cite_start]Accountant [cite: 6]
* [cite_start]Labourer [cite: 6]

[cite_start](Example: Only Accountants should be able to see payroll rates [cite: 6]).

## 3. Functional Requirements by Module

Implement the following features for each module.

### 3.1. [cite_start]Material Management [cite: 9]
* [cite_start]**MAT-01:** Maintain a master list of materials (SKU, description, unit, cost)[cite: 10].
* [cite_start]**MAT-02:** Generate, track, and approve Purchase Orders (POs) linked to a Site and Supplier[cite: 10].
* [cite_start]**MAT-03:** Record "Goods Receipt" against a PO, which automatically updates Warehouse or Site stock[cite: 10].
* [cite_start]**MAT-04:** Allow Site Managers to record material consumption, which debits Site inventory and creates an expense record[cite: 10].
* [cite_start]**MAT-05:** Send automated notifications for low stock in the Warehouse based on a reorder point[cite: 10].

### 3.2. [cite_start]Labour Management [cite: 12]
* [cite_start]**LAB-01:** Maintain an employee database (name, role, pay rate, team, contact info)[cite: 13].
* [cite_start]**LAB-02:** Allow workers/supervisors to log hours worked against a specific Site and Task[cite: 13].
* [cite_start]**LAB-03:** Enable Site Managers to review, edit, and approve timesheets[cite: 13].
* [cite_start]**LAB-04:** Generate a payroll report (CSV exportable) summarizing approved hours and calculated wages[cite: 13].
* [cite_start]**LAB-05:** Automatically allocate approved labour costs as an expense against the associated Site/Project[cite: 13].

### 3.3. [cite_start]Site/Project Management [cite: 15]
* [cite_start]**SITE-01:** Define new projects (Project Name, Client, Start Date, Target Completion, Initial Budget)[cite: 16].
* [cite_start]**SITE-02:** Provide a real-time display of budget utilization (committed costs, actual expenses, remaining budget)[cite: 16].
* [cite_start]**SITE-03:** Require Site Managers to create a mandatory Daily Log (DLR) to record weather, progress, activities, and safety incidents[cite: 16].
* [cite_start]**SITE-04:** Generate project summary reports aggregating total material, labour, equipment, and general costs[cite: 16].

### 3.4. [cite_start]Equipment Management [cite: 18]
* [cite_start]**EQU-01:** Maintain an asset register for all equipment (Asset ID, Make/Model, Purchase Date, Value, Condition, Location)[cite: 19].
* [cite_start]**EQU-02:** Assign equipment to a Site or Warehouse and track its transfer history[cite: 19].
* [cite_start]**EQU-03:** Record usage (hours/days) for equipment on a Site to generate a usage expense record[cite: 19].
* [cite_start]**EQU-04:** Schedule and log all maintenance activities and costs against the asset[cite: 19].
* [cite_start]**EQU-05:** Allocate equipment costs (rental, depreciation, maintenance) to the Site using it[cite: 19].

### 3.5. [cite_start]Warehouse Management [cite: 21]
* [cite_start]**WAR-01:** Assign materials to specific physical bins/locations within the Warehouse[cite: 22].
* [cite_start]**WAR-02:** Manage stock transfers: Warehouse-to-Site, Site-to-Warehouse, and Site-to-Site[cite: 22].
* [cite_start]**WAR-03:** Record inventory adjustments (e.g., breakage, theft) with explanations and required managerial approval[cite: 22].
* [cite_start]**WAR-04:** Support periodic physical inventory counts and compare them against system stock levels[cite: 22].

### 3.6. [cite_start]Centralized Expense Management [cite: 24]
* [cite_start]**EXP-01:** Log general expenses (e.g., permits, utilities) and link them to a Site or Overhead category[cite: 25].
* [cite_start]**EXP-02:** Allow users to upload and attach scanned invoices/receipts to any expense entry[cite: 25].
* [cite_start]**EXP-03:** Record the date, method, and status (Paid/Pending) for all outgoing payments[cite: 25].
* [cite_start]**EXP-04:** Automatically calculate the Cost of Goods Sold (COGS) for materials consumed by a project[cite: 25].
* [cite_start]**EXP-05:** Generate financial reports for accounting (Trial Balance, P&L per Project, Cash Flow)[cite: 25].

## 4. Non-Functional Requirements

These are critical system-wide constraints.

* [cite_start]**Security (NFR-01):** Must use Role-Based Access Control (RBAC) as defined in Section 2[cite: 6].
* [cite_start]**Performance (NFR-02):** All major reports (e.g., Site Expense Summary, Warehouse Stock) must load within 3 seconds[cite: 6].
* [cite_start]**Scalability (NFR-03):** Must handle 50 concurrent users and data for 100 active projects[cite: 6].
* [cite_start]**Usability (NFR-04):** The UI must be fully responsive for desktop, tablet, and mobile (especially for site managers)[cite: 6].
* [cite_start]**Data Integrity (NFR-05):** All financial transactions and stock movements must have a timestamp, user ID, and an audit log of changes[cite: 6].
* [cite_start]**Backup (NFR-06):** Implement automatic daily database backups with a 7-day retention policy[cite: 6].