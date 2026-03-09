// components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Home,
  Filter,
  LogOut,
  User,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Users,
  Settings
} from 'lucide-react';

const Sidebar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: Home,
      activeColor: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      path: '/smart-filter',
      name: 'Smart Filter',
      icon: Filter,
      activeColor: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      path: '/departments',
      name: 'Departments',
      icon: BookOpen,
      activeColor: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      path: '/students',
      name: 'Students',
      icon: Users,
      activeColor: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: Settings,
      activeColor: 'from-slate-500 to-slate-600',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600'
    }
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg hover:bg-slate-50 transition-colors border border-slate-200"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-dark-600" />
        ) : (
          <Menu className="w-5 h-5 text-dark-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 shadow-xl transition-all duration-300 z-50
          ${isOpen ? 'w-64' : 'w-20'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:translate-x-0
          flex flex-col
          overflow-hidden
        `}
        style={{ height: '100vh' }}
      >
        {/* Desktop Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-20 w-7 h-7 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg transition-all items-center justify-center z-10 hover:border-blue-400 group"
        >
          <ChevronRight className={`w-4 h-4 text-dark-600 transition-all duration-300 group-hover:text-blue-600 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Logo Section */}
          <div className={`p-5 border-b border-slate-200 ${!isOpen && 'lg:px-3'}`}>
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              {isOpen && (
                <div className="overflow-hidden transition-all duration-300">
                  <h1 className="font-display font-bold text-xl text-dark-900 whitespace-nowrap">
                    BIT Department
                  </h1>
                  <p className="text-xs text-dark-500 -mt-0.5 whitespace-nowrap">
                    Management System
                  </p>
                </div>
              )}
            </Link>
          </div>

          {/* Admin Profile */}
          {admin && (
            <div className={`p-4 border-b border-slate-200 ${!isOpen && 'lg:px-3'}`}>
              <div className={`flex ${isOpen ? 'items-start space-x-3' : 'flex-col items-center'} bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl`}>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-full flex-shrink-0 shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                {isOpen && (
                  <div className="overflow-hidden transition-all duration-300">
                    <p className="text-sm font-semibold text-dark-900 truncate">{admin.name || 'Administrator'}</p>
                    <p className="text-xs text-dark-500 truncate">{admin.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation - No scrollbar, all items visible */}
        <nav className="flex-1 py-4 overflow-visible">
          <ul className="space-y-1.5 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-xl transition-all duration-300 group relative
                      ${active 
                        ? `bg-gradient-to-r ${item.activeColor} text-white shadow-md` 
                        : 'text-dark-600 hover:bg-slate-100'
                      }
                    `}
                    title={!isOpen ? item.name : ''}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : item.textColor} transition-transform group-hover:scale-110 flex-shrink-0`} />
                    {isOpen && (
                      <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                    )}
                    
                    {/* Tooltip for collapsed mode */}
                    {!isOpen && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-dark-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                        {item.name}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Fixed Footer - Logout Button */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 group relative`}
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
            {isOpen && <span className="font-medium text-sm">Logout</span>}
            
            {/* Tooltip for collapsed mode */}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-dark-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;