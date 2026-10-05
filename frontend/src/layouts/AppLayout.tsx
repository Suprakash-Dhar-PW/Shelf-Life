import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [  
    { label: 'Books', path: '/books', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Members', path: '/members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Issue Book', path: '/issue', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col shadow-xl z-10 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-[#1e293b]">
          <svg className="w-8 h-8 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h1 className="text-xl font-bold tracking-tight">ShelfLife</h1>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <svg className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>ShelfLife</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Logout
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
