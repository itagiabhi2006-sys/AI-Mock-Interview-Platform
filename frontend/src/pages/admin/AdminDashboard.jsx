import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, HelpCircle, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Questions', path: '/admin/questions', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex w-full absolute inset-0 z-50">
      {/* Sidebar */}
      <div className={`bg-indigo-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} shadow-2xl z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-800">
          {isSidebarOpen && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white truncate">Admin Panel</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-indigo-800 rounded-lg transition-colors ml-auto">
            <ChevronLeft className={`w-5 h-5 transition-transform ${!isSidebarOpen && 'rotate-180'}`} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-3 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`
              }
              title={item.name}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-indigo-800">
          <button 
            onClick={handleLogout} 
            className="flex items-center px-4 py-3 w-full text-indigo-200 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`ml-3 font-medium transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50 relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="p-8 relative z-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
