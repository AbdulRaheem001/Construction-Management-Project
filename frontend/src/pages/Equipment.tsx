import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency, getStatusColor } from '../utils/formatters';
import PermissionGuard from '../components/PermissionGuard';
import toast from 'react-hot-toast';
import { Plus, Search, Wrench } from 'lucide-react';
import type { Equipment } from '../types';

export default function EquipmentPage() {
  return (
    <Routes>
      <Route index element={<EquipmentList />} />
    </Routes>
  );
}

function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data.data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-1">Track equipment, usage, and maintenance</p>
        </div>
        <PermissionGuard permission="createEquipment" showMessage>
          <button 
            onClick={() => toast('Add Equipment form coming soon!', { icon: '🚧' })}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            Add Equipment
          </button>
        </PermissionGuard>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.assetId}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="space-y-2">
                {item.make && item.model && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Make/Model:</span>
                    <span className="font-medium text-gray-900">{item.make} {item.model}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Condition:</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.condition)}`}>
                    {item.condition}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900 truncate ml-2">{item.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Purchase Value:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(item.purchaseValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Value:</span>
                  <span className="font-medium text-green-600">{formatCurrency(item.currentValue)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button className="flex-1 text-sm text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg transition font-medium">
                  View Details
                </button>
                <button className="flex-1 text-sm text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition font-medium">
                  Maintenance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
