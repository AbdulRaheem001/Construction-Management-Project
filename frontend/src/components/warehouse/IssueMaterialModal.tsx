import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import type { Inventory, Warehouse, Project, Material } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface IssueMaterialModalProps {
  inventory: Inventory;
  warehouse: Warehouse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IssueMaterialModal({ inventory, warehouse, onClose, onSuccess }: IssueMaterialModalProps) {
  const [formData, setFormData] = useState({
    project: '',
    quantity: '',
    usedBy: '',
    purpose: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const material = typeof inventory.material === 'object' ? inventory.material : null;
  const warehouseProject = warehouse.project ? 
    (typeof warehouse.project === 'object' ? warehouse.project : null) : null;

  useEffect(() => {
    // If warehouse is linked to a project, auto-select it
    if (warehouseProject) {
      setFormData(prev => ({ ...prev, project: warehouseProject._id }));
    } else {
      // Only fetch projects if warehouse is not linked to a specific project
      fetchProjects();
    }
  }, [warehouseProject]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!material) {
      toast.error('Material information not found');
      return;
    }

    const qty = parseFloat(formData.quantity);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (qty > inventory.quantity) {
      toast.error(`Quantity cannot exceed available stock (${inventory.quantity} ${material.unit})`);
      return;
    }

    if (!formData.project) {
      toast.error('Please select a project');
      return;
    }

    setLoading(true);

    try {
      await api.post('/material/consume', {
        materialId: material._id,
        projectId: formData.project,
        warehouseId: warehouse._id,
        quantity: qty,
        usedBy: formData.usedBy,
        purpose: formData.purpose,
        notes: formData.notes,
      });

      toast.success('Material issued successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to issue material');
    } finally {
      setLoading(false);
    }
  };

  if (!material) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Issue Material</h2>
              <p className="text-sm text-gray-600 mt-1">From: {warehouse.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Material Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Material Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium text-gray-900">{material.name}</span>
              </div>
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-medium text-gray-900">{material.sku}</span>
              </div>
              <div>
                <span className="text-gray-600">Available:</span>
                <span className="ml-2 font-semibold text-green-700">
                  {inventory.quantity} {material.unit}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Unit Price:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatCurrency(material.costPerUnit || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Project Selection */}
          {warehouseProject ? (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2">Issuing to Project</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-sm text-indigo-700 font-medium">{warehouseProject.projectName}</p>
                  <p className="text-xs text-indigo-600">{warehouseProject.location}</p>
                </div>
                <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full font-medium">
                  {warehouseProject.projectCode}
                </span>
              </div>
              <p className="text-xs text-indigo-600 mt-2">
                ✓ This warehouse is assigned to this project
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue to Project *
              </label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectName} - {project.location}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Issue ({material.unit}) *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter quantity"
              min="0"
              step="0.01"
              max={inventory.quantity}
              required
            />
            {formData.quantity && parseFloat(formData.quantity) > inventory.quantity && (
              <p className="text-xs text-red-600 mt-1">
                Quantity exceeds available stock ({inventory.quantity} {material.unit})
              </p>
            )}
          </div>

          {/* Used By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Used By (Person/Team) *
            </label>
            <input
              type="text"
              value={formData.usedBy}
              onChange={(e) => setFormData({ ...formData, usedBy: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g., Construction Team A, John Doe"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose/Task
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g., Foundation work, Steel framing"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {/* Issue Summary */}
          {formData.quantity && parseFloat(formData.quantity) > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-2">Issue Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Quantity:</span>
                  <span className="font-semibold text-gray-900">
                    {formData.quantity} {material.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Estimated Value:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(parseFloat(formData.quantity) * (material.costPerUnit || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Remaining Stock:</span>
                  <span className="font-semibold text-gray-900">
                    {(inventory.quantity - parseFloat(formData.quantity)).toFixed(2)} {material.unit}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Issuing...' : 'Issue Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
