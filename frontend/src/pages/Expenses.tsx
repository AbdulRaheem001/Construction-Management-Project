import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters';
import PermissionGuard from '../components/PermissionGuard';
import toast from 'react-hot-toast';
import { Plus, Search, DollarSign, TrendingUp, FileText, X, Edit2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Expense, Project } from '../types';

export default function Expenses() {
  return (
    <Routes>
      <Route index element={<ExpensesList />} />
    </Routes>
  );
}

function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [activeStatCard, setActiveStatCard] = useState<'all' | 'paid' | 'pending'>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingImages, setViewingImages] = useState<{ expense: Expense; currentIndex: number } | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      const expensesData = response.data.data || [];
      
      // Debug: Check for expenses with images
      const expensesWithImages = expensesData.filter((e: Expense) => e.images && e.images.length > 0);
      console.log(`📸 Found ${expensesWithImages.length} expenses with images out of ${expensesData.length} total`);
      if (expensesWithImages.length > 0) {
        console.log('Expenses with images:', expensesWithImages.map((e: Expense) => ({
          number: e.expenseNumber,
          imageCount: e.images?.length
        })));
      }
      
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || expense.category === filterCategory;
    const matchesStatus = !filterStatus || expense.paymentStatus === filterStatus;
    
    // Filter based on active stat card
    let matchesStatCard = true;
    if (activeStatCard === 'paid') {
      matchesStatCard = expense.paymentStatus === 'Paid';
    } else if (activeStatCard === 'pending') {
      matchesStatCard = expense.paymentStatus === 'Pending' || expense.paymentStatus === 'Partially Paid';
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStatCard;
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate paid: includes fully paid + amount paid from partially paid
  const paidExpenses = expenses.reduce((sum, exp) => {
    if (exp.paymentStatus === 'Paid') {
      return sum + exp.amount;
    } else if (exp.paymentStatus === 'Partially Paid') {
      const amountPaid = exp.amountPaid || 0;
      return sum + amountPaid;
    }
    return sum;
  }, 0);
  
  // Calculate pending: includes "Pending" status + remaining amount from "Partially Paid"
  const pendingExpenses = expenses.reduce((sum, exp) => {
    if (exp.paymentStatus === 'Pending') {
      return sum + exp.amount;
    } else if (exp.paymentStatus === 'Partially Paid') {
      const amountPaid = exp.amountPaid || 0;
      return sum + (exp.amount - amountPaid);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track expenses, payments, and financial reports</p>
        </div>
        <PermissionGuard permission="createExpense" showMessage>
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            New Expense
          </button>
        </PermissionGuard>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <button
          onClick={() => setActiveStatCard('all')}
          className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-2 transition-all hover:shadow-md ${
            activeStatCard === 'all' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
              {activeStatCard === 'all' && (
                <p className="text-xs text-blue-600 mt-1">Showing all expenses</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              activeStatCard === 'all' ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveStatCard('paid')}
          className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-2 transition-all hover:shadow-md ${
            activeStatCard === 'paid' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Paid</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(paidExpenses)}</p>
              {activeStatCard === 'paid' && (
                <p className="text-xs text-green-600 mt-1">Showing paid expenses</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              activeStatCard === 'paid' ? 'bg-green-600' : 'bg-green-500'
            }`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveStatCard('pending')}
          className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-2 transition-all hover:shadow-md ${
            activeStatCard === 'pending' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(pendingExpenses)}</p>
              {activeStatCard === 'pending' && (
                <p className="text-xs text-orange-600 mt-1">Showing pending & partial</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              activeStatCard === 'pending' ? 'bg-orange-600' : 'bg-orange-500'
            }`}>
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
          >
            <option value="">All Categories</option>
            <option value="Material">Material</option>
            <option value="Labour">Labour</option>
            <option value="Equipment">Equipment</option>
            <option value="General">General</option>
            <option value="Overhead">Overhead</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Expenses Table - Grouped by Project */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
              No expenses found
            </div>
          ) : (
            (() => {
              // Group expenses by project
              const expensesByProject = filteredExpenses.reduce((acc, expense) => {
                const projectId = typeof expense.project === 'object' && expense.project 
                  ? expense.project._id 
                  : expense.project || 'unassigned';
                const projectName = typeof expense.project === 'object' && expense.project 
                  ? expense.project.projectName 
                  : 'Unassigned';
                
                if (!acc[projectId]) {
                  acc[projectId] = {
                    name: projectName,
                    expenses: []
                  };
                }
                acc[projectId].expenses.push(expense);
                return acc;
              }, {} as Record<string, { name: string; expenses: Expense[] }>);

              return Object.entries(expensesByProject).map(([projectId, { name, expenses: projectExpenses }]) => {
                // Calculate project totals
                const projectTotal = projectExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                const projectPaid = projectExpenses.reduce((sum, exp) => {
                  if (exp.paymentStatus === 'Paid') return sum + exp.amount;
                  if (exp.paymentStatus === 'Partially Paid') {
                    const amountPaid = exp.amountPaid || 0;
                    return sum + amountPaid;
                  }
                  return sum;
                }, 0);
                const projectPending = projectExpenses.reduce((sum, exp) => {
                  if (exp.paymentStatus === 'Pending') return sum + exp.amount;
                  if (exp.paymentStatus === 'Partially Paid') {
                    const amountPaid = exp.amountPaid || 0;
                    return sum + (exp.amount - amountPaid);
                  }
                  return sum;
                }, 0);

                return (
                  <div key={projectId} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Project Header */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {projectExpenses.length} expense{projectExpenses.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(projectTotal)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Paid</p>
                            <p className="text-sm font-bold text-green-600">{formatCurrency(projectPaid)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Pending</p>
                            <p className="text-sm font-bold text-orange-600">{formatCurrency(projectPending)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Expenses Table */}
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase">Expense #</th>
                          <th className="px-6 py-3 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-6 py-3 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {projectExpenses.map((expense) => {
                          const amountPaid = expense.amountPaid || 0;
                          let remainingAmount = expense.amount;
                          
                          if (expense.paymentStatus === 'Partially Paid') {
                            remainingAmount = expense.amount - amountPaid;
                          } else if (expense.paymentStatus === 'Pending') {
                            remainingAmount = expense.amount;
                          }
                          
                          const isPending = expense.paymentStatus === 'Pending' || expense.paymentStatus === 'Partially Paid';
                          
                          return (
                            <tr key={expense._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.expenseNumber}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{expense.description}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{expense.expenseType}</td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{formatCurrency(expense.amount)}</span>
                                  {isPending && (
                                    <span className="text-xs text-orange-600 font-medium mt-1">
                                      Pending: {formatCurrency(remainingAmount)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{formatDate(expense.date)}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.paymentStatus)}`}>
                                  {expense.paymentStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {/* View Images Button */}
                                  {expense.images && expense.images.length > 0 && (
                                    <button
                                      onClick={() => setViewingImages({ expense, currentIndex: 0 })}
                                      className="text-blue-600 hover:text-blue-900 transition relative"
                                      title={`View ${expense.images.length} image${expense.images.length > 1 ? 's' : ''}`}
                                    >
                                      <ImageIcon size={18} />
                                      {expense.images.length > 1 && (
                                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                          {expense.images.length}
                                        </span>
                                      )}
                                    </button>
                                  )}
                                  
                                  {/* Edit Button */}
                                  <PermissionGuard permission="updateExpense" showMessage={false}>
                                    <button
                                      onClick={() => setEditingExpense(expense)}
                                      className="text-indigo-600 hover:text-indigo-900 transition"
                                      title="Edit expense"
                                    >
                                      <Edit2 size={18} />
                                    </button>
                                  </PermissionGuard>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              });
            })()
          )}
        </div>
      )}

      {/* New Expense Modal */}
      {showExpenseModal && (
        <NewExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={() => {
            setShowExpenseModal(false);
            fetchExpenses();
          }}
        />
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null);
            fetchExpenses();
          }}
        />
      )}

      {/* Image Viewer Modal */}
      {viewingImages && (
        <ImageViewerModal
          expense={viewingImages.expense}
          currentIndex={viewingImages.currentIndex}
          onClose={() => setViewingImages(null)}
          onIndexChange={(newIndex) => setViewingImages({ ...viewingImages, currentIndex: newIndex })}
        />
      )}
    </div>
  );
}

// New Expense Modal Component
interface NewExpenseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ExpenseFormData {
  project: string;
  description: string;
  amount: string;
  category: string;
  expenseType: string;
  paymentStatus: string;
  date: string;
  vendor: string;
  invoiceNumber: string;
  images: File[];
  notes: string;
  amountPaid: string;
  paymentMethod: string;
}

function NewExpenseModal({ onClose, onSuccess }: NewExpenseModalProps) {
  const initialFormData: ExpenseFormData = {
    project: '',
    description: '',
    amount: '',
    category: '',
    expenseType: 'General',
    paymentStatus: 'Pending',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    invoiceNumber: '',
    images: [],
    notes: '',
    amountPaid: '',
    paymentMethod: 'Cash',
  };

  const [expenses, setExpenses] = useState<ExpenseFormData[]>([initialFormData]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAddExpense = () => {
    setExpenses([...expenses, { ...initialFormData }]);
    setActiveTab(expenses.length);
  };

  const handleRemoveExpense = (index: number) => {
    if (expenses.length > 1) {
      const newExpenses = expenses.filter((_: ExpenseFormData, i: number) => i !== index);
      setExpenses(newExpenses);
      if (activeTab >= newExpenses.length) {
        setActiveTab(newExpenses.length - 1);
      }
    }
  };

  const handleExpenseChange = (index: number, field: keyof ExpenseFormData, value: string) => {
    const newExpenses = [...expenses];
    if (field !== 'images') {
      newExpenses[index][field] = value;
      setExpenses(newExpenses);
    }
  };

  const handleImageChange = (index: number, files: FileList | null) => {
    if (files) {
      const newExpenses = [...expenses];
      const fileArray = Array.from(files);
      
      // Validate file sizes (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = fileArray.filter(f => f.size > maxSize);
      if (oversizedFiles.length > 0) {
        toast.error(`Some files are too large. Maximum size is 10MB per image.`);
        return;
      }
      
      // Limit total images to 10
      const currentImageCount = newExpenses[index].images.length;
      const newImageCount = fileArray.length;
      if (currentImageCount + newImageCount > 10) {
        toast.error(`Maximum 10 images allowed per expense. You already have ${currentImageCount} image(s).`);
        return;
      }
      
      newExpenses[index].images = [...newExpenses[index].images, ...fileArray];
      setExpenses(newExpenses);
      toast.success(`${fileArray.length} image(s) added`);
    }
  };

  const handleRemoveImage = (expenseIndex: number, imageIndex: number) => {
    const newExpenses = [...expenses];
    newExpenses[expenseIndex].images = newExpenses[expenseIndex].images.filter((_, i) => i !== imageIndex);
    setExpenses(newExpenses);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const maxWidth = 1920;
          const maxHeight = 1920;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.8 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return compressImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let successCount = 0;
      let failCount = 0;

      // Submit all expenses
      for (const expense of expenses) {
        try {
          // Convert and compress images to base64
          const imageBase64Array: string[] = [];
          if (expense.images && expense.images.length > 0) {
            toast.loading(`Compressing ${expense.images.length} image(s)...`, { id: 'compress' });
            for (let i = 0; i < expense.images.length; i++) {
              const imageFile = expense.images[i];
              const base64 = await convertImageToBase64(imageFile);
              imageBase64Array.push(base64);
            }
            toast.success('Images compressed successfully', { id: 'compress' });
          }

          const expenseData: any = {
            project: expense.project,
            description: expense.description,
            amount: parseFloat(expense.amount),
            category: expense.category || undefined,
            expenseType: expense.expenseType || undefined,
            paymentStatus: expense.paymentStatus,
            paymentMethod: expense.paymentMethod || undefined,
            date: expense.date,
            vendor: expense.vendor || undefined,
            invoiceNumber: expense.invoiceNumber || undefined,
            images: imageBase64Array.length > 0 ? imageBase64Array : undefined,
            notes: expense.notes || undefined,
          };

          // Add amountPaid for partially paid expenses
          if (expense.paymentStatus === 'Partially Paid' && expense.amountPaid) {
            expenseData.amountPaid = parseFloat(expense.amountPaid);
          }

          await api.post('/expenses', expenseData);
          successCount++;
        } catch (error) {
          failCount++;
          console.error('Error creating expense:', error);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} expense${successCount > 1 ? 's' : ''} created successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
      }
      if (failCount > 0 && successCount === 0) {
        toast.error('Failed to create expenses');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create expenses');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Permits',
    'Utilities',
    'Transportation',
    'Accommodation',
    'Insurance',
    'Legal',
    'Consulting',
    'Office Supplies',
    'Communications',
    'Marketing',
    'Training',
    'Safety Equipment',
    'Waste Disposal',
    'Security',
    'Other',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Add Multiple Expenses</h2>
              <p className="text-sm text-gray-500 mt-1">Add multiple expenses in one go</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>

          {/* Tabs for multiple expenses */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {expenses.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeTab === index
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expense {index + 1}
                {expenses.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExpense(index);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={handleAddExpense}
              className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition whitespace-nowrap"
            >
              + Add Another
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Expense Form */}
          {expenses.map((expense, index) => (
            <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
              {/* Project Selection - MANDATORY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  value={expense.project}
                  onChange={(e) => handleExpenseChange(index, 'project', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.projectName} ({project.projectCode})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">This expense will be allocated to the selected project</p>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={expense.description}
                  onChange={(e) => handleExpenseChange(index, 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Office supplies, Equipment rental"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (PKR)</label>
                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={expense.date}
                    onChange={(e) => handleExpenseChange(index, 'date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category (Optional)</label>
                  <input
                    list={`categories-${index}`}
                    value={expense.category}
                    onChange={(e) => handleExpenseChange(index, 'category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Select or type a category"
                  />
                  <datalist id={`categories-${index}`}>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">Select from list or type your own</p>
                </div>

                {/* Expense Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expense Type</label>
                  <input
                    type="text"
                    list={`expenseTypes-${index}`}
                    value={expense.expenseType}
                    onChange={(e) => handleExpenseChange(index, 'expenseType', e.target.value)}
                    placeholder="Enter or select expense type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <datalist id={`expenseTypes-${index}`}>
                    <option value="Material" />
                    <option value="Labour" />
                    <option value="Equipment" />
                    <option value="General" />
                    <option value="Overhead" />
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">Select from list or type your own</p>
                </div>
              </div>

              {/* Payment Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={expense.paymentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      handleExpenseChange(index, 'paymentStatus', newStatus);
                      if (newStatus === 'Paid') {
                        handleExpenseChange(index, 'amountPaid', expense.amount);
                      } else if (newStatus !== 'Partially Paid') {
                        handleExpenseChange(index, 'amountPaid', '');
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={expense.paymentMethod || 'Cash'}
                    onChange={(e) => handleExpenseChange(index, 'paymentMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>

                {/* Amount Paid - Show only for Partially Paid */}
                {expense.paymentStatus === 'Partially Paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Paid (PKR)
                    </label>
                    <input
                      type="number"
                      value={expense.amountPaid}
                      onChange={(e) => handleExpenseChange(index, 'amountPaid', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      step="0.01"
                      min="0"
                      max={expense.amount}
                      placeholder="Enter amount paid"
                    />
                    {expense.amount && expense.amountPaid && (
                      <p className="text-xs text-orange-600 mt-1">
                        Remaining: {formatCurrency(parseFloat(expense.amount) - parseFloat(expense.amountPaid))}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor (Optional)</label>
                  <input
                    type="text"
                    value={expense.vendor}
                    onChange={(e) => handleExpenseChange(index, 'vendor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Vendor name"
                  />
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice # (Optional)</label>
                  <input
                    type="text"
                    value={expense.invoiceNumber}
                    onChange={(e) => handleExpenseChange(index, 'invoiceNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Invoice number"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Images (Optional)</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg"
                        multiple
                        onChange={(e) => handleImageChange(index, e.target.files)}
                      />
                    </label>
                  </div>
                  
                  {/* Preview uploaded images */}
                  {expense.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {expense.images.map((file, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${imgIndex + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, imgIndex)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={14} />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={expense.notes}
                  onChange={(e) => handleExpenseChange(index, 'notes', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="Additional notes or comments..."
                />
              </div>

              {/* Summary Display */}
              {expense.amount && expense.project && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mt-4">
                  <p className="text-sm text-indigo-600 font-medium mb-1">Expense Summary</p>
                  <p className="text-2xl font-bold text-indigo-900">{formatCurrency(parseFloat(expense.amount))}</p>
                  <p className="text-xs text-indigo-600 mt-1">
                    Will be allocated to: {projects.find(p => p._id === expense.project)?.projectName}
                  </p>
                  
                  {expense.paymentStatus === 'Partially Paid' && expense.amountPaid && (
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-indigo-600">Amount Paid:</span>
                        <span className="font-semibold text-green-700">{formatCurrency(parseFloat(expense.amountPaid))}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-indigo-600">Pending:</span>
                        <span className="font-semibold text-orange-700">
                          {formatCurrency(parseFloat(expense.amount) - parseFloat(expense.amountPaid))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Total Summary for All Expenses */}
          {expenses.length > 1 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200 mt-6">
              <p className="text-sm text-purple-600 font-medium mb-2">Total Summary (All {expenses.length} Expenses)</p>
              <p className="text-3xl font-bold text-purple-900">
                {formatCurrency(
                  expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
                )}
              </p>
              <div className="mt-2 text-xs text-purple-600">
                {expenses.filter(e => e.project && e.amount).length} of {expenses.length} expenses completed
              </div>
            </div>
          )}

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
              {loading ? 'Creating...' : `Create ${expenses.length} Expense${expenses.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Expense Modal Component
interface EditExpenseModalProps {
  expense: Expense;
  onClose: () => void;
  onSuccess: () => void;
}

function EditExpenseModal({ expense, onClose, onSuccess }: EditExpenseModalProps) {
  const [formData, setFormData] = useState({
    paymentStatus: expense.paymentStatus,
    amountPaid: expense.amountPaid?.toString() || '',
    paymentMethod: expense.paymentMethod || '',
    paymentDate: expense.paymentDate ? new Date(expense.paymentDate).toISOString().split('T')[0] : '',
    notes: expense.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod || undefined,
        paymentDate: formData.paymentDate || undefined,
        notes: formData.notes || undefined,
      };

      // Add amountPaid for partially paid expenses
      if (formData.paymentStatus === 'Partially Paid' && formData.amountPaid) {
        // Add to existing amount if there was a previous payment
        const previousPaid = expense.amountPaid || 0;
        updateData.amountPaid = previousPaid + parseFloat(formData.amountPaid);
      } else if (formData.paymentStatus === 'Paid') {
        updateData.amountPaid = expense.amount;
      }

      await api.put(`/expenses/${expense._id}`, updateData);
      toast.success('Expense updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Expense</h2>
              <p className="text-sm text-gray-500 mt-1">{expense.expenseNumber}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Expense Details Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Expense Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Project:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {typeof expense.project === 'object' && expense.project ? expense.project.projectName : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <span className="ml-2 font-medium text-gray-900">{formatCurrency(expense.amount)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Description:</span>
                <span className="ml-2 font-medium text-gray-900">{expense.description}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {expense.paymentHistory && expense.paymentHistory.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Payment History ({expense.paymentHistory.length} payment{expense.paymentHistory.length > 1 ? 's' : ''})
              </h3>
              <div className="space-y-2">
                {expense.paymentHistory.map((payment, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-600">Payment #{index + 1}</span>
                          <span className="text-xs text-gray-500">{formatDate(payment.paymentDate)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="font-semibold text-green-700">{formatCurrency(payment.amount)}</span>
                          {payment.paymentMethod && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{payment.paymentMethod}</span>
                          )}
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Total Paid:</span>
                  <span className="text-lg font-bold text-green-700">{formatCurrency(expense.amountPaid || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status *</label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => {
                const newStatus = e.target.value as 'Pending' | 'Paid' | 'Partially Paid' | 'Overdue';
                setFormData({ 
                  ...formData, 
                  paymentStatus: newStatus,
                  amountPaid: newStatus === 'Paid' ? expense.amount.toString() : (newStatus === 'Pending' ? '' : formData.amountPaid)
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Amount Paid - Show for Partially Paid */}
          {formData.paymentStatus === 'Partially Paid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {expense.amountPaid && expense.amountPaid > 0 ? 'Additional Payment Amount (PKR)' : 'Payment Amount (PKR)'}
              </label>
              <input
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                step="0.01"
                min="0"
                max={expense.amount - (expense.amountPaid || 0)}
                placeholder="Enter payment amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                {expense.amountPaid && expense.amountPaid > 0 
                  ? 'This will be added to your payment history as a new payment record'
                  : 'This payment will be recorded in the payment history'}
              </p>
              {formData.amountPaid && (
                <div className="mt-2 space-y-1">
                  {expense.amountPaid && expense.amountPaid > 0 && (
                    <p className="text-xs text-blue-600">
                      Total paid will be: {formatCurrency((expense.amountPaid || 0) + parseFloat(formData.amountPaid))}
                    </p>
                  )}
                  <p className="text-xs text-orange-600">
                    Remaining after payment: {formatCurrency(expense.amount - ((expense.amountPaid || 0) + parseFloat(formData.amountPaid)))}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Show amount paid as read-only for Paid status */}
          {formData.paymentStatus === 'Paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Fully Paid:</span> {formatCurrency(expense.amount)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select method</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
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
              placeholder="Add any payment notes or comments..."
            />
          </div>

          {/* Payment Summary */}
          {(formData.paymentStatus === 'Partially Paid' || formData.paymentStatus === 'Paid') && formData.amountPaid && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-indigo-600 font-medium mb-2">Payment Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-700">Total Amount:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                </div>
                {expense.amountPaid && expense.amountPaid > 0 && formData.paymentStatus === 'Partially Paid' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Previously Paid:</span>
                      <span className="font-semibold text-blue-700">{formatCurrency(expense.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Additional Payment:</span>
                      <span className="font-semibold text-green-700">{formatCurrency(parseFloat(formData.amountPaid))}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-indigo-200">
                      <span className="text-indigo-700 font-medium">Total Paid:</span>
                      <span className="font-bold text-green-700">{formatCurrency((expense.amountPaid || 0) + parseFloat(formData.amountPaid))}</span>
                    </div>
                  </>
                )}
                {(!expense.amountPaid || expense.amountPaid === 0) && (
                  <div className="flex justify-between">
                    <span className="text-indigo-700">Amount Paid:</span>
                    <span className="font-semibold text-green-700">{formatCurrency(parseFloat(formData.amountPaid))}</span>
                  </div>
                )}
                {formData.paymentStatus === 'Partially Paid' && (
                  <div className="flex justify-between pt-2 border-t border-indigo-200">
                    <span className="text-indigo-700 font-medium">Remaining:</span>
                    <span className="font-bold text-orange-700">{formatCurrency(expense.amount - ((expense.amountPaid || 0) + parseFloat(formData.amountPaid)))}</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Image Viewer Modal Component
interface ImageViewerModalProps {
  expense: Expense;
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

function ImageViewerModal({ expense, currentIndex, onClose, onIndexChange }: ImageViewerModalProps) {
  const images = expense.images || [];
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
          {expense.expenseNumber} - {expense.description}
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
          alt={`Expense ${expense.expenseNumber} - Image ${currentIndex + 1}`}
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
            {images.map((img, index) => (
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
        download={`${expense.expenseNumber}-image-${currentIndex + 1}.jpg`}
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


