import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { X, AlertCircle } from 'lucide-react';
import type { Warehouse, Inventory } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Vendor {
  _id: string;
  vendorCode: string;
  name: string;
  category?: string;
  paymentTerms?: string;
  isActive: boolean;
}

interface RestockMaterialModalProps {
  warehouse: Warehouse;
  inventory: Inventory;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RestockMaterialModal({ warehouse, inventory, onClose, onSuccess }: RestockMaterialModalProps) {
  const material = typeof inventory.material === 'object' ? inventory.material : null;
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState({
    quantity: '',
    costPerUnit: material?.costPerUnit?.toString() || '',
    vendor: '',
    paidAmount: '',
    paymentStatus: 'Pending' as 'Pending' | 'Partial' | 'Paid',
    invoiceNumber: '',
    purchaseOrderNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/materials/vendors');
      setVendors(response.data.data?.filter((v: Vendor) => v.isActive) || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const totalAmount = (parseFloat(formData.costPerUnit) || 0) * (parseFloat(formData.quantity) || 0);
  const paidAmount = parseFloat(formData.paidAmount) || 0;
  const remainingAmount = totalAmount - paidAmount;

  const handleAmountChange = (field: 'costPerUnit' | 'quantity' | 'paidAmount', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    const total = (parseFloat(newFormData.costPerUnit) || 0) * (parseFloat(newFormData.quantity) || 0);
    const paid = parseFloat(newFormData.paidAmount) || 0;
    
    let status: 'Pending' | 'Partial' | 'Paid' = 'Pending';
    if (paid >= total && total > 0) {
      status = 'Paid';
    } else if (paid > 0 && paid < total) {
      status = 'Partial';
    }
    
    setFormData({ ...newFormData, paymentStatus: status });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!material) {
      toast.error('Material information not found');
      return;
    }

    setLoading(true);

    try {
      const quantity = parseFloat(formData.quantity);
      const costPerUnit = parseFloat(formData.costPerUnit);

      // Update material stock
      await api.put(`/materials/${material._id}`, {
        currentStock: material.currentStock + quantity,
        costPerUnit: costPerUnit, // Update with latest cost
      });

      // Update inventory at warehouse - directly increment the quantity
      await api.put(`/warehouse/inventory/${inventory._id}`, {
        quantity: inventory.quantity + quantity,
      });

      // If warehouse linked to project, create expense record (vendor ledger auto-calculated from expenses)
      if (warehouse.project && totalAmount > 0) {
        const projectId = typeof warehouse.project === 'object' ? warehouse.project._id : warehouse.project;
        
        const expenseCount = Date.now();
        const expenseNumber = formData.purchaseOrderNumber || `EXP-RESTOCK-${String(expenseCount).slice(-6)}`;

        await api.post('/expenses', {
          expenseNumber,
          project: projectId,
          category: 'Other',
          expenseType: 'Material',
          description: `Material Restock - ${material.name} (${material.sku})`,
          amount: totalAmount,
          amountPaid: paidAmount,
          date: new Date().toISOString(),
          vendor: formData.vendor || '',
          invoiceNumber: formData.invoiceNumber || '',
          paymentStatus: formData.paymentStatus === 'Paid' ? 'Paid' :
                        formData.paymentStatus === 'Partial' ? 'Partially Paid' : 'Pending',
          notes: `Restocked ${quantity} ${material.unit} at ${formatCurrency(costPerUnit)}/${material.unit} to ${warehouse.name}. ${formData.notes || ''}`.trim(),
        });
      }

      toast.success('Material restocked successfully and ledgers updated');
      onSuccess();
    } catch (error: any) {
      console.error('Error restocking material:', error);
      toast.error(error.response?.data?.message || 'Failed to restock material');
    } finally {
      setLoading(false);
    }
  };

  if (!material) {
    return null;
  }

  const selectedVendor = vendors.find(v => v._id === formData.vendor);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Restock Material</h2>
              <p className="text-sm text-gray-600 mt-1">
                {material.name} ({material.sku}) • Current Stock: {inventory.quantity} {material.unit}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Material Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Restocking existing material</p>
                <p>Category: {material.category} • Unit: {material.unit} • Current Cost: {formatCurrency(material.costPerUnit)}</p>
              </div>
            </div>
          </div>

          {/* Restock Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Restock Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => handleAmountChange('quantity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  New stock: {(inventory.quantity + (parseFloat(formData.quantity) || 0)).toFixed(2)} {material.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Per Unit *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => handleAmountChange('costPerUnit', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor/Supplier *
                </label>
                <select
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select vendor...</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name} ({vendor.vendorCode})
                      {vendor.category && ` - ${vendor.category}`}
                    </option>
                  ))}
                </select>
                {selectedVendor?.paymentTerms && (
                  <p className="text-xs text-gray-500 mt-1">
                    Payment Terms: {selectedVendor.paymentTerms}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Order Number
                </label>
                <input
                  type="text"
                  value={formData.purchaseOrderNumber}
                  onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="PO-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="INV-12345"
                />
              </div>
            </div>
          </div>

          {/* Payment Tracking */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Tracking</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) => handleAmountChange('paidAmount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <div className="flex items-center h-[42px]">
                  <span className={`px-3 py-2 rounded-lg font-medium ${
                    formData.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                    formData.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formData.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-semibold text-green-600">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-semibold text-red-600">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={3}
                placeholder="Additional notes about this restock..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
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
              {loading ? 'Processing...' : 'Restock Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
