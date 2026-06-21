import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Calendar, 
  Hash, 
  FileText, 
  Receipt, 
  ShoppingCart, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileCode
} from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  whatsapp_number?: string;
  avatar?: string;
  company_name?: string;
  address?: string;
  gstin?: string;
  created_at?: string;
}

interface Order {
  id: string;
  service: string;
  date: string;
  amount: string;
  status: string;
}

interface Invoice {
  id: string;
  orderId: string;
  date: string;
  amount: string;
  status: string;
  service: string;
}

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'documents' | 'invoices'>('orders');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [userRes, ordersRes, invoicesRes, docsRes] = await Promise.all([
          fetch(`/api/admin/users/${userId}`, { headers }),
          fetch(`/api/admin/orders?userId=${userId}`, { headers }),
          fetch(`/api/admin/invoices/user/${userId}`, { headers }),
          fetch(`/api/documents/admin/user/${userId}`, { headers })
        ]);

        if (!userRes.ok) {
          throw new Error(`Failed to load user profile (Status: ${userRes.status})`);
        }

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();
        const invoicesData = await invoicesRes.json();
        const docsData = await docsRes.json();

        setUser(userData);
        // Bind document lists from dedicated endpoint
        setDocuments(Array.isArray(docsData) ? docsData : []);
        // Bind order list directly to state
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        // Bind completed invoices list directly to state (Completed orders & seeded paid invoices)
        const completedInvoices = (Array.isArray(invoicesData) ? invoicesData : []).filter(
          (inv: any) => inv.status.toLowerCase() === 'completed' || inv.status.toLowerCase() === 'paid'
        );
        setInvoices(completedInvoices);
      } catch (err: any) {
        console.error('Error fetching admin user detail data:', err);
        setError(err.message || 'An unexpected error occurred while loading client profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleDocumentDownload = async (docId: string, docName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/admin/${docId}/file`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`Failed to download document (Status: ${response.status})`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      alert(err.message || 'Error downloading document');
    }
  };

  const handleInvoiceDownload = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/invoices/${orderId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`Failed to download invoice (Status: ${response.status})`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      alert(err.message || 'Error downloading invoice');
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('completed') || s === 'paid') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (s.includes('processing') || s.includes('progress') || s === 'pending') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (s.includes('action') || s.includes('reject')) {
      return 'bg-rose-100 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('completed') || s === 'paid') {
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    }
    if (s.includes('processing') || s.includes('progress') || s === 'pending') {
      return <Clock className="h-3.5 w-3.5" />;
    }
    return <AlertCircle className="h-3.5 w-3.5" />;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Robust loading state rendering to prevent flashing empty UI elements
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-10 w-42 bg-slate-900/60 rounded-xl" />
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-20 w-20 bg-slate-900 rounded-full" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-6 w-48 bg-slate-900" />
              <Skeleton className="h-4 w-72 bg-slate-900" />
            </div>
          </div>
          <div className="h-px bg-slate-800" />
          <Skeleton className="h-96 bg-slate-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="h-16 w-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 mx-auto text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Failed to Load Profile</h2>
          <p className="text-slate-400 text-sm mt-1">{error || 'User details could not be loaded.'}</p>
        </div>
        <button 
          onClick={() => navigate('/admin/orders')}
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-100 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Orders
        </button>
      </div>
    );
  }

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Log state to verify data binding in browser developer console
  console.log("UI Rendering Check:", { orders, documents, invoices });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-600">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      {/* Main Container - Light Mode Styling */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
        
        {/* Profile Header Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-200">
          
          {/* User Info Sidebar - contrast bg-slate-50 */}
          <div className="md:col-span-1 bg-slate-50 border border-slate-200/60 rounded-xl p-5 flex flex-col items-center text-center space-y-4 shadow-sm">
            <div className="h-20 w-20 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-2xl text-slate-700 shadow-sm flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover rounded-full" />
              ) : (
                userInitials
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{user.name}</h2>
              <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-brand/10 text-brand border border-brand/20 rounded-full">
                {user.role}
              </span>
            </div>

            <div className="w-full border-t border-slate-200 pt-4 space-y-2 text-xs text-left">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Joined: {formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Detailed Meta Section */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Email Address</span>
                <span className="text-sm text-slate-800 font-medium break-all">{user.email}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">WhatsApp / Phone</span>
                <span className="text-sm text-slate-800 font-medium">{user.whatsapp_number || user.phone || 'N/A'}</span>
              </div>

              {user.company_name && (
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Company Name</span>
                  <span className="text-sm text-slate-800 font-medium">{user.company_name}</span>
                </div>
              )}

              {user.gstin && (
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">GSTIN</span>
                  <span className="text-sm text-slate-800 font-medium font-mono">{user.gstin}</span>
                </div>
              )}

              {user.address && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Billing Address</span>
                  <span className="text-sm text-slate-800 font-medium leading-relaxed block mt-1">{user.address}</span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div>
          <div className="flex border-b border-slate-200 gap-6 mb-6">
            {[
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'invoices', label: 'Invoices', icon: Receipt },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-4 text-sm transition-all relative cursor-pointer font-bold ${
                    isActive 
                      ? 'border-b-2 border-brand text-brand font-black' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panels with display and size constraints */}
          <div className="pt-2 w-full min-h-[300px] flex flex-col" style={{ display: 'flex' }}>
            
            {/* Orders Panel */}
            {activeTab === 'orders' && (
              <div className="space-y-4 w-full min-h-[300px] flex flex-col" style={{ display: 'flex' }}>
                {orders.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white w-full flex flex-col shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Service</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold">
                              <button 
                                onClick={() => navigate(`/admin/orders?id=${order.id}`)}
                                className="text-brand hover:text-brand-hover hover:underline font-bold text-left cursor-pointer transition-colors focus:outline-none"
                              >
                                {order.id}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{order.service}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">{order.amount}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState 
                    icon={ShoppingCart} 
                    title="No orders found for this user" 
                    description="This customer hasn't purchased any filing services yet."
                    className="border-slate-200 bg-slate-50/50"
                  />
                )}
              </div>
            )}

            {/* Documents Panel */}
            {activeTab === 'documents' && (
              <div className="space-y-4 w-full min-h-[300px] flex flex-col" style={{ display: 'flex' }}>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shrink-0 text-slate-500 shadow-sm">
                            {doc.type === 'pdf' ? <FileText className="h-5 w-5 text-red-500" /> : <FileCode className="h-5 w-5 text-blue-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-mono font-medium">{doc.size} • {doc.date}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDocumentDownload(doc.id, doc.name)}
                          className="p-2.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg transition-all border border-slate-200 shrink-0 cursor-pointer shadow-sm"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={FileText} 
                    title="No documents uploaded for this user" 
                    description="This customer hasn't uploaded any documents or compliance files yet."
                    className="border-slate-200 bg-slate-50/50"
                  />
                )}
              </div>
            )}

            {/* Invoices Panel */}
            {activeTab === 'invoices' && (
              <div className="space-y-4 w-full min-h-[300px] flex flex-col" style={{ display: 'flex' }}>
                {invoices.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white w-full flex flex-col shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Invoice ID</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Service</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Download</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">{invoice.id}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{invoice.date}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{invoice.service}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">{invoice.amount}</td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleInvoiceDownload(invoice.orderId)}
                                className="bg-brand hover:bg-brand-hover text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState 
                    icon={Receipt} 
                    title="No invoices found for this user" 
                    description="There are no completed orders for this user to generate invoices from."
                    className="border-slate-200 bg-slate-50/50"
                  />
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
