import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters';
import PermissionGuard from '../components/PermissionGuard';
import toast from 'react-hot-toast';
import { Plus, Search, Package, AlertTriangle, X, TrendingUp, DollarSign, ShoppingCart, Trash2, CheckCircle, MapPin, ArrowRightLeft, ChevronDown, ChevronUp, Warehouse as WarehouseIcon } from 'lucide-react';
import type { Material, PurchaseOrder, Project, Inventory, Warehouse, StockTransfer } from '../types';
import { hasPermission } from '../utils/permissions';
import { useAuthStore } from '../store/authStore';

export default function Materials() {
  return (
    <Routes>
      <Route index element={<MaterialsList />} />
    </Routes>
  );
}

function MaterialsList() {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'materials' | 'pos'>('materials');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [materialLocations, setMaterialLocations] = useState<{ [key: string]: Inventory[] }>({});
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchData();
    fetchAnalytics();
    fetchWarehouses();
    fetchProjects();
  }, [tab]);

  const fetchData = async () => {
    try {
      if (tab === 'materials') {
        const response = await api.get('/materials');
        setMaterials(response.data.data || []);
      } else {
        const response = await api.get('/materials/purchase-orders');
        setPos(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/materials/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchMaterialLocations = async (materialId: string) => {
    try {
      const response = await api.get(`/stock-transfers/material-locations/${materialId}`);
      setMaterialLocations(prev => ({
        ...prev,
        [materialId]: response.data.data.locations || []
      }));
    } catch (error) {
      console.error('Error fetching material locations:', error);
    }
  };

  const toggleMaterialExpand = (materialId: string) => {
    if (expandedMaterial === materialId) {
      setExpandedMaterial(null);
    } else {
      setExpandedMaterial(materialId);
      if (!materialLocations[materialId]) {
        fetchMaterialLocations(materialId);
      }
    }
  };

  const handleReceivePO = async (poId: string) => {
    if (!window.confirm('Mark this PO as received? This will update material stock and costs.')) return;

    try {
      await api.put(`/materials/purchase-orders/${poId}/receive`);
      toast.success('PO received and material costs updated');
      fetchData();
      fetchAnalytics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to receive PO');
    }
  };

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPOs = pos.filter((po) =>
    po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreate = user && hasPermission(user.role, 'createMaterial');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material Management</h1>
          <p className="text-gray-600 mt-1">Track materials, purchase orders, and inventory</p>
        </div>
        <PermissionGuard permission="createMaterial" showMessage>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowMaterialModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
              New Material
            </button>
            <button 
              onClick={() => setShowPOModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Plus size={20} />
              New PO
            </button>
          </div>
        </PermissionGuard>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package size={24} className="text-indigo-600" />
              </div>
              <span className="text-sm text-gray-600">Total Inventory Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalInventoryValue)}</p>
            <p className="text-xs text-gray-500 mt-1">{analytics.totalMaterials} materials</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign size={24} className="text-red-600" />
              </div>
              <span className="text-sm text-gray-600">Outstanding Payments</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.outstandingPayments)}</p>
            <p className="text-xs text-gray-500 mt-1">Pending to vendors</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Monthly Spend</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.monthlySpend)}</p>
            <p className="text-xs text-gray-500 mt-1">Current month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle size={24} className="text-yellow-600" />
              </div>
              <span className="text-sm text-gray-600">Low Stock Items</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{analytics.lowStockCount}</p>
            <p className="text-xs text-gray-500 mt-1">Needs reordering</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setTab('materials')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                tab === 'materials'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Materials
            </button>
            <button
              onClick={() => setTab('pos')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                tab === 'pos'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Purchase Orders
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : tab === 'materials' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No materials found
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material: any) => {
                  const totalValue = (material.currentStock || 0) * (material.avgUnitCost || 0);
                  const isLowStock = (material.currentStock || 0) < material.reorderPoint;
                  const isExpanded = expandedMaterial === material._id;
                  const locations = materialLocations[material._id] || [];
                  
                  return (
                    <>
                      <tr key={material._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleMaterialExpand(material._id)}
                              className="text-gray-400 hover:text-gray-600 transition"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {material.sku}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{material.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{material.category}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-col">
                            <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                              {material.currentStock || 0} {material.unit}
                            </span>
                            {locations.length > 0 && (
                              <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin size={12} />
                                {locations.length} location{locations.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(material.avgUnitCost || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(totalValue)}
                        </td>
                        <td className="px-6 py-4">
                          {isLowStock ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                              <AlertTriangle size={14} />
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-green-600">In Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {canCreate && (
                            <button
                              onClick={() => {
                                setSelectedMaterial(material);
                                setShowRestockModal(true);
                              }}
                              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                                isLowStock 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                              }`}
                            >
                              Restock
                            </button>
                          )}
                        </td>
                      </tr>
                      
                      {/* Expanded Stock Breakdown */}
                      {isExpanded && (
                        <tr key={`${material._id}-expanded`}>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                  <MapPin size={16} className="text-indigo-600" />
                                  Stock Distribution
                                </h4>
                                {canCreate && (
                                  <button
                                    onClick={() => {
                                      setTransferData({ material, fromLocation: null });
                                      setShowTransferModal(true);
                                    }}
                                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                  >
                                    <ArrowRightLeft size={14} />
                                    Transfer Stock
                                  </button>
                                )}
                              </div>
                              
                              {locations.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-4">
                                  No stock allocated to any location yet
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {locations.map((inv: any) => {
                                    const location = inv.location;
                                    const locationName = inv.locationType === 'Project' 
                                      ? (location.projectName || location.name)
                                      : (location.name || location.code);
                                    const locationCode = inv.locationType === 'Project'
                                      ? location.projectCode
                                      : location.code;
                                    
                                    return (
                                      <div
                                        key={inv._id}
                                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            {inv.locationType === 'Warehouse' ? (
                                              <WarehouseIcon size={16} className="text-blue-600" />
                                            ) : (
                                              <Package size={16} className="text-green-600" />
                                            )}
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">{locationName}</p>
                                              <p className="text-xs text-gray-500">{locationCode}</p>
                                            </div>
                                          </div>
                                          {canCreate && (
                                            <button
                                              onClick={() => {
                                                setTransferData({
                                                  material,
                                                  fromLocation: location,
                                                  fromLocationType: inv.locationType,
                                                  availableQty: inv.quantity
                                                });
                                                setShowTransferModal(true);
                                              }}
                                              className="text-indigo-600 hover:text-indigo-700"
                                              title="Transfer from this location"
                                            >
                                              <ArrowRightLeft size={14} />
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                          <span className="text-xs text-gray-600">Stock:</span>
                                          <span className="text-sm font-bold text-gray-900">
                                            {inv.quantity} {material.unit}
                                          </span>
                                        </div>
                                        {inv.binLocation && (
                                          <div className="mt-1 text-xs text-gray-500">
                                            Bin: {inv.binLocation}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po: any) => (
                  <tr key={po._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{po.poNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {po.project?.projectName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{po.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(po.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(po.orderDate)}
                    </td>
                    <td className="px-6 py-4">
                      {canCreate && po.status === 'Approved' && (
                        <button
                          onClick={() => handleReceivePO(po._id)}
                          className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700"
                        >
                          <CheckCircle size={14} />
                          Receive
                        </button>
                      )}
                      {po.status === 'Received' && (
                        <span className="text-xs text-gray-500">
                          {po.receivedAt ? formatDate(po.receivedAt) : 'Received'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Material Modal */}
      {showMaterialModal && (
        <CreateMaterialModal
          onClose={() => setShowMaterialModal(false)}
          onSuccess={() => {
            setShowMaterialModal(false);
            fetchData();
            fetchAnalytics();
          }}
        />
      )}

      {/* Create PO Modal */}
      {showPOModal && (
        <CreatePOModal
          onClose={() => setShowPOModal(false)}
          onSuccess={() => {
            setShowPOModal(false);
            fetchData();
            fetchAnalytics();
          }}
        />
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedMaterial && (
        <RestockModal
          material={selectedMaterial}
          onClose={() => {
            setShowRestockModal(false);
            setSelectedMaterial(null);
          }}
        />
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && transferData && (
        <StockTransferModal
          material={transferData.material}
          fromLocation={transferData.fromLocation}
          fromLocationType={transferData.fromLocationType}
          availableQty={transferData.availableQty}
          warehouses={warehouses}
          projects={projects}
          onClose={() => {
            setShowTransferModal(false);
            setTransferData(null);
          }}
          onSuccess={() => {
            setShowTransferModal(false);
            setTransferData(null);
            fetchData();
            fetchAnalytics();
          }}
        />
      )}
    </div>
  );
}

interface CreateMaterialModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateMaterialModal({ onClose, onSuccess }: CreateMaterialModalProps) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Other',
    unit: 'pcs',
    costPerUnit: '',
    initialStock: '',
    reorderPoint: '10',
    supplier: '',
    warehouse: '',
  });
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouse');
      setWarehouses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: 'Other',
      unit: 'pcs',
      costPerUnit: '',
      initialStock: '',
      reorderPoint: '10',
      supplier: '',
      warehouse: formData.warehouse, // Keep the same warehouse selected
    });
  };

  const handleSubmit = async (e: React.FormEvent, addAnother: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/materials', {
        ...formData,
        costPerUnit: parseFloat(formData.costPerUnit),
        initialStock: parseFloat(formData.initialStock) || 0,
        reorderPoint: parseInt(formData.reorderPoint),
        warehouse: formData.warehouse || undefined,
      });

      toast.success('Material created successfully and added to warehouse');
      
      if (addAnother) {
        resetForm();
        toast.success('You can add another material', { icon: '➕' });
        onSuccess(); // Refresh the list
      } else {
        onSuccess(); // Close modal and refresh
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create New Material</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse *</label>
            <select
              value={formData.warehouse}
              onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              <option value="">Select a warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name} ({warehouse.code}) - {warehouse.location}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">📦 Materials will be added to this warehouse inventory</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g., SE-2003"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="Cement">Cement</option>
                <option value="Steel">Steel</option>
                <option value="Bricks">Bricks</option>
                <option value="Sand">Sand</option>
                <option value="Aggregate">Aggregate</option>
                <option value="Paint">Paint</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="bags">Bags</option>
                <option value="tons">Tons</option>
                <option value="m">Meter (m)</option>
                <option value="m2">Square Meter (m²)</option>
                <option value="m3">Cubic Meter (m³)</option>
                <option value="liters">Liters</option>
                <option value="gallons">Gallons</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Unit *</label>
              <input
                type="number"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Units *</label>
              <input
                type="number"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Price</label>
              <input
                type="text"
                value={formData.costPerUnit && formData.initialStock ? formatCurrency(parseFloat(formData.costPerUnit) * parseFloat(formData.initialStock)) : formatCurrency(0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                disabled
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Point *</label>
              <input
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                min="0"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save & Add Another'}
              </button>
              <button
                type="submit"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Material'}
              </button>
            </div>
            <p className="text-xs text-center text-gray-500">
              💡 Tip: Use "Save & Add Another" to quickly add multiple materials
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreatePOModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface POItem {
  material: string;
  quantity: number;
  unitPrice: number;
}

function CreatePOModal({ onClose, onSuccess }: CreatePOModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState({
    poNumber: '',
    project: '',
    supplier: '',
    supplierContact: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: '',
    status: 'Draft',
  });
  const [items, setItems] = useState<POItem[]>([{ material: '', quantity: 0, unitPrice: 0 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchMaterials();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { material: '', quantity: 0, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    const updated = [...items];
    (updated[index][field] as any) = value;
    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validItems = items.filter(item => item.material && item.quantity > 0 && item.unitPrice > 0);
      
      if (validItems.length === 0) {
        toast.error('Please add at least one valid item');
        setLoading(false);
        return;
      }

      await api.post('/materials/purchase-orders', {
        ...formData,
        items: validItems,
      });

      toast.success('Purchase Order created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create PO');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create Purchase Order</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PO Number *</label>
              <input
                type="text"
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="PO-2025-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectName} ({project.projectCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Contact</label>
              <input
                type="text"
                value={formData.supplierContact}
                onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery</label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                      <select
                        value={item.material}
                        onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      >
                        <option value="">Select Material</option>
                        {materials.map((material) => (
                          <option key={material._id} value={material._id}>
                            {material.name} ({material.sku}) - {material.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
                      <input
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {item.quantity > 0 && item.unitPrice > 0 && (
                    <div className="mt-2 text-right text-sm">
                      <span className="text-gray-600">Total: </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              rows={3}
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Stock Transfer Modal Component
interface StockTransferModalProps {
  material: Material;
  fromLocation?: any;
  fromLocationType?: 'Project' | 'Warehouse';
  availableQty?: number;
  warehouses: Warehouse[];
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

function StockTransferModal({
  material,
  fromLocation,
  fromLocationType,
  availableQty,
  warehouses,
  projects,
  onClose,
  onSuccess
}: StockTransferModalProps) {
  const [formData, setFormData] = useState({
    fromLocation: fromLocation?._id || '',
    fromLocationType: fromLocationType || '',
    toLocation: '',
    toLocationType: '',
    quantity: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.fromLocation || !formData.toLocation) {
        toast.error('Please select both source and destination');
        setLoading(false);
        return;
      }

      if (formData.fromLocation === formData.toLocation && formData.fromLocationType === formData.toLocationType) {
        toast.error('Source and destination cannot be the same');
        setLoading(false);
        return;
      }

      const qty = parseFloat(formData.quantity);
      if (!qty || qty <= 0) {
        toast.error('Please enter a valid quantity');
        setLoading(false);
        return;
      }

      if (availableQty && qty > availableQty) {
        toast.error(`Quantity cannot exceed available stock (${availableQty})`);
        setLoading(false);
        return;
      }

      await api.post('/stock-transfers', {
        fromLocation: formData.fromLocation,
        fromLocationType: formData.fromLocationType,
        toLocation: formData.toLocation,
        toLocationType: formData.toLocationType,
        items: [{
          material: material._id,
          quantity: qty,
        }],
        notes: formData.notes,
      });

      toast.success('Stock transfer request created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  const allLocations = [
    ...warehouses.map(w => ({ ...w, type: 'Warehouse' as const, displayName: `${w.name} (${w.code})` })),
    ...projects.map(p => ({ ...p, type: 'Project' as const, displayName: `${p.projectName} (${p.projectCode})` }))
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transfer Stock</h2>
              <p className="text-sm text-gray-600 mt-1">
                {material.name} ({material.sku})
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Material Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Material:</span>
                <span className="ml-2 font-medium text-gray-900">{material.name}</span>
              </div>
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-medium text-gray-900">{material.sku}</span>
              </div>
              {availableQty !== undefined && (
                <div className="col-span-2">
                  <span className="text-gray-600">Available at Source:</span>
                  <span className="ml-2 font-semibold text-green-700">{availableQty} {material.unit}</span>
                </div>
              )}
            </div>
          </div>

          {/* From Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Location *</label>
            <select
              value={`${formData.fromLocationType}-${formData.fromLocation}`}
              onChange={(e) => {
                const [type, ...idParts] = e.target.value.split('-');
                const id = idParts.join('-');
                setFormData({
                  ...formData,
                  fromLocation: id,
                  fromLocationType: type as 'Project' | 'Warehouse',
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              disabled={!!fromLocation}
            >
              <option value="">Select source location</option>
              {allLocations.map((loc) => (
                <option key={`${loc.type}-${loc._id}`} value={`${loc.type}-${loc._id}`}>
                  {loc.type === 'Warehouse' ? '🏢' : '🏗️'} {loc.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* To Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Location *</label>
            <select
              value={`${formData.toLocationType}-${formData.toLocation}`}
              onChange={(e) => {
                const [type, ...idParts] = e.target.value.split('-');
                const id = idParts.join('-');
                setFormData({
                  ...formData,
                  toLocation: id,
                  toLocationType: type as 'Project' | 'Warehouse',
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              <option value="">Select destination location</option>
              {allLocations.map((loc) => (
                <option key={`${loc.type}-${loc._id}`} value={`${loc.type}-${loc._id}`}>
                  {loc.type === 'Warehouse' ? '🏢' : '🏗️'} {loc.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Transfer ({material.unit}) *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter quantity"
              min="0"
              step="0.01"
              max={availableQty}
              required
            />
            {availableQty && formData.quantity && parseFloat(formData.quantity) > availableQty && (
              <p className="text-xs text-red-600 mt-1">
                Quantity exceeds available stock ({availableQty} {material.unit})
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              rows={3}
              placeholder="Add any notes about this transfer..."
            />
          </div>

          {/* Transfer Summary */}
          {formData.quantity && formData.fromLocation && formData.toLocation && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-indigo-600 font-medium mb-2">Transfer Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-700">Quantity:</span>
                  <span className="font-semibold text-gray-900">{formData.quantity} {material.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Status:</span>
                  <span className="text-orange-600 font-medium">Pending Approval</span>
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
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating Transfer...' : 'Create Transfer Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RestockModal({ 
  material, 
  onClose 
}: { 
  material: any; 
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [loading, setLoading] = useState(false);

  const totalCost = (parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (!unitCost || parseFloat(unitCost) <= 0) {
      alert('Please enter a valid unit cost');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate new average cost using Moving Average formula
      const currentStock = material.currentStock || 0;
      const currentAvgCost = material.avgUnitCost || 0;
      const addedQty = parseFloat(quantity);
      const addedCost = parseFloat(unitCost);
      
      const newStock = currentStock + addedQty;
      const newAvgCost = ((currentStock * currentAvgCost) + (addedQty * addedCost)) / newStock;

      await api.patch(`/materials/${material._id}`, {
        currentStock: newStock,
        avgUnitCost: newAvgCost
      });

      alert('Material restocked successfully!');
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Error restocking material:', error);
      alert(error.response?.data?.message || 'Failed to restock material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Restock Material</h2>
            <p className="text-sm text-gray-600 mt-1">
              {material.name} ({material.sku})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Stock Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Stock:</span>
              <span className="font-semibold text-gray-900">
                {material.currentStock || 0} {material.unit}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Avg Cost:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(material.avgUnitCost || 0)} / {material.unit}
              </span>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Add *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder={`Enter quantity in ${material.unit}`}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Unit Cost Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Cost *
            </label>
            <input
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter cost per unit"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Total Cost Display */}
          {quantity && unitCost && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                <span className="text-lg font-bold text-indigo-600">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </div>
          )}

          {/* New Stock Preview */}
          {quantity && (
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Stock:</span>
                <span className="font-semibold text-green-700">
                  {((material.currentStock || 0) + (parseFloat(quantity) || 0)).toFixed(2)} {material.unit}
                </span>
              </div>
              {quantity && unitCost && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New Avg Cost:</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(
                      (((material.currentStock || 0) * (material.avgUnitCost || 0)) + 
                       ((parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0))) / 
                      ((material.currentStock || 0) + (parseFloat(quantity) || 0))
                    )} / {material.unit}
                  </span>
                </div>
              )}
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
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Restocking...' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
