import { X, History } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface MaterialHistoryModalProps {
  history: any[];
  onClose: () => void;
}

export default function MaterialHistoryModal({ history, onClose }: MaterialHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Material Consumption History</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No consumption history found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record, index) => (
                <div
                  key={record._id || index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {record.quantity} {record.material?.unit || 'units'} issued
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        To: {record.project?.projectName || 'Unknown Project'}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {formatDate(record.date || record.createdAt)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {record.usedBy && (
                      <div>
                        <span className="text-gray-600">Used By:</span>
                        <span className="ml-2 font-medium text-gray-900">{record.usedBy}</span>
                      </div>
                    )}
                    {record.purpose && (
                      <div>
                        <span className="text-gray-600">Purpose:</span>
                        <span className="ml-2 font-medium text-gray-900">{record.purpose}</span>
                      </div>
                    )}
                    {record.consumedBy && (
                      <div>
                        <span className="text-gray-600">Issued By:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {record.consumedBy?.name || 'System'}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Value:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatCurrency(record.totalCost || 0)}
                      </span>
                    </div>
                  </div>
                  
                  {record.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Notes:</span> {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
