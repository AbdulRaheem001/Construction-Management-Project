import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header sidebarOpen={sidebarOpen} />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
