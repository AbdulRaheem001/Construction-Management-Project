import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters';
import PermissionGuard from '../components/PermissionGuard';
import toast from 'react-hot-toast';
import { Plus, Search, Filter } from 'lucide-react';
import type { Project } from '../types';

export default function Projects() {
  return (
    <Routes>
      <Route index element={<ProjectsList />} />
    </Routes>
  );
}

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage construction projects and track budgets</p>
        </div>
        <PermissionGuard permission="createProject" showMessage>
          <button 
            onClick={() => toast('Create Project form coming soon!', { icon: '🚧' })}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            New Project
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <p className="text-gray-500">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{project.projectName}</h3>
                    <p className="text-sm text-gray-600">{project.projectCode}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Client:</span>
                    <span className="font-medium text-gray-900">{project.client}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{project.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium text-gray-900">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(project.initialBudget)}</span>
                  </div>
                </div>

                {/* Budget Progress */}
                {project.budgetUtilization !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Budget Used</span>
                      <span className="font-medium text-gray-900">{project.budgetUtilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          project.budgetUtilization > 90 ? 'bg-red-500' :
                          project.budgetUtilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(project.budgetUtilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
