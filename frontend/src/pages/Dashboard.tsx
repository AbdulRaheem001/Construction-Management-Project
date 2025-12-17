import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency } from '../utils/formatters';
import {
  Building2,
  Users,
  Package,
  DollarSign,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import type { DashboardStats, Project } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsData = await fetchStats();
      setStats(statsData);
      
      // Fetch recent active projects
      try {
        const projectsRes = await api.get('/projects?status=Active');
        if (projectsRes.data.data && Array.isArray(projectsRes.data.data)) {
          setRecentProjects(projectsRes.data.data.slice(0, 5));
        }
      } catch (error) {
        console.log('Could not fetch projects:', error);
        setRecentProjects([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (): Promise<DashboardStats> => {
    let totalProjects = 0;
    let activeProjects = 0;
    let lowStockMaterials = 0;

    // Fetch projects safely
    try {
      const projectsRes = await api.get('/projects');
      if (projectsRes.data.data && Array.isArray(projectsRes.data.data)) {
        totalProjects = projectsRes.data.data.length;
        activeProjects = projectsRes.data.data.filter((p: Project) => p.status === 'Active').length;
      }
    } catch (error) {
      console.log('Could not fetch projects stats:', error);
    }

    // Note: Materials endpoint might not be available yet
    // Uncomment when backend endpoint is ready
    // try {
    //   const materialsRes = await api.get('/materials');
    //   if (materialsRes.data.data && Array.isArray(materialsRes.data.data)) {
    //     lowStockMaterials = materialsRes.data.data.filter(
    //       (m: any) => m.currentStock !== undefined && m.currentStock < m.reorderPoint
    //     ).length;
    //   }
    // } catch (error) {
    //   console.log('Could not fetch materials stats:', error);
    // }

    return {
      totalProjects,
      activeProjects,
      totalEmployees: 0,
      lowStockMaterials,
      pendingPOs: 0,
      pendingTimesheets: 0,
      totalExpenses: 0,
      monthlyExpenses: 0,
    };
  };

  const statCards = stats ? [
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: Building2,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      label: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      label: 'Low Stock Items',
      value: stats.lowStockMaterials,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '',
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(stats.monthlyExpenses),
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '-8%',
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome to your construction management overview</p>
      </div>

      {/* Stats Grid - Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {typeof stat.value === 'number' ? stat.value : stat.value}
                    {stat.total && <span className="text-xs sm:text-sm text-gray-500">/{stat.total}</span>}
                  </p>
                  {stat.change && (
                    <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  )}
                </div>
                <div className={`${stat.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Projects - Stack on mobile */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Active Projects</h2>
          
          {recentProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No active projects</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentProjects.map((project) => (
                <div key={project._id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{project.projectName}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{project.projectCode}</p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      {formatCurrency(project.initialBudget)}
                    </p>
                    <span className={`inline-block px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full ${
                      project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <QuickAction icon={Building2} label="New Project" to="/projects" />
            <QuickAction icon={Package} label="Materials" to="/materials" />
            <QuickAction icon={Users} label="Labour" to="/labour" />
            <QuickAction icon={Wrench} label="Equipment" to="/equipment" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  to: string;
}

function QuickAction({ icon: Icon, label, to }: QuickActionProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg hover:shadow-md transition border border-indigo-100 cursor-pointer"
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 mb-1 sm:mb-2" />
      <span className="text-xs sm:text-sm font-medium text-gray-900">{label}</span>
    </button>
  );
}
