import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    // Project status
    'Planning': 'bg-yellow-100 text-yellow-800',
    'Active': 'bg-green-100 text-green-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-blue-100 text-blue-800',
    'Cancelled': 'bg-red-100 text-red-800',
    
    // PO status
    'Draft': 'bg-gray-100 text-gray-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Partially Received': 'bg-blue-100 text-blue-800',
    'Fully Received': 'bg-green-100 text-green-800',
    
    // Timesheet status
    'Submitted': 'bg-blue-100 text-blue-800',
    'Rejected': 'bg-red-100 text-red-800',
    
    // Equipment condition
    'Excellent': 'bg-green-100 text-green-800',
    'Good': 'bg-blue-100 text-blue-800',
    'Fair': 'bg-yellow-100 text-yellow-800',
    'Poor': 'bg-red-100 text-red-800',
    
    // Payment status
    'Paid': 'bg-green-100 text-green-800',
    'Overdue': 'bg-red-100 text-red-800',
    
    // General status
    'Inactive': 'bg-gray-100 text-gray-800',
    'On Leave': 'bg-yellow-100 text-yellow-800',
    'Available': 'bg-green-100 text-green-800',
    'In Use': 'bg-blue-100 text-blue-800',
    'Under Maintenance': 'bg-orange-100 text-orange-800',
    'Retired': 'bg-gray-100 text-gray-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const truncate = (str: string, length: number): string => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};
