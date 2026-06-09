import { FileText, Clock, CheckCircle, AlertCircle, ArrowRight, ChevronRight, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';

import { useState, useEffect } from 'react';

export default function Overview() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Business Owner');
  const [activityData, setActivityData] = useState([]);
  const [summary, setSummary] = useState({
    activeOrders: 0,
    completed: 0,
    actionRequired: 0,
    totalDocuments: 24
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [complianceTasks, setComplianceTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name);
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }

    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [activityRes, summaryRes, ordersRes, compRes] = await Promise.all([
          fetch('/api/stats/activity', { headers }),
          fetch('/api/stats/summary', { headers }),
          fetch('/api/orders', { headers }),
          fetch('/api/compliance', { headers })
        ]);

        const [activity, summaryData, allOrders, compTasks] = await Promise.all([
          activityRes.json(),
          summaryRes.json(),
          ordersRes.json(),
          compRes.json()
        ]);

        setActivityData(activity);
        setSummary(summaryData);
        setRecentOrders(allOrders.slice(0, 3));
        setComplianceTasks(compTasks);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-slate-500 text-[10px] sm:text-sm mt-1 uppercase font-bold tracking-widest">Compliance Overview</p>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/orders', { state: { openNewOrderModal: true } })}
          className="bg-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-dark-200 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span>New Request</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* KPI Cards */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { title: 'Active Orders', value: summary.activeOrders.toString(), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+2 this week' },
          { title: 'Completed', value: summary.completed.toString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+4 this month' },
          { title: 'Action Required', value: summary.actionRequired.toString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Needs attention' },
          { title: 'Total Documents', value: summary.totalDocuments.toString(), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Secure vault' },
        ].map((stat) => (
          <motion.div 
            key={stat.title} 
            variants={itemAnim}
            className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-soft hover:shadow-md transition-shadow"
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-8" variant="circle" />
                <Skeleton className="h-6 w-12" />
              </div>
            ) : (
              <div className="flex items-center sm:block gap-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bg} ${stat.color} flex-shrink-0`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xl sm:text-3xl font-black text-dark sm:mb-1">{stat.value}</p>
                  <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-tighter sm:tracking-normal">{stat.title}</p>
                </div>
                <div className="mt-0 sm:mt-4 sm:pt-4 sm:border-t border-slate-100 hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {stat.trend}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart & Recent Orders */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-soft p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-black text-xl text-dark">Activity Overview</h2>
                <p className="text-sm text-slate-500">Service requests over the last 7 months</p>
              </div>
              <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-dark rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-[180px] sm:h-[250px] w-full">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FBBC05" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FBBC05" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      itemStyle={{ color: '#000', fontWeight: '900' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-dark">Recent Orders</h2>
              <Link to="/dashboard/orders" className="text-sm font-bold text-dark hover:text-secondary transition-colors">View All</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No recent orders.</div>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer active:bg-slate-100">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand group-hover:text-dark transition-colors shrink-0">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-dark text-sm sm:text-base truncate leading-tight">{order.service}</p>
                        <p className="text-[10px] sm:text-sm text-slate-500 mt-0.5 truncate">{order.id} • {order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Action Required' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status.split(' ')[0]}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 sm:block hidden" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Upcoming Compliance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg text-dark">Upcoming Compliance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {complianceTasks.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1.5 z-10 ${item.status === 'overdue' ? 'bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : 'bg-brand shadow-[0_0_0_4px_rgba(229,255,143,0.2)]'}`}></div>
                      {i !== 2 && <div className="w-0.5 h-full bg-slate-100 absolute top-3 left-1.5"></div>}
                    </div>
                    <div className="pb-2">
                      <p className="font-bold text-dark">{item.title}</p>
                      <p className={`text-sm mt-0.5 ${item.status === 'overdue' ? 'text-red-500 font-medium' : 'text-slate-500'}`}>Due: {item.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/dashboard/compliance" className="block w-full mt-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-dark hover:bg-slate-50 transition-colors text-center">
                View Calendar
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-dark text-white rounded-2xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand rounded-full blur-[80px] opacity-20"></div>
            <div className="p-6 relative z-10">
              <h2 className="font-bold text-lg mb-2">Need a new service?</h2>
              <p className="text-slate-400 text-sm mb-6">Explore our catalog of 100+ business services.</p>
              
              <div className="space-y-3">
                <Link to="/services/startup" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                  <span className="font-medium text-sm">Company Registration</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link to="/services/trademark" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                  <span className="font-medium text-sm">Trademark Filing</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link to="/services/gst" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                  <span className="font-medium text-sm">GST Registration</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
