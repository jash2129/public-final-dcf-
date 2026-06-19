import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CalendarCheck, 
  FileText, 
  Receipt, 
  Check, 
  Settings as SettingsIcon, 
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotificationType = 'deadline' | 'compliance' | 'order' | 'system';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function NotificationsDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'compliance'>('all');
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    marketing: false,
    complianceOnly: false
  });

  // Toasts state
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'deadline',
      title: 'GST Return Filing',
      message: 'GSTR-3B filing is due in 3 days. Please ensure all invoices are uploaded.',
      time: '2 hours ago',
      read: false,
      icon: CalendarCheck,
      action: {
        label: 'Upload Invoices',
        onClick: () => navigate('/dashboard/documents')
      }
    },
    {
      id: 2,
      type: 'compliance',
      title: 'Annual KYC Update',
      message: 'Director KYC needs to be updated before the end of the month to avoid penalties.',
      time: '1 day ago',
      read: false,
      icon: FileText,
      action: {
        label: 'Update KYC',
        onClick: () => navigate('/dashboard/compliance')
      }
    },
    {
      id: 3,
      type: 'order',
      title: 'Company Registration',
      message: 'Your Certificate of Incorporation is ready to download from the Documents section.',
      time: '2 days ago',
      read: true,
      icon: Receipt,
      action: {
        label: 'View Certificate',
        onClick: () => navigate('/dashboard/documents')
      }
    }
  ]);

  // Simulate a live toast popup
  useEffect(() => {
    const timer = setTimeout(() => {
      const newToast = { id: Date.now(), message: 'New compliance alert: Trademark renewal due soon.' };
      setToasts(prev => [...prev, newToast]);
      
      setNotifications(prev => [{
        id: Date.now(),
        type: 'compliance',
        title: 'Trademark Renewal',
        message: 'Your trademark registration expires in 30 days.',
        time: 'Just now',
        read: false,
        icon: AlertCircle,
        action: {
          label: 'Renew Now',
          onClick: () => navigate('/services#trademark')
        }
      }, ...prev]);

      // Auto dismiss toast
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    }, 5000); // Trigger after 5 seconds for demonstration

    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'compliance') return n.type === 'compliance' || n.type === 'deadline';
    return true;
  });

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] transition-colors rounded-full hover:bg-[var(--ds-bg)]"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-brand rounded-full border-2 border-white"></span>
          )}
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-[340px] sm:w-[400px] bg-white rounded-2xl shadow-premium border border-[var(--ds-border)] overflow-hidden z-50 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-[var(--ds-border)] flex items-center justify-between bg-[var(--ds-bg)]/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[var(--ds-text)]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!showSettings && unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-brand hover:text-brand/80 transition-colors flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1.5 text-[var(--ds-text-muted)] hover:bg-white rounded-lg transition-colors ml-2"
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {showSettings ? (
                // Settings View
                <div className="p-4 flex-1 overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="p-1.5 bg-[var(--ds-bg)] hover:bg-[var(--ds-border)] rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <h4 className="font-bold text-[var(--ds-text)]">Notification Preferences</h4>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important updates via email' },
                      { id: 'pushNotifications', label: 'Push Notifications', desc: 'Real-time alerts in the browser' },
                      { id: 'complianceOnly', label: 'Only Compliance Alerts', desc: 'Mute non-essential notifications' },
                      { id: 'marketing', label: 'Marketing & Offers', desc: 'Updates about new services' },
                    ].map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[var(--ds-text)]">{setting.label}</p>
                          <p className="text-xs text-[var(--ds-text-muted)]">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settings[setting.id as keyof typeof settings]}
                            onChange={() => setSettings(s => ({ ...s, [setting.id]: !s[setting.id as keyof typeof settings] }))}
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Main Notifications View
                <>
                  {/* Tabs */}
                  <div className="flex border-b border-[var(--ds-border)] px-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'unread', label: 'Unread' },
                      { id: 'compliance', label: 'Compliance' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                          activeTab === tab.id 
                            ? 'border-brand text-brand' 
                            : 'border-transparent text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto custom-scrollbar flex-1 min-h-[300px]">
                    {filteredNotifications.length === 0 ? (
                      // Empty State
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="h-16 w-16 bg-[var(--ds-bg)] rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="h-8 w-8 text-[var(--ds-text-muted)] opacity-50" />
                        </div>
                        <h4 className="text-sm font-bold text-[var(--ds-text)] mb-1">You're all caught up!</h4>
                        <p className="text-xs text-[var(--ds-text-muted)]">
                          {activeTab === 'unread' 
                            ? "No new notifications right now." 
                            : "There are no notifications in this category."}
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          onClick={() => handleMarkRead(notification.id)}
                          className={`p-4 border-b border-[var(--ds-bg)] hover:bg-[var(--ds-bg)]/50 transition-colors flex gap-3 ${!notification.read ? 'bg-brand/5' : ''}`}
                        >
                          <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                            notification.type === 'deadline' ? 'bg-amber-100 text-amber-600' : 
                            notification.type === 'compliance' ? 'bg-blue-100 text-blue-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            <notification.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`text-sm font-bold ${!notification.read ? 'text-[var(--ds-text)]' : 'text-slate-700'}`}>
                                {notification.title}
                              </p>
                              <span className="text-[10px] font-medium text-[var(--ds-text-muted)] ml-2 whitespace-nowrap">
                                {notification.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">
                              {notification.message}
                            </p>
                            
                            {/* Action Button */}
                            {notification.action && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.action?.onClick();
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand/80 transition-colors bg-white border border-[var(--ds-border)] px-3 py-1.5 rounded-lg shadow-sm"
                              >
                                {notification.action.label} <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0 flex items-center justify-center">
                              <div className="h-2 w-2 bg-brand rounded-full"></div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {filteredNotifications.length > 0 && (
                    <div className="p-3 bg-[var(--ds-bg)]/50 border-t border-[var(--ds-border)] text-center mt-auto">
                      <button className="text-xs font-bold text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] transition-colors">
                        View All History
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Toasts rendering */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="bg-dark text-white px-4 py-3 rounded-xl shadow-premium text-sm font-medium flex items-center gap-3 w-[300px]"
            >
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <p className="flex-1">{toast.message}</p>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
