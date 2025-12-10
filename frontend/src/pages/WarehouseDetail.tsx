import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, ArrowRight, History, Warehouse as WarehouseIcon, RefreshCw, Plus, RotateCw, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Warehouse, Inventory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { hasPermission } from '../utils/permissions';
import { useAuthStore } from '../store/authStore';
import IssueMaterialModal from '../components/warehouse/IssueMaterialModal';
import MaterialHistoryModal from '../components/warehouse/MaterialHistoryModal';
import AddMaterialToWarehouseModal from '../components/warehouse/AddMaterialToWarehouseModal';
import RestockMaterialModal from '../components/warehouse/RestockMaterialModal';
// import AddMaterialToWarehouseModal from '../components/warehouse/AddMaterialToWarehouseModal';

export default function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [materialHistory, setMaterialHistory] = useState<any[]>([]);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockInventory, setRestockInventory] = useState<Inventory | null>(null);
  const [viewingImages, setViewingImages] = useState<{ material: any; currentIndex: number } | null>(null);

  useEffect(() => {
    if (id) {
      fetchWarehouseDetails();
    }
  }, [id]);

  const fetchWarehouseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/warehouse/${id}`);
      setWarehouse(response.data.data.warehouse);
      setInventory(response.data.data.inventory || []);
    } catch (error: any) {
      console.error('Error fetching warehouse details:', error);
      toast.error('Failed to load warehouse details');
      navigate('/warehouse');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialHistory = async (materialId: string) => {
    try {
      const response = await api.get(`/materials/consumption/history/${materialId}`);
      setMaterialHistory(response.data.data || []);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching material history:', error);
      toast.error('Failed to load material history');
    }
  };

  const handleSyncStock = async () => {
    if (!warehouse) return;
    
    try {
      const response = await api.post('/warehouse/sync-stock', {
        warehouseId: warehouse._id,
      });
      toast.success(response.data.message || 'Stock synced successfully');
      fetchWarehouseDetails(); // Refresh inventory
    } catch (error: any) {
      console.error('Error syncing stock:', error);
      toast.error(error.response?.data?.message || 'Failed to sync stock');
    }
  };

  const canIssue = user && (hasPermission(user.role, 'createMaterial') || user.role === 'Administrator' || user.role === 'Site Manager');

  const totalValue = inventory.reduce((sum, item) => {
    const material = typeof item.material === 'object' ? item.material : null;
    return sum + (item.quantity * (material?.costPerUnit || 0));
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!warehouse) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/warehouse')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <WarehouseIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
              <p className="text-gray-600">{warehouse.code} • {warehouse.location}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {user?.role === 'Administrator' && (
            <>
              <button
                onClick={() => setShowAddMaterialModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Plus size={20} />
                Add Material
              </button>
              <button
                onClick={handleSyncStock}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <RefreshCw size={20} />
                Sync Stock
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Items</p>
          <p className="text-3xl font-bold text-indigo-600">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Capacity</p>
          <p className="text-3xl font-bold text-blue-600">{warehouse.capacity}</p>
          <p className="text-xs text-gray-500 mt-1">units</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block w-3 h-3 rounded-full ${warehouse.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-lg font-semibold text-gray-900">
              {warehouse.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Warehouse Info */}
      {(warehouse.project || warehouse.manager) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Warehouse Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouse.project && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Associated Project</p>
                <p className="text-base font-medium text-gray-900">
                  {typeof warehouse.project === 'object'
                    ? `${warehouse.project.projectName} (${warehouse.project.projectCode})`
                    : warehouse.project}
                </p>
              </div>
            )}
            {warehouse.manager && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Manager</p>
                <p className="text-base font-medium text-gray-900">{warehouse.manager.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No materials in this warehouse</p>
            <p className="text-gray-400 text-sm">
              Materials will appear here when they are received through purchase orders
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bin</th>
                  {canIssue && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => {
                  const material = typeof item.material === 'object' ? item.material : null;
                  if (!material) return null;
                  
                  const totalItemValue = item.quantity * (material.costPerUnit || 0);
                  
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {material.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{material.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                          {material.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {item.quantity} {material.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatCurrency(material.costPerUnit || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(totalItemValue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.binLocation || '-'}
                      </td>
                      {canIssue && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* View Images Button */}
                            {material.images && material.images.length > 0 && (
                              <button
                                onClick={() => setViewingImages({ material, currentIndex: 0 })}
                                className="text-blue-600 hover:text-blue-900 transition relative"
                                title={`View ${material.images.length} image${material.images.length > 1 ? 's' : ''}`}
                              >
                                <ImageIcon size={18} />
                                {material.images.length > 1 && (
                                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                    {material.images.length}
                                  </span>
                                )}
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                setRestockInventory(item);
                                setShowRestockModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                            >
                              <RotateCw size={14} />
                              Restock
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInventory(item);
                                setShowIssueModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition"
                            >
                              <ArrowRight size={14} />
                              Issue
                            </button>
                            <button
                              onClick={() => fetchMaterialHistory(material._id)}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                              <History size={14} />
                              History
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showIssueModal && selectedInventory && warehouse && (
        <IssueMaterialModal
          inventory={selectedInventory}
          warehouse={warehouse}
          onClose={() => {
            setShowIssueModal(false);
            setSelectedInventory(null);
          }}
          onSuccess={() => {
            setShowIssueModal(false);
            setSelectedInventory(null);
            fetchWarehouseDetails();
          }}
        />
      )}

      {showHistory && (
        <MaterialHistoryModal
          history={materialHistory}
          onClose={() => {
            setShowHistory(false);
            setMaterialHistory([]);
          }}
        />
      )}

      {showAddMaterialModal && warehouse && (
        <AddMaterialToWarehouseModal
          warehouse={warehouse}
          onClose={() => setShowAddMaterialModal(false)}
          onSuccess={() => {
            setShowAddMaterialModal(false);
            fetchWarehouseDetails();
          }}
        />
      )}

      {showRestockModal && restockInventory && warehouse && (
        <RestockMaterialModal
          warehouse={warehouse}
          inventory={restockInventory}
          onClose={() => {
            setShowRestockModal(false);
            setRestockInventory(null);
          }}
          onSuccess={() => {
            setShowRestockModal(false);
            setRestockInventory(null);
            fetchWarehouseDetails();
          }}
        />
      )}

      {/* Image Viewer Modal */}
      {viewingImages && (
        <MaterialImageViewerModal
          material={viewingImages.material}
          currentIndex={viewingImages.currentIndex}
          onClose={() => setViewingImages(null)}
          onIndexChange={(newIndex: number) => setViewingImages({ ...viewingImages, currentIndex: newIndex })}
        />
      )}
    </div>
  );
}

// Material Image Viewer Modal Component
interface MaterialImageViewerModalProps {
  material: any;
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

function MaterialImageViewerModal({ material, currentIndex, onClose, onIndexChange }: MaterialImageViewerModalProps) {
  const images = material.images || [];
  const totalImages = images.length;

  if (totalImages === 0) return null;

  const handlePrevious = () => {
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : totalImages - 1);
  };

  const handleNext = () => {
    onIndexChange(currentIndex < totalImages - 1 ? currentIndex + 1 : 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
        title="Close (Esc)"
      >
        <X size={32} />
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg">
        <p className="text-sm font-medium">
          Image {currentIndex + 1} of {totalImages}
        </p>
        <p className="text-xs text-gray-300 mt-1">
          {material.sku} - {material.name}
        </p>
      </div>

      {/* Previous Button */}
      {totalImages > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition"
          title="Previous (←)"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Image Display */}
      <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        <img
          src={images[currentIndex]}
          alt={`Material ${material.sku} - Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image not found</text></svg>';
          }}
        />
      </div>

      {/* Next Button */}
      {totalImages > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition"
          title="Next (→)"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Thumbnail Navigation */}
      {totalImages > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 rounded-lg p-3">
          <div className="flex gap-2 max-w-screen-lg overflow-x-auto">
            {images.map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 transition overflow-hidden ${
                  index === currentIndex
                    ? 'border-blue-500 ring-2 ring-blue-400'
                    : 'border-gray-500 hover:border-gray-300'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23ddd"/></svg>';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Download Button */}
      <a
        href={images[currentIndex]}
        download={`${material.sku}-image-${currentIndex + 1}.jpg`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </a>
    </div>
  );
}

