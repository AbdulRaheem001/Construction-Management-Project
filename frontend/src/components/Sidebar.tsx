import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { canAccessModule } from '../utils/permissions';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Wrench,
  Warehouse,
  DollarSign,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'projects', label: 'Projects', icon: Building2, path: '/projects' },
  { id: 'materials', label: 'Materials', icon: Package, path: '/materials' },
  { id: 'labour', label: 'Labour', icon: Users, path: '/labour' },
  { id: 'equipment', label: 'Equipment', icon: Wrench, path: '/equipment' },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse, path: '/warehouse' },
  { id: 'expenses', label: 'Expenses', icon: DollarSign, path: '/expenses' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { id: 'users', label: 'Users', icon: Settings, path: '/users' },
];

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const filteredMenu = menuItems.filter((item) => 
    user && canAccessModule(user.role, item.id)
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-indigo-900 text-white transition-all duration-300 z-50 ${
        open ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-800">
        {open && (
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            <span className="font-bold text-lg">CMS</span>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-indigo-800 transition"
        >
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {open && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {open && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-800">
          <div className="text-sm">
            <div className="font-medium truncate">{user.name}</div>
            <div className="text-indigo-300 text-xs truncate">{user.role}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
