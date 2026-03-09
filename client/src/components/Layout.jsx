// components/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar onToggle={handleSidebarToggle} />
      
      {/* Main Content Area */}
      <main 
        className={`
          h-full overflow-y-auto transition-all duration-300
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
          ml-0
        `}
      >
        {/* Content Container */}
        <div className="min-h-full p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;