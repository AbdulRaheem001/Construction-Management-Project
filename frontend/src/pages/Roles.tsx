import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Check, X, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import PermissionGuard from '../components/PermissionGuard';
import { api } from '../lib/api';

interface Permission {
  _id: string;
  name: string;
  code: string;
  module: string;
  description?: string;
  isActive: boolean;
}

interface Role {
  _id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
}

interface PermissionsByModule {
  [module: string]: Permission[];
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionsByModule>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions/by-module');
      setPermissions(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch permissions');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await api.delete(`/roles/${id}`);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && role.isActive) ||
      (filterActive === 'inactive' && !role.isActive);

    return matchesSearch && matchesActive;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
        <p className="text-gray-600 mt-1">Manage roles and their permissions</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Add Role Button */}
            <PermissionGuard permission="createRoles" showMessage>
              <button
                onClick={() => {
                  setEditingRole(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Role</span>
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Roles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading roles...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
          <p className="text-gray-600">
            {searchTerm || filterActive !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first role'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRoles.map((role) => (
            <div key={role._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {role.isSystem && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      System
                    </span>
                  )}
                  {role.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {role.description && (
                <p className="text-gray-600 text-sm mb-4">{role.description}</p>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Permissions</span>
                  <span className="text-sm text-gray-600">{role.permissions.length} assigned</span>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 10).map((perm) => (
                      <span
                        key={perm._id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        title={perm.description}
                      >
                        {perm.name}
                      </span>
                    ))}
                    {role.permissions.length > 10 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{role.permissions.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Created {formatDate(role.createdAt)}
                </span>
                <div className="flex gap-2">
                  <PermissionGuard permission="editRoles" showMessage>
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Role"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </PermissionGuard>
                  {!role.isSystem && (
                    <PermissionGuard permission="deleteRoles" showMessage>
                      <button
                        onClick={() => handleDelete(role._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </PermissionGuard>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Form Modal */}
      {showModal && (
        <RoleFormModal
          role={editingRole}
          permissions={permissions}
          onClose={() => {
            setShowModal(false);
            setEditingRole(null);
          }}
          onSuccess={() => {
            fetchRoles();
            setShowModal(false);
            setEditingRole(null);
          }}
        />
      )}
    </div>
  );
}

// Role Form Modal Component
interface RoleFormModalProps {
  role: Role | null;
  permissions: PermissionsByModule;
  onClose: () => void;
  onSuccess: () => void;
}

function RoleFormModal({ role, permissions, onClose, onSuccess }: RoleFormModalProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    code: role?.code || '',
    description: role?.description || '',
    selectedPermissions: role?.permissions.map((p) => p._id) || [],
    isActive: role?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(Object.keys(permissions));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        permissions: formData.selectedPermissions,
        isActive: formData.isActive,
      };

      if (role) {
        await api.put(`/roles/${role._id}`, payload);
        toast.success('Role updated successfully');
      } else {
        await api.post('/roles', payload);
        toast.success('Role created successfully');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${role ? 'update' : 'create'} role`);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (module: string) => {
    setExpandedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter((id) => id !== permissionId)
        : [...prev.selectedPermissions, permissionId],
    }));
  };

  const toggleAllModulePermissions = (module: string) => {
    const modulePerms = permissions[module].map((p) => p._id);
    const allSelected = modulePerms.every((id) => formData.selectedPermissions.includes(id));

    setFormData((prev) => ({
      ...prev,
      selectedPermissions: allSelected
        ? prev.selectedPermissions.filter((id) => !modulePerms.includes(id))
        : [...new Set([...prev.selectedPermissions, ...modulePerms])],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={role?.isSystem}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  required
                  disabled={!!role}
                  placeholder="ROLE_CODE"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Role
              </label>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
              <div className="space-y-3">
                {Object.entries(permissions).map(([module, perms]) => {
                  const modulePerms = perms.map((p) => p._id);
                  const allSelected = modulePerms.every((id) =>
                    formData.selectedPermissions.includes(id)
                  );
                  const someSelected = modulePerms.some((id) =>
                    formData.selectedPermissions.includes(id)
                  );

                  return (
                    <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleModule(module)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => toggleAllModulePermissions(module)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="font-medium text-gray-900">{module}</span>
                          <span className="text-sm text-gray-600">
                            ({formData.selectedPermissions.filter((id) => modulePerms.includes(id)).length}/{perms.length})
                          </span>
                        </div>
                        <span className="text-gray-400">
                          {expandedModules.includes(module) ? '▼' : '▶'}
                        </span>
                      </div>
                      {expandedModules.includes(module) && (
                        <div className="p-3 bg-white space-y-2">
                          {perms.map((perm) => (
                            <label key={perm._id} className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={formData.selectedPermissions.includes(perm._id)}
                                onChange={() => togglePermission(perm._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                  {perm.name}
                                </div>
                                {perm.description && (
                                  <div className="text-xs text-gray-500">{perm.description}</div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
