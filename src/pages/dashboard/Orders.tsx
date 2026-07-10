import { Search, Filter, Download, Eye, X, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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

const ALL_CATEGORIES = [
  'Compliance',
  'Finance',
  'Global',
  'GST',
  'Income Tax',
  'License',
  'MCA',
  'Startup Registrations',
  'Trademark',
];

export default function Orders() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('id') || searchParams.get('search') || '';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedCategory('');
      setFormData({ service: '', amount: '' });
    }
  }, [isModalOpen]);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<{start: string | null, end: string | null}>({start: null, end: null});

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange]);

  // Row Action State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (orders.length > 0 && initialSearch) {
      const matchedOrder = orders.find(
        o => o.id.toLowerCase() === initialSearch.toLowerCase()
      );
      if (matchedOrder) {
        setSelectedOrder(matchedOrder);
        setIsDetailModalOpen(true);
      }
    }
  }, [orders, initialSearch]);

  const uniqueCategories = React.useMemo(() => {
    if (servicesCatalog.length === 0) return ALL_CATEGORIES;
    const fromApi = Array.from(new Set(servicesCatalog.map(s => s.category))).filter(Boolean);
    // Merge API categories with hardcoded ones to ensure none are missing
    const merged = Array.from(new Set([...fromApi, ...ALL_CATEGORIES]));
    return merged.sort();
  }, [servicesCatalog]);

  const availableServices = React.useMemo(() => {
    return selectedCategory ? servicesCatalog.filter(s => s.category === selectedCategory).sort((a, b) => a.name.localeCompare(b.name)) : [];
  }, [selectedCategory, servicesCatalog]);

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
      const response = await fetch(`/api/services?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
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
  }, [dateRange]);

  useEffect(() => {
    fetchServicesCatalog();
  }, []);

  // Re-fetch catalog when modal opens to get fresh categories
  useEffect(() => {
    if (isModalOpen) {
      fetchServicesCatalog();
    }
  }, [isModalOpen]);

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
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.phone || user.phone.trim() === '') {
        alert('Please complete your profile and add a mobile number before placing an order.');
        window.location.href = '/complete-profile';
        return;
      }

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
  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    const term = searchTerm.toLowerCase().trim();
    
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(term) ||
        order.service.toLowerCase().includes(term);
      
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

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
                    {['All', 'Placed', 'Processing', 'Action Required', 'Completed'].map((status) => (
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
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-dark">{order.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{order.service}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-dark">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Action Required' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'Placed' ? 'bg-slate-100 text-slate-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {order.status === 'Placed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayment(order.id);
                            }}
                            className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_10px_rgba(0,87,255,0.3)] hover:shadow-[0_0_15px_rgba(0,87,255,0.5)] hover:-translate-y-0.5"
                          >
                            Pay Now
                          </button>
                        )}
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
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
            paginatedOrders.map((order) => (
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'Action Required' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'Placed' ? 'bg-slate-100 text-slate-700' :
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
          <span>
            Showing {filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
          </span>
          <div className="flex gap-1 items-center">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold text-xs"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-md cursor-pointer font-bold text-xs ${
                  currentPage === page 
                    ? 'bg-dark text-white border-dark' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold text-xs"
            >
              Next
            </button>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Step 1: Category Dropdown */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        1. Select Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setFormData({ service: '', amount: '' });
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>-- Choose Category --</option>
                        {uniqueCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Step 2: Service Dropdown */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        2. Select Service
                      </label>
                      <select
                        disabled={!selectedCategory}
                        value={formData.service}
                        onChange={(e) => {
                          const serviceName = e.target.value;
                          const matched = availableServices.find(s => s.name === serviceName);
                          let matchedPrice = '';
                          if (matched && matched.price > 0) {
                            matchedPrice = matched.price.toString();
                          } else {
                            const randomPrice = Math.floor(10 + Math.random() * 40) * 100;
                            matchedPrice = randomPrice.toString();
                          }
                          setFormData({
                            ...formData,
                            service: serviceName,
                            amount: matchedPrice
                          });
                        }}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none transition-all appearance-none cursor-pointer ${
                          !selectedCategory ? 'opacity-50 cursor-not-allowed border-slate-200' : 'border-slate-200 focus:ring-2 focus:ring-brand hover:border-slate-300'
                        }`}
                      >
                        <option value="" disabled>
                          {!selectedCategory ? '-- Select Category First --' : '-- Choose Service --'}
                        </option>
                        {availableServices.map(service => (
                          <option key={service.id} value={service.name}>
                            {service.name} (₹{service.price})
                          </option>
                        ))}
                      </select>
                    </div>
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

                  {formData.amount && (() => {
                    const basePrice = parseFloat(formData.amount) || 0;
                    const cgst = basePrice * 0.09;
                    const sgst = basePrice * 0.09;
                    const totalAmount = basePrice * 1.18;
                    return (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-sm text-slate-600 font-medium">
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span>₹{basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CGST (9%):</span>
                          <span>₹{cgst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST (9%):</span>
                          <span>₹{sgst.toFixed(2)}</span>
                        </div>
                        <hr className="border-slate-200/60 my-1" />
                        <div className="flex justify-between font-bold text-dark">
                          <span>Total Amount:</span>
                          <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}

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
                          selectedOrder.status === 'Placed' ? 'bg-slate-100 text-slate-700' :
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
