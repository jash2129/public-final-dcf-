import { ShoppingCart, CalendarCheck, Users, Banknote, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import Skeleton from '../../components/ui/Skeleton';
import SuccessOverlay from '../../components/ui/SuccessOverlay';

const data7Days = [
  { name: 'Mon', revenue: 45000 },
  { name: 'Tue', revenue: 52000 },
  { name: 'Wed', revenue: 48000 },
  { name: 'Thu', revenue: 61000 },
  { name: 'Fri', revenue: 55000 },
  { name: 'Sat', revenue: 67000 },
  { name: 'Sun', revenue: 72000 },
];

const data30Days = [
  { name: 'Week 1', revenue: 210000 },
  { name: 'Week 2', revenue: 245000 },
  { name: 'Week 3', revenue: 198000 },
  { name: 'Week 4', revenue: 285000 },
];


export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingCompliance: 0,
    totalRevenue: '₹0',
    activeUsers: 0
  });
  const [chartRange, setChartRange] = useState('7d');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [ordersRes, compRes] = await Promise.all([
          fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/compliance', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (ordersRes.ok && compRes.ok) {
          const orders = await ordersRes.json();
          const compliance = await compRes.json();
          
          setStats({
            totalOrders: orders.length,
            pendingCompliance: compliance.filter((c: any) => c.status !== 'completed').length,
            totalRevenue: '₹' + orders.reduce((acc: number, o: any) => {
              const val = parseInt(o.amount.replace(/[^0-9]/g, '')) || 0;
              return acc + val;
            }, 0).toLocaleString(),
            activeUsers: new Set(orders.map((o: any) => o.user_id)).size
          });
        }
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingReport(false);
    
    // Create simple report CSV content
    const reportDate = new Date().toLocaleDateString();
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Report Date', reportDate],
      ['Total Orders', stats.totalOrders.toString()],
      ['Pending Compliance', stats.pendingCompliance.toString()],
      ['Total Revenue', stats.totalRevenue],
      ['Active Businesses', stats.activeUsers.toString()]
    ];
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `weekly_admin_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setShowSuccess(true);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark p-4 rounded-2xl shadow-premium border border-white/10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-brand text-lg font-black">{`₹${(payload[0].value/1000).toFixed(1)}k`}</p>
        </div>
      );
    }
    return null;
  };


  const kpis = [
    { name: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, change: '+12.5%', trend: 'up' },
    { name: 'Pending Compliance', value: stats.pendingCompliance.toString(), icon: CalendarCheck, change: '-3', trend: 'down' },
    { name: 'Total Revenue', value: stats.totalRevenue, icon: Banknote, change: '+18.2%', trend: 'up' },
    { name: 'Active Businesses', value: stats.activeUsers.toString(), icon: Users, change: '+4', trend: 'up' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark">Administrative Overview</h1>
        <p className="text-slate-500">Global insights across all Deccan Filings users.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-md transition-shadow"
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-10" variant="circle" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-dark">
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    kpi.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
                  }`}>
                    {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">{kpi.name}</p>
                <p className="text-2xl font-black text-dark">{kpi.value}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-dark">Revenue Growth</h3>
              <p className="text-sm text-slate-500">Platform-wide revenue tracking</p>
            </div>
            <select 
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRange === '7d' ? data7Days : data30Days}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBC05" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FBBC05" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FBBC05" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-dark p-8 rounded-3xl text-white shadow-xl shadow-brand/10 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Admin Notice</h3>
            <p className="text-slate-400 text-sm mb-6">Important tasks require your attention this week.</p>
            
            <div className="space-y-4">
              {[
                'Approving 12 new incorporation requests',
                'Verify GST filings for Q3 batch',
                'System maintenance scheduled for Sunday'
              ].map((task, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="h-2 w-2 rounded-full bg-brand mt-1.5"></div>
                  <p className="text-sm font-medium">{task}</p>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="w-full mt-8 bg-brand text-dark font-bold py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              {isGeneratingReport ? 'Processing...' : 'Generate Weekly Report'}
            </button>
          </div>
          <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-brand/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <SuccessOverlay 
        isVisible={showSuccess} 
        message="Weekly performance report has been generated and downloaded successfully." 
        onComplete={() => setShowSuccess(false)} 
      />
    </div>
  );
}
