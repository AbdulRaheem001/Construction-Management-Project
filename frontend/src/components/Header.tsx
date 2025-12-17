import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Bell, LogOut, Menu, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile hamburger menu */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        
        {/* Logo on mobile, full name on desktop */}
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
          <h2 className="text-sm sm:text-xl font-semibold text-gray-800 hidden sm:block">
            International Traders REGD
          </h2>
          <h2 className="text-base font-semibold text-gray-800 sm:hidden">
            CMS
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition relative">
          <Bell size={18} className="text-gray-600 sm:w-5 sm:h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          {/* Hide user info on small mobile screens */}
          <div className="text-right hidden xs:block">
            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">{user?.name}</div>
            <div className="text-[10px] sm:text-xs text-gray-500">{user?.role}</div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
            title="Logout"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
