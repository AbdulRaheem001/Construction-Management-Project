import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency, getStatusColor } from '../utils/formatters';
import PermissionGuard from '../components/PermissionGuard';
import toast from 'react-hot-toast';
import { Plus, Search, Package, AlertTriangle } from 'lucide-react';
import type { Material, PurchaseOrder } from '../types';
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'materials' | 'pos'>('materials');

  useEffect(() => {
    fetchData();
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

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
              onClick={() => toast('Create Material form coming soon!', { icon: '🚧' })}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
              New Material
            </button>
            <button 
              onClick={() => toast('Create Purchase Order form coming soon!', { icon: '🚧' })}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Plus size={20} />
              New PO
            </button>
          </div>
        </PermissionGuard>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div key={material._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{material.name}</h3>
                    <p className="text-sm text-gray-600">{material.sku}</p>
                  </div>
                </div>
                {material.currentStock !== undefined && material.currentStock < material.reorderPoint && (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{material.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unit:</span>
                  <span className="font-medium text-gray-900">{material.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost/Unit:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(material.costPerUnit)}</span>
                </div>
                {material.currentStock !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-medium ${
                      material.currentStock < material.reorderPoint ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {material.currentStock} {material.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                pos.map((po) => (
                  <tr key={po._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{po.poNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{po.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(po.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(po.orderDate).toLocaleDateString()}
                    </td>
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
