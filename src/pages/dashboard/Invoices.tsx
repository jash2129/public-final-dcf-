import { Download, CreditCard, Receipt, Search, Filter, CheckCircle2, Clock } from 'lucide-react';

import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
  service: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/invoices', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch invoices:', err);
        setInvoices([]);
        setLoading(false);
      });
  }, []);
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Invoices & Billing</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your payments, invoices, and billing history.</p>
        </div>
        <button className="bg-white border border-slate-200 text-dark px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
          <CreditCard className="h-4 w-4" />
          Payment Methods
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clean-card-premium p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-lightest text-dark rounded-xl">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Spent (YTD)</p>
              <p className="text-2xl font-bold text-dark">₹38,995</p>
            </div>
          </div>
        </div>
        
        <div className="clean-card-premium p-6 rounded-2xl border-amber-200/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Outstanding Balance</p>
              <p className="text-2xl font-bold text-dark">₹1,499</p>
            </div>
          </div>
          <button className="w-full bg-brand text-white text-sm font-bold py-2 rounded-lg hover:bg-brand-hover transition-colors shadow-[0_0_15px_rgba(0,87,255,0.4)] hover:shadow-[0_0_25px_rgba(0,87,255,0.6)]">
            Pay Now
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="clean-card-premium rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-dark hover:bg-slate-50 transition-colors">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-brand/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-dark">{invoice.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{invoice.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{invoice.service}</td>
                    <td className="px-6 py-4 text-sm font-bold text-dark">{invoice.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {invoice.status === 'Paid' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-dark transition-colors rounded-lg hover:bg-slate-100 inline-flex">
                        <Download className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
