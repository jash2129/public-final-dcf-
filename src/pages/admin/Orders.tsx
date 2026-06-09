import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  RefreshCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  User,
  X,
  Trash2,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';
import SuccessOverlay from '../../components/ui/SuccessOverlay';
import DateRangeFilter from '../../components/orders/DateRangeFilter';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showSuccess, setShowSuccess] = useState(false);

  // Row Action State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [isSavingAmount, setIsSavingAmount] = useState(false);

  const [dateRange, setDateRange] = useState<{start: string | null, end: string | null}>({start: null, end: null});

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/admin/orders';
      if (dateRange.start && dateRange.end) {
        const params = new URLSearchParams({
          startDate: dateRange.start,
          endDate: dateRange.end
        });
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
    }
  };

  const handleSaveAmount = async () => {
    if (!selectedOrder) return;
    setIsSavingAmount(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: parseFloat(editAmount) })
      });
      
      if (response.ok) {
        setSuccessMessage('Order price updated successfully.');
        setShowSuccess(true);
        setIsDetailModalOpen(false);
        fetchOrders();
      } else {
        alert('Failed to update order price');
      }
    } catch (err) {
      console.error('Update price error:', err);
    } finally {
      setIsSavingAmount(false);
    }
  };

  const handleExportAll = () => {
    if (orders.length === 0) return alert('No orders to export.');

    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Service', 'Date', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...orders.map(o => [
        o.id,
        `"${o.user_name}"`,
        o.user_email,
        `"${o.service}"`,
        o.date,
        o.amount.replace('₹', ''),
        o.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `all_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowSuccess(true);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setActiveMenuId(null);
    setSuccessMessage(`Order ID ${id} copied to clipboard!`);
    setShowSuccess(true);
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setSuccessMessage('Order deleted successfully.');
        setShowSuccess(true);
        fetchOrders();
      } else {
        alert('Failed to delete order');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActiveMenuId(null);
    }
  };


  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Action Required': return 'bg-brand-lightest text-dark border-brand/20';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Global Orders Management</h1>
          <p className="text-slate-500">View and update orders for all Deccan Filings clients.</p>
        </div>
        <button 
          onClick={handleExportAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="h-4 w-4" />
          Export All Data
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Service, or Customer Name..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Processing', 'Action Required', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${
                statusFilter === status 
                  ? 'bg-dark text-white border-dark' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-dark'
              }`}
            >
              {status}
            </button>
          ))}

          <DateRangeFilter 
            onFilterChange={(start, end) => setDateRange({ start, end })} 
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode='popLayout'>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8" variant="circle" />
                          <div className="space-y-2">
                             <Skeleton className="h-3 w-24" />
                             <Skeleton className="h-2 w-32" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-8" variant="circle" /></td>
                    </tr>
                  ))
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={order.id} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-dark group-hover:text-brand transition-colors cursor-pointer">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-dark">{order.user_name}</p>
                            <p className="text-xs text-slate-400">{order.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-dark">{order.service}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-dark">{order.amount}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer ${getStatusStyle(order.status)}`}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Action Required">Action Required</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedOrder(order);
                                setEditAmount(order.amount.replace(/[^0-9.]/g, ''));
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-brand hover:bg-slate-50 transition-colors rounded-lg border border-transparent hover:border-slate-200"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === order.id ? null : order.id);
                                }}
                                className={`p-2 transition-all rounded-lg border ${
                                  activeMenuId === order.id 
                                    ? 'text-dark bg-slate-100 border-slate-200' 
                                    : 'text-slate-400 hover:text-dark hover:bg-white border-transparent hover:border-slate-200'
                                }`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              <AnimatePresence>
                                {activeMenuId === order.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10" 
                                      onClick={() => setActiveMenuId(null)} 
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden py-1"
                                    >
                                      <button
                                        onClick={() => handleCopyId(order.id)}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-dark transition-colors"
                                      >
                                        <Copy className="h-4 w-4" />
                                        Copy Order ID
                                      </button>
                                      <div className="h-px bg-slate-100 my-1" />
                                      <button
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Order
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 rounded-full">
                          <AlertCircle className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No orders found matching your criteria.</p>
                        <button 
                          onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                          className="text-brand font-bold text-sm hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium font-sans">
            Showing <span className="text-dark font-bold">{filteredOrders.length}</span> of {orders.length} total orders
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-bold text-slate-400 bg-white border border-slate-200 rounded-xl cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-2 text-sm font-bold text-dark bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      <SuccessOverlay 
        isVisible={showSuccess} 
        message={successMessage || "All order data has been exported to CSV successfully."} 
        onComplete={() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }} 
      />

      {/* Order Details Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-dark/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-dark">Order Details</h2>
                    <p className="text-slate-500 text-sm mt-1">Detailed view of the client's service request.</p>
                  </div>
                  <button 
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm text-lg font-bold text-dark">
                      {selectedOrder.user_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark">{selectedOrder.user_name || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{selectedOrder.user_email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID</label>
                      <p className="text-lg font-bold text-dark mt-1">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                      <div className="mt-1 text-left">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service</label>
                    <p className="text-lg font-medium text-slate-700 mt-1">{selectedOrder.service}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input 
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-white text-dark"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</label>
                      <p className="text-sm font-medium text-slate-600 mt-2">{selectedOrder.date}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setIsDetailModalOpen(false)}
                      className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                    >
                      Close
                    </button>
                    <button 
                      onClick={handleSaveAmount}
                      disabled={isSavingAmount}
                      className="flex-1 py-4 bg-dark text-white rounded-2xl font-bold hover:bg-dark-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSavingAmount ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Save Price'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
