import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import type { Warehouse } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Vendor {
  _id: string;
  vendorCode: string;
  name: string;
  category?: string;
  paymentTerms?: string;
  isActive: boolean;
}

interface AddMaterialToWarehouseModalProps {
  warehouse: Warehouse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMaterialToWarehouseModal({ warehouse, onClose, onSuccess }: AddMaterialToWarehouseModalProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Other',
    unit: 'pcs',
    costPerUnit: '',
    quantity: '',
    reorderPoint: '10',
    supplier: '',
    vendor: '',
    // Payment tracking fields
    paidAmount: '',
    paymentStatus: 'Pending' as 'Pending' | 'Partial' | 'Paid',
    invoiceNumber: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create material with warehouse
      const materialResponse = await api.post('/materials', {
        sku: formData.sku.toUpperCase(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        costPerUnit: parseFloat(formData.costPerUnit),
        initialStock: parseFloat(formData.quantity),
        reorderPoint: parseInt(formData.reorderPoint),
        supplier: formData.supplier,
        warehouse: warehouse._id,
      });

      const material = materialResponse.data.data;

      // If warehouse is linked to project, create expense record (vendor ledger auto-calculated from expenses)
      if (warehouse.project && totalAmount > 0) {
        const projectId = typeof warehouse.project === 'object' ? warehouse.project._id : warehouse.project;
        
        const expenseCount = Date.now(); // Use timestamp for uniqueness
        const expenseNumber = `EXP-MAT-${String(expenseCount).slice(-6)}`;

        await api.post('/expenses', {
          expenseNumber,
          project: projectId,
          category: 'Other',
          expenseType: 'Material',
          description: `Material Purchase - ${formData.name} (${formData.sku})${formData.supplier ? ' from ' + formData.supplier : ''}`,
          amount: totalAmount,
          amountPaid: paidAmount,
          date: new Date().toISOString(),
          vendor: formData.vendor || formData.supplier || '',
          invoiceNumber: formData.invoiceNumber || formData.sku,
          paymentStatus: formData.paymentStatus === 'Paid' ? 'Paid' :
                        formData.paymentStatus === 'Partial' ? 'Partially Paid' : 'Pending',
          notes: `Material added to ${warehouse.name}. ${formData.notes || ''}`.trim(),
        });
      }

      toast.success('Material added successfully. Warehouse, expenses, and vendor ledger updated');
      onSuccess();
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast.error(error.response?.data?.message || 'Failed to add material');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate payment status based on amounts
  const handleAmountChange = (field: 'costPerUnit' | 'quantity' | 'paidAmount', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'costPerUnit' || field === 'quantity' || field === 'paidAmount') {
      const total = (parseFloat(newFormData.costPerUnit) || 0) * (parseFloat(newFormData.quantity) || 0);
      const paid = parseFloat(newFormData.paidAmount) || 0;
      
      let status: 'Pending' | 'Partial' | 'Paid' = 'Pending';
      if (paid >= total && total > 0) {
        status = 'Paid';
      } else if (paid > 0 && paid < total) {
        status = 'Partial';
      }
      
      newFormData.paymentStatus = status;
    }
    
    setFormData(newFormData);
  };

  const warehouseProject = warehouse.project && typeof warehouse.project === 'object' 
    ? warehouse.project 
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Material to Warehouse</h2>
              <p className="text-sm text-gray-600 mt-1">
                {warehouse.name} ({warehouse.code})
                {warehouseProject && ` → ${warehouseProject.projectName}`}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Banner */}
          {warehouseProject && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>📊 Expense Tracking:</strong> This material cost will be automatically recorded in{' '}
                <strong>{warehouseProject.projectName}</strong> project expenses with payment status tracking.
              </p>
            </div>
          )}

          {/* Material Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number (SKU) *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g., MAT-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g., Steel Rods"
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
                onChange={(e) => handleAmountChange('costPerUnit', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleAmountChange('quantity', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                step="0.01"
                min="0"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
              <input
                type="text"
                value={formatCurrency(totalAmount)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                disabled
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Point</label>
              <input
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor/Supplier *</label>
              <select
                value={formData.vendor}
                onChange={(e) => {
                  const selectedVendor = vendors.find(v => v._id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    vendor: e.target.value,
                    supplier: selectedVendor?.name || formData.supplier
                  });
                }}
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
              {formData.vendor && vendors.find(v => v._id === formData.vendor)?.paymentTerms && (
                <p className="text-xs text-gray-500 mt-1">
                  Payment Terms: {vendors.find(v => v._id === formData.vendor)?.paymentTerms}
                </p>
              )}
            </div>
          </div>

          {/* Payment Tracking Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💳 Payment Tracking</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
                <input
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => handleAmountChange('paidAmount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="INV-001"
                />
              </div>
            </div>

            {/* Payment Summary */}
            {totalAmount > 0 && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Amount:</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Paid Amount:</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining:</p>
                    <p className={`text-lg font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(remainingAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    formData.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                    formData.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formData.paymentStatus === 'Paid' ? '✓ Fully Paid' :
                     formData.paymentStatus === 'Partial' ? '⚠ Partially Paid' :
                     '⏳ Payment Pending'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description & Notes */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={2}
                placeholder="Material description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={2}
                placeholder="Payment terms, delivery details, etc..."
              />
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding Material...' : 'Add to Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
