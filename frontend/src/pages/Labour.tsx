import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '../lib/api';
import { formatDate, getStatusColor } from '../utils/formatters';
import { hasPermission } from '../utils/permissions';
import { useAuthStore } from '../store/authStore';
import PermissionGuard from '../components/PermissionGuard';
import toast from 'react-hot-toast';
import { Plus, Search, Users as UsersIcon, Clock } from 'lucide-react';
import type { Employee, Timesheet } from '../types';

export default function Labour() {
  return (
    <Routes>
      <Route index element={<LabourList />} />
    </Routes>
  );
}

function LabourList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'employees' | 'timesheets'>('employees');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      if (tab === 'employees') {
        const response = await api.get('/labour/employees');
        setEmployees(response.data.data || []);
      } else {
        const response = await api.get('/labour/timesheets');
        setTimesheets(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canViewPayRate = user && hasPermission(user.role, 'viewPayRate');
  const canApprove = user && hasPermission(user.role, 'approveTimesheet');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Labour Management</h1>
          <p className="text-gray-600 mt-1">Manage employees, timesheets, and payroll</p>
        </div>
        <PermissionGuard permission="createEmployee" showMessage>
          <button 
            onClick={() => toast(`${tab === 'employees' ? 'Add Employee' : 'Create Timesheet'} form coming soon!`, { icon: '🚧' })}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            {tab === 'employees' ? 'Add Employee' : 'New Timesheet'}
          </button>
        </PermissionGuard>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setTab('employees')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                tab === 'employees'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setTab('timesheets')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                tab === 'timesheets'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Timesheets
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : tab === 'employees' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div key={employee._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-600">{employee.employeeId}</p>
                  <p className="text-sm text-gray-600 mt-1">{employee.role}</p>
                  
                  {canViewPayRate && (
                    <p className="text-sm font-medium text-green-600 mt-2">
                      ${employee.payRate}/hour
                    </p>
                  )}
                  
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {canApprove && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timesheets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No timesheets found
                  </td>
                </tr>
              ) : (
                timesheets.map((timesheet) => (
                  <tr key={timesheet._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {typeof timesheet.employee === 'object' ? timesheet.employee.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {typeof timesheet.project === 'object' ? timesheet.project.projectName : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(timesheet.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-400" />
                        {timesheet.hoursWorked}h
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(timesheet.status)}`}>
                        {timesheet.status}
                      </span>
                    </td>
                    {canApprove && (
                      <td className="px-6 py-4">
                        {timesheet.status === 'Submitted' && (
                          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            Approve
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
