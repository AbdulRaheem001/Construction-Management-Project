import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters';
import PermissionGuard from '../components/PermissionGuard';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, X, ArrowLeft, Calendar, MapPin, User as UserIcon, DollarSign, TrendingUp, Clock, Edit, Package, Store, ArrowRight, ArrowDown, ArrowUp } from 'lucide-react';
import type { Project, User, Inventory, Material, Warehouse } from '../types';
import { useAuthStore } from '../store/authStore';

export default function Projects() {
  return (
    <Routes>
      <Route index element={<ProjectsList />} />
      <Route path=":id" element={<ProjectDetails />} />
    </Routes>
  );
}

function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
            onClick={() => setShowCreateModal(true)}
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

                <button 
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition font-medium text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Project Store states
  const [projectInventory, setProjectInventory] = useState<Inventory[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showIssueMaterialModal, setShowIssueMaterialModal] = useState(false);
  const [showTransferRequestModal, setShowTransferRequestModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchProjectInventory();
      fetchWarehouses();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data.project);
      setBudgetData(response.data.data.budget);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectInventory = async () => {
    if (!id) return;
    setLoadingInventory(true);
    try {
      const response = await api.get(`/stock-transfers/inventory/Project/${id}`);
      const inventoryData = response.data.data || response.data || [];
      // Ensure it's always an array
      setProjectInventory(Array.isArray(inventoryData) ? inventoryData : []);
    } catch (error) {
      console.error('Error fetching project inventory:', error);
      toast.error('Failed to load project inventory');
      setProjectInventory([]); // Set empty array on error
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouse');
      setWarehouses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const isAdministrator = user?.role === 'Administrator';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const budgetUsed = budgetData?.actualSpent || 0;
  const budgetRemaining = budgetData?.remainingBudget || 0;
  const budgetPercentage = parseFloat(budgetData?.budgetUtilization || '0');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{project.projectName}</h1>
          <p className="text-gray-600 mt-1">{project.projectCode}</p>
        </div>
        <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        {isAdministrator && (
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Edit size={20} />
            Edit Project
          </button>
        )}
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Client</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{project.client}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Location</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{project.location}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Start Date</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatDate(project.startDate)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock size={20} className="text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Target Completion</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {project.targetCompletionDate ? formatDate(project.targetCompletionDate) : 'Not set'}
          </p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Budget Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-gray-600" />
              <span className="text-sm text-gray-600">Initial Budget</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.initialBudget)}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-gray-600" />
              <span className="text-sm text-gray-600">Budget Used</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(budgetUsed)}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-gray-600" />
              <span className="text-sm text-gray-600">Budget Remaining</span>
            </div>
            <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(budgetRemaining)}
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Budget Utilization</span>
            <span className="font-bold text-gray-900">{budgetPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                budgetPercentage > 90 ? 'bg-red-500' :
                budgetPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            ></div>
          </div>
          {budgetPercentage > 100 && (
            <p className="text-sm text-red-600 mt-2 font-medium">
              ⚠️ Budget exceeded by {formatCurrency(Math.abs(budgetRemaining))}
            </p>
          )}
        </div>
      </div>

      {/* Description & Site Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed">
            {project.description || 'No description provided'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Site Manager</h2>
          {project.siteManager ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserIcon size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{project.siteManager.name}</p>
                  <p className="text-sm text-gray-600">{project.siteManager.role}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{project.siteManager.email}</p>
              </div>
              {project.siteManager.contact && (
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium text-gray-900">{project.siteManager.contact}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No site manager assigned</p>
          )}
        </div>
      </div>

      {/* Project Dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(project.startDate)}</p>
          </div>
          {project.targetCompletionDate && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Target Completion</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(project.targetCompletionDate)}</p>
            </div>
          )}
          {project.actualCompletionDate && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Actual Completion</p>
              <p className="text-lg font-semibold text-green-600">{formatDate(project.actualCompletionDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Project Store */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Store size={24} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Project Store</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTransferRequestModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowDown size={18} />
              Request Transfer
            </button>
          </div>
        </div>

        {loadingInventory ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : projectInventory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No materials in project store</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Material</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Unit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Stock Qty</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bin Location</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Value</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectInventory.map((inventory) => {
                  const material = inventory.material as Material;
                  const totalValue = inventory.quantity * material.costPerUnit;
                  return (
                    <tr key={inventory._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{material.name}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{material.sku}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {material.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{material.unit}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold ${
                          inventory.quantity <= material.reorderPoint 
                            ? 'text-red-600' 
                            : 'text-gray-900'
                        }`}>
                          {inventory.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {inventory.binLocation || '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(material.costPerUnit)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(totalValue)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInventory(inventory);
                              setShowIssueMaterialModal(true);
                            }}
                            className="text-green-600 hover:text-green-700 transition"
                            title="Issue Material"
                          >
                            <ArrowRight size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInventory(inventory);
                              setShowTransferRequestModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 transition"
                            title="Transfer to Another Location"
                          >
                            <ArrowUp size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={7} className="py-3 px-4 text-right font-bold text-gray-900">
                    Total Inventory Value:
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-600">
                    {formatCurrency(
                      projectInventory.reduce((sum, inv) => {
                        const material = inv.material as Material;
                        return sum + (inv.quantity * material.costPerUnit);
                      }, 0)
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Material Consumption History */}
      <MaterialConsumptionHistory projectId={project._id} />

      {/* Edit Project Modal */}
      {showEditModal && project && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchProjectDetails();
          }}
        />
      )}

      {/* Issue Material Modal */}
      {showIssueMaterialModal && selectedInventory && (
        <IssueMaterialModal
          inventory={selectedInventory}
          projectId={project._id}
          projectName={project.projectName}
          onClose={() => {
            setShowIssueMaterialModal(false);
            setSelectedInventory(null);
          }}
          onSuccess={() => {
            setShowIssueMaterialModal(false);
            setSelectedInventory(null);
            fetchProjectInventory();
            toast.success('Material issued successfully');
          }}
        />
      )}

      {/* Transfer Request Modal */}
      {showTransferRequestModal && (
        <TransferRequestModal
          projectId={project._id}
          projectName={project.projectName}
          warehouses={warehouses}
          inventory={selectedInventory}
          onClose={() => {
            setShowTransferRequestModal(false);
            setSelectedInventory(null);
          }}
          onSuccess={() => {
            setShowTransferRequestModal(false);
            setSelectedInventory(null);
            fetchProjectInventory();
            toast.success('Transfer request created successfully');
          }}
        />
      )}
    </div>
  );
}

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    projectName: project.projectName,
    projectCode: project.projectCode,
    client: project.client,
    location: project.location,
    description: project.description || '',
    startDate: project.startDate.split('T')[0],
    targetCompletionDate: project.targetCompletionDate?.split('T')[0] || '',
    initialBudget: project.initialBudget.toString(),
    siteManager: project.siteManager?._id || '',
    status: project.status,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?isActive=true');
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/projects/${project._id}`, {
        ...formData,
        initialBudget: parseFloat(formData.initialBudget),
      });

      toast.success('Project updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Code *
              </label>
              <input
                type="text"
                value={formData.projectCode}
                onChange={(e) => setFormData({ ...formData, projectCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Completion Date
              </label>
              <input
                type="date"
                value={formData.targetCompletionDate}
                onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Budget *
              </label>
              <input
                type="number"
                value={formData.initialBudget}
                onChange={(e) => setFormData({ ...formData, initialBudget: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Manager *
              </label>
              <select
                value={formData.siteManager}
                onChange={(e) => setFormData({ ...formData, siteManager: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Site Manager</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              rows={4}
              placeholder="Project description..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface IssueMaterialModalProps {
  inventory: Inventory;
  projectId: string;
  projectName: string;
  onClose: () => void;
  onSuccess: () => void;
}

function IssueMaterialModal({ inventory, projectId, projectName, onClose, onSuccess }: IssueMaterialModalProps) {
  const material = inventory.material as Material;
  const [formData, setFormData] = useState({
    quantity: '',
    usedBy: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (quantity > inventory.quantity) {
      toast.error(`Only ${inventory.quantity} ${material.unit} available in stock`);
      return;
    }

    if (!formData.usedBy.trim()) {
      toast.error('Please specify who is using this material');
      return;
    }

    setLoading(true);

    try {
      await api.post('/material/consume', {
        materialId: material._id,
        projectId,
        quantity,
        usedBy: formData.usedBy,
        notes: formData.notes,
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error issuing material:', error);
      toast.error(error.response?.data?.message || 'Failed to issue material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Issue Material</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Material Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Material</p>
            <p className="font-bold text-gray-900">{material.name}</p>
            <p className="text-sm text-gray-600 mt-2">SKU: {material.sku}</p>
            <p className="text-sm text-gray-600">Available Stock: <span className="font-semibold text-green-600">{inventory.quantity} {material.unit}</span></p>
          </div>

          {/* Project Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Project</p>
            <p className="font-semibold text-gray-900">{projectName}</p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Issue <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max={inventory.quantity}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter quantity"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {material.unit}
              </span>
            </div>
          </div>

          {/* Used By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Used By (Person/Team) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.usedBy}
              onChange={(e) => setFormData({ ...formData, usedBy: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="e.g., John Doe, Masonry Team"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter any additional notes about this material usage..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Issuing...' : 'Issue Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TransferRequestModalProps {
  projectId: string;
  projectName: string;
  warehouses: Warehouse[];
  inventory: Inventory | null;
  onClose: () => void;
  onSuccess: () => void;
}

function TransferRequestModal({ projectId, projectName, warehouses, inventory, onClose, onSuccess }: TransferRequestModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState({
    sourceType: inventory ? 'Project' : '',
    sourceId: inventory ? projectId : '',
    destinationType: inventory ? '' : 'Project',
    destinationId: inventory ? '' : projectId,
    materialId: inventory ? (inventory.material as Material)._id : '',
    quantity: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  useEffect(() => {
    fetchProjects();
    if (!inventory) {
      fetchMaterials();
    }
  }, []);

  useEffect(() => {
    if (formData.sourceType && formData.sourceId && formData.materialId) {
      fetchAvailableQuantity();
    }
  }, [formData.sourceType, formData.sourceId, formData.materialId]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects?status=Active,Planning');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/material');
      setMaterials(response.data.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchAvailableQuantity = async () => {
    try {
      const response = await api.get(
        `/stock-transfers/inventory/${formData.sourceType}/${formData.sourceId}`
      );
      const inventoryList = response.data.data || [];
      const foundInventory = inventoryList.find(
        (inv: Inventory) => (inv.material as Material)._id === formData.materialId
      );
      setAvailableQuantity(foundInventory ? foundInventory.quantity : 0);
    } catch (error) {
      console.error('Error fetching available quantity:', error);
      setAvailableQuantity(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (quantity > availableQuantity && formData.sourceType) {
      toast.error(`Only ${availableQuantity} available in source location`);
      return;
    }

    if (formData.sourceType === formData.destinationType && formData.sourceId === formData.destinationId) {
      toast.error('Source and destination cannot be the same');
      return;
    }

    setLoading(true);

    try {
      await api.post('/stock-transfers', {
        fromLocationType: formData.sourceType,
        fromLocation: formData.sourceId,
        toLocationType: formData.destinationType,
        toLocation: formData.destinationId,
        items: [
          {
            material: formData.materialId,
            quantity,
          },
        ],
        notes: formData.notes,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating transfer request:', error);
      toast.error(error.response?.data?.message || 'Failed to create transfer request');
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterial = inventory 
    ? (inventory.material as Material)
    : materials.find(m => m._id === formData.materialId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {inventory ? 'Transfer Material' : 'Request Material Transfer'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Project Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Current Project</p>
            <p className="font-semibold text-gray-900">🏗️ {projectName}</p>
          </div>

          {/* Material Selection (only if not pre-selected) */}
          {!inventory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Material <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.materialId}
                onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              >
                <option value="">-- Select Material --</option>
                {materials.map((material) => (
                  <option key={material._id} value={material._id}>
                    {material.name} ({material.sku}) - {material.category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Material Info (if pre-selected or selected) */}
          {selectedMaterial && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Material</p>
              <p className="font-bold text-gray-900">{selectedMaterial.name}</p>
              <p className="text-sm text-gray-600">SKU: {selectedMaterial.sku}</p>
            </div>
          )}

          {/* Source Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer From <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sourceType}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value, sourceId: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                disabled={!!inventory}
              >
                <option value="">-- Select Type --</option>
                <option value="Warehouse">🏢 Company Warehouse</option>
                <option value="Project">🏗️ Project Store</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Location <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sourceId}
                onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                disabled={!!inventory || !formData.sourceType}
              >
                <option value="">-- Select Location --</option>
                {formData.sourceType === 'Warehouse' && warehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
                {formData.sourceType === 'Project' && projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.projectName} ({proj.projectCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer To <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.destinationType}
                onChange={(e) => setFormData({ ...formData, destinationType: e.target.value, destinationId: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                disabled={!!inventory}
              >
                <option value="">-- Select Type --</option>
                <option value="Warehouse">🏢 Company Warehouse</option>
                <option value="Project">🏗️ Project Store</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Location <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.destinationId}
                onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                disabled={!formData.destinationType || (!!inventory && formData.destinationType === 'Project')}
              >
                <option value="">-- Select Location --</option>
                {formData.destinationType === 'Warehouse' && warehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
                {formData.destinationType === 'Project' && projects.map((proj) => (
                  <option key={proj._id} value={proj._id} disabled={!!inventory && proj._id === projectId}>
                    {proj.projectName} ({proj.projectCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Available Quantity */}
          {availableQuantity > 0 && formData.sourceType && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-green-800">
                Available Stock at Source: <span className="font-bold">{availableQuantity} {selectedMaterial?.unit}</span>
              </p>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Transfer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max={availableQuantity || undefined}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter quantity"
                required
              />
              {selectedMaterial && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {selectedMaterial.unit}
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter reason for transfer or any additional notes..."
            />
          </div>

          {/* Transfer Status Info */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ℹ️ This transfer will be created with <span className="font-bold">Pending</span> status and will require approval before materials are moved.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Transfer Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface Milestone {
  name: string;
  description: string;
  deadline: string;
}

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    client: '',
    location: '',
    description: '',
    startDate: '',
    targetCompletionDate: '',
    initialBudget: '',
    siteManager: '',
    status: 'Planning',
  });
  const [milestones, setMilestones] = useState<Milestone[]>([
    { name: '', description: '', deadline: '' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?isActive=true');
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { name: '', description: '', deadline: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_: Milestone, i: number) => i !== index));
    }
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validMilestones = milestones.filter(m => m.name.trim() !== '');
      
      await api.post('/projects', {
        ...formData,
        initialBudget: parseFloat(formData.initialBudget),
        milestones: validMilestones.length > 0 ? validMilestones : undefined,
      });

      toast.success('Project created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Code *
                </label>
                <input
                  type="text"
                  value={formData.projectCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="e.g., PROJ-2024-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (End Date) *
                </label>
                <input
                  type="date"
                  value={formData.targetCompletionDate}
                  onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Budget *
                </label>
                <input
                  type="number"
                  value={formData.initialBudget}
                  onChange={(e) => setFormData({ ...formData, initialBudget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Manager *
                </label>
                <select
                  value={formData.siteManager}
                  onChange={(e) => setFormData({ ...formData, siteManager: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Site Manager</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                rows={3}
                placeholder="Project description..."
                required
              />
            </div>
          </div>

          {/* Milestones/Stages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Milestones/Stages</h3>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add Milestone
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Milestone Name
                      </label>
                      <input
                        type="text"
                        value={milestone.name}
                        onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="e.g., Foundation Work"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="Brief description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={milestone.deadline}
                        onChange={(e) => handleMilestoneChange(index, 'deadline', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Material Consumption History Component
interface MaterialConsumptionHistoryProps {
  projectId: string;
}

function MaterialConsumptionHistory({ projectId }: MaterialConsumptionHistoryProps) {
  const [issues, setIssues] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [issuesRes, summaryRes] = await Promise.all([
        api.get(`/material-issues/project/${projectId}`),
        api.get(`/material-issues/project/${projectId}/summary`),
      ]);
      setIssues(issuesRes.data.data || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching material consumption:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Material Consumption History</h2>
            <p className="text-sm text-gray-600 mt-1">
              Materials issued to this project • Total Cost: {formatCurrency(summary?.totalCost || 0)}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && summary.data && summary.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Materials</p>
              <p className="text-2xl font-bold text-blue-900">{summary.count}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Total Cost</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.overallTotal)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Total Issues</p>
              <p className="text-2xl font-bold text-purple-900">{issues.length}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">Avg Cost/Issue</p>
              <p className="text-2xl font-bold text-orange-900">
                {formatCurrency(issues.length > 0 ? summary.overallTotal / issues.length : 0)}
              </p>
            </div>
          </div>
        )}

        {/* Consumption Table */}
        {issues.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No materials issued to this project yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issues.map((issue: any) => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {issue.material?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {issue.material?.sku || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {issue.quantity} {issue.material?.unit || ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(issue.unitCost)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(issue.totalCost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(issue.issueDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {issue.issuedBy?.name || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    Total Consumption Cost:
                  </td>
                  <td colSpan={3} className="px-4 py-3 text-lg font-bold text-indigo-600">
                    {formatCurrency(issues.reduce((sum: number, issue: any) => sum + issue.totalCost, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  );
}




