import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '../lib/api';
import PermissionGuard from '../components/PermissionGuard';
import toast from 'react-hot-toast';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import type { Warehouse as WarehouseType, Inventory } from '../types';

export default function Warehouse() {
  return (
    <Routes>
      <Route index element={<WarehouseList />} />
    </Routes>
  );
}

function WarehouseList() {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'warehouses' | 'inventory'>('warehouses');

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      if (tab === 'warehouses') {
        const response = await api.get('/warehouse');
        setWarehouses(response.data.data || []);
      } else {
        const response = await api.get('/warehouse/inventory');
        setInventory(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600 mt-1">Manage warehouses, inventory, and stock transfers</p>
        </div>
        <PermissionGuard permission="createWarehouse" showMessage>
          <button 
            onClick={() => toast(`${tab === 'warehouses' ? 'Add Warehouse' : 'Stock Transfer'} form coming soon!`, { icon: '🚧' })}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            {tab === 'warehouses' ? 'Add Warehouse' : 'Stock Transfer'}
          </button>
        </PermissionGuard>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setTab('warehouses')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                tab === 'warehouses'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Warehouses
            </button>
            <button
              onClick={() => setTab('inventory')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                tab === 'inventory'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Inventory
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : tab === 'warehouses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <div key={warehouse._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <WarehouseIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{warehouse.name}</h3>
                  <p className="text-sm text-gray-600">{warehouse.code}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{warehouse.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium text-gray-900">{warehouse.capacity} units</span>
                </div>
                {warehouse.manager && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium text-gray-900">{warehouse.manager.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${warehouse.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition font-medium text-sm">
                View Inventory
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bin Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No inventory records found
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {typeof item.material === 'object' ? item.material.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.binLocation || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.lastUpdated).toLocaleDateString()}
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
