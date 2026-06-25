import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Download, 
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  User,
  Settings,
  ArrowRight
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { complianceCalendar2026, ComplianceMonth } from '../../data/compliance_2026';
import EmptyState from '../../components/ui/EmptyState';

const TYPE_COLORS: Record<string, string> = {
  gst: 'bg-gst/10 text-gst border-gst/20',
  tds: 'bg-tds/10 text-tds border-tds/20',
  payroll: 'bg-payroll/10 text-payroll border-payroll/20',
  statutory: 'bg-statutory/10 text-statutory border-statutory/20',
  holiday: 'bg-holiday-bg text-holiday-text border-holiday-text/20',
  working: 'bg-slate-50 text-slate-600 border-slate-100',
  other: 'bg-slate-50 text-slate-600 border-slate-100',
};

const TYPE_LABELS: Record<string, string> = {
  gst: 'GST Compliance',
  tds: 'TDS Filing',
  payroll: 'ESI & PF',
  statutory: 'MCA/Statutory',
  holiday: 'Public Holiday',
  working: 'Working Day',
  other: 'Other',
};

export default function ComplianceCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonthIdx, setCurrentMonthIdx] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<'grid' | 'schedule'>('schedule'); // Default to schedule for better mobile UX
  const monthData = complianceCalendar2026[currentMonthIdx];

  const nextMonth = () => setCurrentMonthIdx((prev) => (prev + 1) % 12);
  const prevMonth = () => setCurrentMonthIdx((prev) => (prev - 1 + 12) % 12);
  const goToToday = () => {
    setCurrentMonthIdx(today.getMonth());
    setViewMode('schedule');
  };

  const getDaysInMonth = (monthIdx: number, year: number = 2026) => new Date(year, monthIdx + 1, 0).getDate();
  const getFirstDayOfMonth = (monthIdx: number, year: number = 2026) => new Date(year, monthIdx, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonthIdx);
  const firstDay = getFirstDayOfMonth(currentMonthIdx);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

  const getDayTask = (day: number) => monthData.days.find(d => d.day === day);
  
  const monthStats = {
    gst: monthData.days.filter(d => d.type === 'gst').length,
    tds: monthData.days.filter(d => d.type === 'tds').length,
    payroll: monthData.days.filter(d => d.type === 'payroll').length,
    statutory: monthData.days.filter(d => d.type === 'statutory').length,
    holidays: monthData.days.filter(d => d.type === 'holiday').length,
  };

  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userCompliance, setUserCompliance] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const [isPersonalized, setIsPersonalized] = useState(searchParams.get('personalized') === 'true');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token) {
      setIsPersonalized(false);
      return;
    }
    setIsLoggedIn(true);
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role === 'admin' || u.role === 'super_admin') {
          setIsAdmin(true);
        }
      } catch (e) {
        // ignore parsing errors
      }
    }

    const fetchData = async () => {
      try {
        const [ordersRes, complianceRes] = await Promise.all([
          fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/compliance', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (ordersRes.ok && complianceRes.ok) {
          const [orders, compliance] = await Promise.all([ordersRes.json(), complianceRes.json()]);
          setUserOrders(orders);
          setUserCompliance(compliance);
          setIsPersonalized(true);
        }
      } catch (err) {
        console.error('Failed to personalize calendar:', err);
      }
    };

    fetchData();
  }, []);

  const isTaskRelevant = (type: string) => {
    if (!isPersonalized || type === 'holiday') return true;
    
    // If personalized but data not loaded yet or user has no orders, show everything for now
    if (userOrders.length === 0) return true;
    
    return userOrders.some(order => {
      const s = order.service?.toLowerCase() || '';
      
      // GST Mapping
      if (type === 'gst' && (s.includes('gst') || s.includes('filing'))) return true;
      
      // TDS & Income Tax Mapping
      if (type === 'tds' && (s.includes('tds') || s.includes('income tax') || s.includes('itr'))) return true;
      
      // Payroll & HR Mapping
      if (type === 'payroll' && (s.includes('esi') || s.includes('pf') || s.includes('payroll') || s.includes('hr'))) return true;
      
      // MCA & Statutory Mapping
      if (type === 'statutory' && (
        s.includes('company') || 
        s.includes('llp') || 
        s.includes('firm') || 
        s.includes('registration') || 
        s.includes('roc') || 
        s.includes('mca')
      )) return true;
      
      return false;
    });
  };

  const getTaskStatus = (day: number, taskTitle: string) => {
    if (!isPersonalized) return null;
    
    // Simple matching by day and title keywords
    const match = userCompliance.find(ut => {
      if (!ut.dueDate) return false;
      const utDate = new Date(ut.dueDate);
      if (isNaN(utDate.getTime())) return false;
      
      return utDate.getDate() === day && 
             utDate.getMonth() === currentMonthIdx && 
             (ut.title.toLowerCase().includes(taskTitle.toLowerCase()) || taskTitle.toLowerCase().includes(ut.type.toLowerCase()));
    });
    
    return match ? match.status : null;
  };
  
  const selectedTask = selectedDay ? getDayTask(selectedDay) : null;
  const filteredMonthDays = monthData.days.filter(d => isTaskRelevant(d.type));
  const daysWithTasks = filteredMonthDays.sort((a, b) => a.day - b.day);

  return (
    <div className="min-h-screen bg-background py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Compliance Calendar 2026 | Deccan Filings</title>
        <meta name="description" content="Stay ahead of your statutory deadlines with our interactive Compliance Calendar 2026. Track GST, TDS, Payroll, and other statutory filings for your business." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-12">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-dark text-[10px] font-black uppercase tracking-wider"
              >
                <CalendarIcon className="h-3 w-3" />
                Statutory Schedule 2026
              </motion.div>
              
              {isLoggedIn && (
                <button
                  onClick={() => setIsPersonalized(!isPersonalized)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                    isPersonalized 
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' 
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isPersonalized ? <CheckCircle2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  {isPersonalized ? 'Personalized View' : 'Sync My Orders'}
                </button>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-dark tracking-tighter leading-[0.9] mb-6">
              Compliance <br className="hidden md:block" />
              <span className="text-secondary">Calendar</span> 2026
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
              Stay ahead of Statutory, GST, and TDS deadlines. Use our free tool to track filings or log in to sync with your orders.
            </p>
          </div>
          
            <div className="flex flex-wrap gap-4 w-full xl:w-auto">
              {isPersonalized && (
                <button 
                  onClick={() => {
                    const userStr = localStorage.getItem('user');
                    let isAdminUser = false;
                    if (userStr) {
                      try {
                        const u = JSON.parse(userStr);
                        if (u.role === 'admin' || u.role === 'super_admin') {
                          isAdminUser = true;
                        }
                      } catch (e) {}
                    }
                    navigate(isAdminUser ? '/admin/compliance' : '/dashboard/compliance');
                  }}
                  className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-dark text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-dark-200 transition-all shadow-premium active:scale-95 cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to Compliance Tracker
                </button>
              )}
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-soft w-full sm:w-auto">
                <button 
                  onClick={() => setViewMode('schedule')}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'schedule' ? 'bg-dark text-white shadow-lg' : 'text-slate-400 hover:text-dark'}`}
                >
                  Schedule
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'grid' ? 'bg-dark text-white shadow-lg' : 'text-slate-400 hover:text-dark'}`}
                >
                  Grid
                </button>
              </div>
              {!isAdmin && (
                <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-dark px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-soft active:scale-95">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              )}
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Summary Sidebar */}
          <div className={`lg:col-span-3 space-y-6 order-2 lg:order-1 ${viewMode === 'schedule' ? 'hidden lg:block' : ''}`}>
            <div className="glass dark:glass-dark p-8 rounded-[32px] shadow-soft">
              <h3 className="font-bold text-dark mb-6 flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-secondary" />
                Month Summary
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <StatItem label="GST Filings" count={monthStats.gst} color="blue" />
                <StatItem label="TDS Payments" count={monthStats.tds} color="purple" />
                <StatItem label="Payroll" count={monthStats.payroll} color="emerald" />
                <StatItem label="Statutory" count={monthStats.statutory} color="amber" />
                <div className="col-span-2 lg:col-span-1">
                  <StatItem label="Holidays" count={monthStats.holidays} color="red" />
                </div>
              </div>
            </div>

            {!isAdmin && (
              <div className="bg-dark text-white p-8 rounded-[32px] shadow-premium relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <h3 className="font-bold text-xl mb-3 relative z-10">Expert Help</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed relative z-10">
                  Let our compliance experts handle your filings while you grow.
                </p>
                <button className="w-full bg-brand text-dark py-3.5 rounded-xl font-black text-sm hover:bg-brand-hover transition-all active:scale-95 relative z-10">
                  Talk to Expert
                </button>
              </div>
            )}
          </div>

          {/* Calendar Main View */}
          <div className="lg:col-span-9 space-y-8 order-1 lg:order-2">
            <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-200 shadow-premium overflow-hidden">
              {/* Calendar Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-8 gap-4 border-b border-slate-100 bg-surface-hover/20">
                <div className="flex items-center gap-2 md:gap-4">
                  <button 
                    onClick={prevMonth}
                    className="p-2 md:p-2.5 hover:bg-slate-200 bg-slate-100 rounded-full transition-all text-slate-500 hover:text-dark active:scale-90"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl md:text-3xl font-black text-dark min-w-[120px] md:min-w-[160px] text-center tracking-tight">
                    {monthData.name}
                  </h2>
                  <button 
                    onClick={nextMonth}
                    className="p-2 md:p-2.5 hover:bg-slate-200 bg-slate-100 rounded-full transition-all text-slate-500 hover:text-dark active:scale-90"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <button 
                  onClick={goToToday}
                  className="w-full sm:w-auto px-6 py-2 md:py-2.5 bg-brand text-dark rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-sm hover:bg-brand-hover transition-all active:scale-95"
                >
                  Today
                </button>
              </div>

              {/* View Rendering */}
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    {/* Grid Header */}
                    <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2 md:py-3 text-center text-[8px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.2em] text-slate-400">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grid Days */}
                    <div className="grid grid-cols-7">
                      {paddingArray.map((i) => (
                        <div key={`padding-${i}`} className="aspect-square border-r border-b border-[var(--ds-border)] bg-surface-hover/10" />
                      ))}
                      {daysArray.map((day) => {
                        const task = getDayTask(day);
                        const isToday = today.getDate() === day && today.getMonth() === currentMonthIdx && today.getFullYear() === 2026;
                        const isSelected = selectedDay === day;
                        const status = task ? getTaskStatus(day, task.task) : null;
                        const isRelevant = task ? isTaskRelevant(task.type) : true;

                        return (
                          <div 
                            key={day} 
                            onClick={() => setSelectedDay(day)}
                            className={`calendar-day group aspect-square min-h-0 md:min-h-[120px] p-1 md:p-3 transition-all duration-300 cursor-pointer border-r border-b border-[var(--ds-border)] ${
                              task?.type === 'holiday' && isRelevant ? 'bg-holiday-bg/10' : ''
                            } ${isToday ? 'bg-brand/5' : ''} ${isSelected ? 'ring-2 ring-brand ring-inset bg-brand/5' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1 md:mb-2">
                              <span className={`text-[10px] md:text-base font-black ${
                                isToday ? 'text-dark w-5 h-5 md:w-8 md:h-8 flex items-center justify-center bg-brand rounded-md md:rounded-lg shadow-sm' :
                                task?.type === 'holiday' && isRelevant ? 'text-holiday-text' : 'text-slate-300 group-hover:text-dark'
                              }`}>
                                {day}
                              </span>
                              {status === 'completed' && isRelevant && (
                                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                              )}
                            </div>
                            
                            {task && isRelevant && (
                              <div className="relative z-10">
                                {/* Desktop Label */}
                                <div className={`hidden md:block text-[10px] font-black px-2 py-2 rounded-xl border leading-tight shadow-soft backdrop-blur-md ${
                                  status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                  status === 'overdue' ? 'border-red-200 bg-red-50 text-red-700' :
                                  TYPE_COLORS[task.type]
                                }`}>
                                  {task.task}
                                </div>
                                {/* Mobile Indicator */}
                                <div className="md:hidden flex justify-center mt-1">
                                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                                    status === 'completed' ? 'bg-emerald-500' :
                                    status === 'overdue' ? 'bg-red-500' :
                                    TYPE_COLORS[task.type].split(' ')[1].replace('text-', 'bg-')
                                  }`}></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Detail Panel */}
                    <AnimatePresence>
                      {selectedDay && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="md:hidden bg-slate-50 border-t border-slate-100 p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-black text-dark uppercase tracking-wider">
                              {monthData.name} {selectedDay}, 2026
                            </h4>
                            <button onClick={() => setSelectedDay(null)} className="text-[10px] font-bold text-slate-400">Close</button>
                          </div>
                          {selectedTask ? (
                            <div className={`p-4 rounded-2xl border ${TYPE_COLORS[selectedTask.type]} shadow-sm`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-black uppercase tracking-widest">{selectedTask.task}</span>
                                <span className="text-[10px] font-bold opacity-60">{TYPE_LABELS[selectedTask.type]}</span>
                              </div>
                              <p className="text-[10px] font-medium opacity-80">Statutory deadline for filing.</p>
                            </div>
                          ) : (
                            <p className="text-[10px] font-bold text-slate-400 italic">No major deadlines for this day.</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="schedule"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 md:p-8 space-y-4"
                  >
                    {daysWithTasks.length > 0 ? (
                      <div className="max-h-[420px] overflow-y-auto pr-2 space-y-4">
                        {daysWithTasks.map((task, idx) => {
                          const isToday = today.getDate() === task.day && today.getMonth() === currentMonthIdx && today.getFullYear() === 2026;
                          const date = new Date(2026, currentMonthIdx, task.day);
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                          const status = getTaskStatus(task.day, task.task);
                          
                          return (
                            <motion.div 
                              key={`${task.day}-${idx}`}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-3xl border transition-all ${
                                status === 'completed' ? 'bg-emerald-50/50 border-emerald-100 opacity-80' :
                                isToday ? 'bg-brand/10 border-brand shadow-sm scale-[1.02]' : 
                                'bg-white border-slate-100 hover:border-slate-200 shadow-soft'
                              }`}
                            >
                              <div className="flex flex-col items-center min-w-[40px] md:min-w-[50px]">
                                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{dayName}</span>
                                <span className={`text-xl md:text-2xl font-black ${isToday ? 'text-dark' : 'text-slate-600'}`}>{task.day}</span>
                              </div>
                              
                              <div className="h-10 w-px bg-slate-100"></div>
                              
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                  <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-xl border text-[9px] md:text-[10px] font-black uppercase tracking-wider ${
                                    status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                    status === 'overdue' ? 'border-red-200 bg-red-50 text-red-700' :
                                    TYPE_COLORS[task.type]
                                  }`}>
                                    {task.task}
                                  </span>
                                  <span className="text-[10px] md:text-xs font-bold text-slate-400">
                                    {TYPE_LABELS[task.type]}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {task.type !== 'holiday' && status !== 'completed' && (
                                  <a 
                                    href="tel:+919000243270"
                                    className="bg-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-dark-200 transition-colors inline-block text-center cursor-pointer mr-2"
                                  >
                                    Take Action
                                  </a>
                                )}
                                {status === 'completed' ? (
                                  <div className="flex items-center gap-1 text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Done</span>
                                  </div>
                                ) : status === 'overdue' ? (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Overdue</span>
                                  </div>
                                ) : isToday ? (
                                  <div className="px-3 py-1 rounded-full bg-brand text-[9px] font-black uppercase tracking-widest text-dark">
                                    Today
                                  </div>
                                ) : null}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState
                        icon={CalendarIcon}
                        title="No deadlines this month"
                        description="There are no major statutory deadlines scheduled for this month. Enjoy your productivity!"
                        className="my-8"
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Legend & Help */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4 px-2">
              <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center md:justify-start">
                {Object.entries(TYPE_LABELS).map(([type, label]) => (
                  <div key={type} className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-wider">
                    <div className={`w-3 h-3 rounded-full shadow-sm ${TYPE_COLORS[type].split(' ')[0]}`} />
                    {label}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Clock className="h-4 w-4" />
                Updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, count, color }: { label: string; count: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-gst/10 text-gst',
    purple: 'bg-tds/10 text-tds',
    emerald: 'bg-payroll/10 text-payroll',
    amber: 'bg-statutory/10 text-statutory',
    red: 'bg-holiday-bg text-holiday-text',
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-slate-100 hover:border-slate-200 transition-all shadow-sm">
      <span className="text-sm font-bold text-dark">{label}</span>
      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${colorMap[color]}`}>
        {count}
      </span>
    </div>
  );
}
