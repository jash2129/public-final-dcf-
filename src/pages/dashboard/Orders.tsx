import { Search, Filter, Download, Eye, X, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { serviceCategories } from '../../data/services';
import DateRangeFilter from '../../components/orders/DateRangeFilter';
import Skeleton from '../../components/ui/Skeleton';

interface Order {
  id: string;
  service: string;
  date: string;
  status: string;
  amount: string;
}

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New Order State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [servicesCatalog, setServicesCatalog] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    service: '',
    amount: ''
  });

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Row Action State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Date Filter State
  const [dateRange, setDateRange] = useState<{start: string | null, end: string | null}>({start: null, end: null});

  const allServices = serviceCategories.flatMap(cat => cat.services).sort();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/orders';
      if (dateRange.start && dateRange.end) {
        const params = new URLSearchParams({
          startDate: dateRange.start,
          endDate: dateRange.end
        });
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesCatalog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setServicesCatalog(data);
      }
    } catch (err) {
      console.error('Failed to fetch services catalog:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchServicesCatalog();
  }, [dateRange]);

  useEffect(() => {
    if (location.state && (location.state as any).openNewOrderModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service || !formData.amount) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const newId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: newId,
          service: formData.service,
          date: currentDate,
          status: 'Processing',
          amount: `₹${parseFloat(formData.amount).toLocaleString('en-IN')}`
        })
      });

      if (!response.ok) throw new Error('Failed to create order');

      // Refresh list and close modal
      await fetchOrders();
      setIsModalOpen(false);
      setFormData({ service: '', amount: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Call pay initiate endpoint
      const response = await fetch(`/api/orders/${orderId}/pay/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to initiate payment');
      }
      
      const paymentData = await response.json();
      
      // Get logged in user details to prefill form
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // 2. Open Razorpay checkout modal
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Deccan Filings',
        description: `Payment for Order ${orderId}`,
        order_id: paymentData.razorpayOrderId,
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay directly via UPI Apps',
                instruments: [
                  { method: 'upi' }
                ]
              },
              other: {
                name: 'Other Payment Methods',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' }
                ]
              }
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        handler: async function (callbackResponse: any) {
          try {
            // 3. Call verify payment endpoint
            const verifyResponse = await fetch(`/api/orders/${orderId}/pay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: callbackResponse.razorpay_payment_id,
                razorpay_order_id: callbackResponse.razorpay_order_id,
                razorpay_signature: callbackResponse.razorpay_signature
              })
            });
            
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              alert('Payment verified and captured successfully!');
              fetchOrders();
            } else {
              alert('Payment verification failed: ' + (verifyData.error || 'Verification error'));
            }
          } catch (verifyErr: any) {
            console.error('Error during signature verification:', verifyErr);
            alert('An error occurred during payment verification.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#0057FF'
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      alert('Failed to launch payment checkout: ' + err.message);
    }
  };

  // Filtered Orders Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (filteredOrders.length === 0) return;

    const headers = ['Order ID', 'Service', 'Date', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(o => [
        o.id,
        `"${o.service}"`,
        o.date,
        `"${o.amount}"`,
        o.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Users can only view their orders; status changes and deletion are admin-only.

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all your service requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-hover transition-all shadow-[0_0_15px_rgba(0,87,255,0.4)] hover:shadow-[0_0_25px_rgba(0,87,255,0.6)] hover:-translate-y-0.5 items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-dark text-white p-4 rounded-2xl shadow-premium active:scale-95 transition-all md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <div className="clean-card-premium rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search orders by ID or service..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-3 relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${
                statusFilter !== 'All' 
                ? 'bg-brand text-white border-brand shadow-[0_0_10px_rgba(0,87,255,0.3)]' 
                : 'border-slate-200 text-dark hover:bg-slate-50'
              }`}
            >
              <Filter className="h-4 w-4" /> {statusFilter === 'All' ? 'Filter' : statusFilter}
            </button>

            <DateRangeFilter 
              onFilterChange={(start, end) => setDateRange({ start, end })} 
            />

            <AnimatePresence>
              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 overflow-hidden"
                  >
                    {['All', 'Processing', 'Action Required', 'Completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          statusFilter === status 
                          ? 'bg-brand/10 text-brand font-bold' 
                          : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <button 
              onClick={handleExport}
              disabled={filteredOrders.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-dark hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-dark">{order.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{order.service}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-dark">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Action Required' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {order.status === 'Placed' && (
                          <button
                            onClick={() => handlePayment(order.id)}
                            className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_10px_rgba(0,87,255,0.3)] hover:shadow-[0_0_15px_rgba(0,87,255,0.5)] hover:-translate-y-0.5"
                          >
                            Pay Now
                          </button>
                        )}
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-brand transition-colors rounded-lg hover:bg-slate-100" 
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No orders found.</div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => {
                  setSelectedOrder(order);
                  setIsDetailModalOpen(true);
                }}
                className="p-4 active:bg-brand/5 hover:bg-brand/5 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.id}</span>
                    <h3 className="font-bold text-dark">{order.service}</h3>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'Action Required' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold mt-2">
                  <span className="text-slate-500">{order.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-dark">{order.amount}</span>
                    {order.status === 'Placed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayment(order.id);
                        }}
                        className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-[10px] font-black rounded-lg transition-all shadow-md uppercase tracking-wider"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>Showing {filteredOrders.length > 0 ? 1 : 0} to {filteredOrders.length} of {filteredOrders.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md bg-dark text-white">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      {/* New Order Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-dark/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative clean-card-premium w-full max-w-lg rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-dark">Take New Order</h2>
                    <p className="text-slate-500 text-sm mt-1">Create a new service request manually.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark ml-1">Select Service</label>
                    <select 
                      required
                      value={formData.service}
                      onChange={(e) => {
                        const serviceName = e.target.value;
                        const matched = servicesCatalog.find(s => s.name.toLowerCase() === serviceName.toLowerCase());
                        let matchedPrice = '';
                        if (matched && matched.price > 0) {
                          matchedPrice = matched.price.toString();
                        } else {
                          // if prices are not there make some random amount
                          const randomPrice = Math.floor(10 + Math.random() * 40) * 100; // e.g. 1000 to 4900
                          matchedPrice = randomPrice.toString();
                        }
                        setFormData({
                          ...formData,
                          service: serviceName,
                          amount: matchedPrice
                        });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Choose a service...</option>
                      {allServices.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark ml-1">Order Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                      <input 
                        required
                        readOnly
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        className="w-full pl-8 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none cursor-not-allowed text-slate-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 px-6 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 px-6 bg-brand text-white rounded-xl font-bold hover:bg-brand-hover shadow-[0_0_15px_rgba(0,87,255,0.4)] hover:shadow-[0_0_25px_rgba(0,87,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Create Order'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
              className="relative clean-card-premium w-full max-w-lg rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-dark">Order Details</h2>
                    <p className="text-slate-500 text-sm mt-1">Detailed view of the service request.</p>
                  </div>
                  <button 
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID</label>
                      <p className="text-lg font-bold text-dark mt-1">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                      <div className="mt-1 text-left">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          selectedOrder.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          selectedOrder.status === 'Action Required' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service</label>
                    <p className="text-lg font-medium text-slate-700 mt-1">{selectedOrder.service}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</label>
                      <p className="text-2xl font-bold text-dark mt-1">{selectedOrder.amount}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Date</label>
                      <p className="text-sm font-medium text-slate-600 mt-2">{selectedOrder.date}</p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    {selectedOrder.status === 'Placed' && (
                      <button
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          handlePayment(selectedOrder.id);
                        }}
                        className="w-full py-4 bg-brand text-white rounded-2xl font-bold hover:bg-brand-hover transition-all shadow-[0_0_15px_rgba(0,87,255,0.4)] hover:shadow-[0_0_25px_rgba(0,87,255,0.6)] hover:-translate-y-0.5"
                      >
                        Pay Now ({selectedOrder.amount})
                      </button>
                    )}
                    <button 
                      onClick={() => setIsDetailModalOpen(false)}
                      className="w-full py-4 bg-dark text-white rounded-2xl font-bold hover:bg-dark-200 transition-all shadow-lg hover:shadow-xl"
                    >
                      Close View
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
