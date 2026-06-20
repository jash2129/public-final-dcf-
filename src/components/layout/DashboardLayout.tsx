import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  CalendarCheck, 
  Receipt, 
  User, 
  LifeBuoy,
  Bell,
  Search,
  Building2,
  LogOut,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  Wrench,
  Calculator,
  Tag,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardLayout() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; role?: string }>({ 
    name: 'Business Owner', 
    email: 'user@example.com',
    role: 'user'
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Documents', path: '/dashboard/documents', icon: FileText },
    { name: 'Compliance', path: '/dashboard/compliance', icon: CalendarCheck },
    { name: 'Invoices', path: '/dashboard/invoices', icon: Receipt },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const adminNavItems = [
    { name: 'Global Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'All Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'All Documents', path: '/admin/documents', icon: FileText },
    { name: 'All Compliance', path: '/admin/compliance', icon: CalendarCheck },
    { name: 'Service Catalog', path: '/admin/services', icon: Tag },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const toolItems = [
    { name: 'GST Calculator', path: '/dashboard/tools/gst-calculator', icon: Calculator },
    { name: 'Compliance Calendar', path: '/tools/compliance-calendar', icon: CalendarCheck },
  ];

  if (user.role === 'super_admin') {
    adminNavItems.push({ name: 'Manage Admins', path: '/admin/users', icon: User });
    adminNavItems.push({ name: 'Activity Log', path: '/admin/activity', icon: FileText });
  }

  const getPageTitle = () => {
    const allItems = [...navItems, ...adminNavItems, ...toolItems];
    const item = allItems.find(i => i.path === location.pathname);
    return item ? item.name : 'Dashboard';
  };

  return (
    <div className="min-h-screen flex font-sans text-dark selection:bg-brand/30 selection:text-dark mesh-gradient-light">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 transition-transform duration-300 transform 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'} 
        bg-white border-r border-[var(--ds-border)] flex flex-col shadow-premium
      `}>
        <div className={`h-20 flex items-center ${isSidebarCollapsed ? 'justify-center px-4' : 'px-6 justify-between'} border-b border-[var(--ds-border)] bg-transparent`}>
          <Link to="/" onClick={closeMobileMenu} className={`flex items-center group ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            {isSidebarCollapsed && !isMobileMenuOpen ? (
              <img 
                src="/logo-icon.png" 
                alt="DF" 
                className="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300" 
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="Deccan Filings" 
                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
              />
            )}
          </Link>
          <div className="flex items-center gap-2">
            {!isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(true)} 
                className="p-1.5 text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-bg)] rounded-lg transition-colors hidden md:block"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={closeMobileMenu} 
              className="p-1.5 text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-bg)] rounded-lg transition-colors md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
        {(!user.role || user.role === 'user') && (
          <div className={`py-4 ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
            {!isSidebarCollapsed && <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-wider mb-3 px-2">Main Menu</p>}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={closeMobileMenu}
                    title={isSidebarCollapsed ? item.name : ''}
                    className={`flex items-center relative ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-[var(--ds-coral-soft)] text-[var(--ds-text)] shadow-sm border border-[var(--ds-border)]' 
                        : 'text-[var(--ds-text-muted)] hover:bg-[var(--ds-bg)] hover:text-[var(--ds-text)]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-brand rounded-r glowing-accent" />
                    )}
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-brand' : 'text-[var(--ds-text-muted)]'}`} />
                    {(!isSidebarCollapsed || isMobileMenuOpen) && item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {(user.role === 'admin' || user.role === 'super_admin') && (
          <div className={`py-4 border-t border-[var(--ds-border)] ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
            {!isSidebarCollapsed && <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-wider mb-3 px-2">Admin Portal</p>}
            <nav className="space-y-1.5">
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    title={isSidebarCollapsed ? item.name : ''}
                    className={`flex items-center relative ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-[var(--ds-coral-soft)] text-[var(--ds-text)] shadow-sm border border-[var(--ds-border)]' 
                        : 'text-[var(--ds-text-muted)] hover:bg-[var(--ds-bg)] hover:text-[var(--ds-text)]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-brand rounded-r glowing-accent" />
                    )}
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-brand' : 'text-[var(--ds-text-muted)]'}`} />
                    {!isSidebarCollapsed && item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Tools Section (Shared) */}
        <div className={`py-4 border-t border-[var(--ds-border)] ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
          {!isSidebarCollapsed && <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-wider mb-3 px-2">Business Tools</p>}
          <nav className="space-y-1.5 font-sans">
            {toolItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={isSidebarCollapsed ? item.name : ''}
                  className={`flex items-center relative ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-[var(--ds-coral-soft)] text-[var(--ds-text)] shadow-sm border border-[var(--ds-border)]' 
                      : 'text-[var(--ds-text-muted)] hover:bg-[var(--ds-bg)] hover:text-[var(--ds-text)]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-brand rounded-r glowing-accent" />
                  )}
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-brand' : 'text-[var(--ds-text-muted)]'}`} />
                  {!isSidebarCollapsed && item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        </div>

        <div className={`mt-auto border-t border-[var(--ds-border)] bg-transparent ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <div className="bg-white border border-[var(--ds-border)] rounded-2xl overflow-hidden flex flex-col shadow-sm">
            {!isSidebarCollapsed && (
              <div className="p-4 border-b border-[var(--ds-border)] bg-[var(--ds-bg)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-brand/10 p-2 rounded-xl">
                    <LifeBuoy className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--ds-text)]">Need Help?</p>
                    <p className="text-xs text-[var(--ds-text-muted)]">24/7 Expert Support</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/contact')}
                  className="w-full bg-white border border-[var(--ds-border)] text-[var(--ds-text)] text-xs font-bold py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
                >
                  Contact Support
                </button>
              </div>
            )}

            {/* Profile & Sign Out Section */}
            <div className="p-2 flex flex-col gap-1 bg-white">
              {/* User Profile display card */}
              <div 
                title={isSidebarCollapsed ? `${user.name} (${user.email})` : ""}
                className={`flex items-center rounded-xl transition-colors ${isSidebarCollapsed ? 'justify-center py-2' : 'px-2 py-2 gap-3 hover:bg-[var(--ds-bg)]'}`}
              >
                <div className="h-10 w-10 bg-[var(--ds-bg)] text-[var(--ds-text)] border border-[var(--ds-border)] rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                  {getUserInitials(user.name)}
                </div>
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--ds-text)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--ds-text-muted)] truncate">{user.email}</p>
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                title={isSidebarCollapsed ? "Sign Out" : ""}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'} rounded-xl text-sm font-bold text-[var(--ds-text-muted)] hover:bg-red-50 hover:text-red-500 transition-all group/logout cursor-pointer`}
              >
                <LogOut className="h-4 w-4 text-[var(--ds-text-muted)] group-hover/logout:text-red-500 transition-colors" />
                {(!isSidebarCollapsed || isMobileMenuOpen) && <span>Sign Out</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Header */}
        <header className="bg-white/60 backdrop-blur-2xl border-b border-slate-200/50 h-20 flex items-center justify-between px-8 sticky top-0 z-10 transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3 text-sm">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 mr-2 text-slate-400 hover:text-dark hover:bg-slate-100 rounded-lg transition-colors md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 mr-2 text-slate-400 hover:text-dark hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <span className="text-slate-400 font-medium hidden sm:inline">
              {location.pathname.startsWith('/admin') ? 'Admin Portal' : 'Dashboard'}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="font-bold text-dark">{getPageTitle()}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search orders, documents..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all w-72"
              />
            </div>
            
            <button
              onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
              className="p-2 text-slate-400 hover:text-dark hover:bg-slate-100 rounded-xl transition-all duration-300 relative group flex items-center justify-center cursor-pointer"
              title={`Switch to ${resolvedTheme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {resolvedTheme === 'light' ? (
                <Moon className="h-5 w-5 transition-transform group-hover:rotate-12" />
              ) : (
                <Sun className="h-5 w-5 transition-transform group-hover:rotate-45" />
              )}
            </button>

            <NotificationsDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Dynamic Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200 px-4 pb-safe shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {(user.role === 'admin' || user.role === 'super_admin' ? adminNavItems : navItems).slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${
                  isActive ? 'text-dark' : 'text-slate-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-brand shadow-sm scale-110' : ''}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name.includes('Overview') ? 'Home' : item.name.split(' ').pop()}</span>
              </Link>
            );
          })}
          <Link
            to="/dashboard/settings"
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${
              location.pathname === '/dashboard/settings' ? 'text-dark' : 'text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${location.pathname === '/dashboard/settings' ? 'bg-brand shadow-sm scale-110' : ''}`}>
              <User className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
