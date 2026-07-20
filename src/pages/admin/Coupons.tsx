import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  RefreshCcw, 
  AlertCircle,
  X,
  Tag,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';
import SuccessOverlay from '../../components/ui/SuccessOverlay';

interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount: number | null;
  min_order_value: number | null;
  valid_until: string | null; // Date string
  usage_limit: number | null;
  times_used: number;
  active: boolean;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Actions State
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    max_discount: '',
    min_order_value: '',
    usage_limit: '',
    valid_until: '',
    active: true
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/coupons?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateNew = () => {
    setSelectedCoupon(null);
    setForm({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      max_discount: '',
      min_order_value: '',
      usage_limit: '',
      valid_until: '',
      active: true
    });
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      max_discount: coupon.max_discount ? String(coupon.max_discount) : '',
      min_order_value: coupon.min_order_value ? String(coupon.min_order_value) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : '',
      active: Boolean(coupon.active)
    });
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side Validation
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = 'Coupon code is required';
    
    const parsedValue = parseFloat(form.discount_value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      errors.discount_value = 'Discount value must be greater than 0';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: parsedValue,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
        valid_until: form.valid_until ? form.valid_until : null,
        active: form.active
      };

      const url = selectedCoupon ? `/api/coupons/${selectedCoupon.id}` : `/api/coupons`;
      const method = selectedCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccessMessage(`Coupon "${form.code}" ${selectedCoupon ? 'updated' : 'created'} successfully.`);
        setShowSuccess(true);
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save coupon');
      }
    } catch (err) {
      console.error('Save coupon error:', err);
      alert('A network error occurred while saving the coupon.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchCoupons();
      } else {
        alert('Failed to delete coupon');
      }
    } catch (err) {
      console.error(err);
      alert('A network error occurred');
    }
  };

  // Filter logic
  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Coupon Management</h1>
          <p className="text-slate-500">Create and manage discount codes for your customers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCoupons}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-dark hover:border-slate-300 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-hover transition-all shadow-[0_0_15px_rgba(0,87,255,0.4)] hover:shadow-[0_0_25px_rgba(0,87,255,0.6)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Coupon
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search coupons by code..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : filteredCoupons.length > 0 ? (
            filteredCoupons.map((coupon) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={coupon.id}
                className={`bg-white p-6 rounded-3xl border ${coupon.active ? 'border-brand/30 shadow-[0_0_20px_rgba(0,87,255,0.05)]' : 'border-slate-100 shadow-sm'} transition-all flex flex-col justify-between relative overflow-hidden`}
              >
                {!coupon.active && (
                  <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-0" />
                )}

                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2 ${coupon.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                      <h3 className="text-xl font-black text-dark tracking-tight uppercase">
                        {coupon.code}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-brand">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Discount</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Times Used:</span>
                      <span className="font-bold text-dark">{coupon.times_used} {coupon.usage_limit && `/ ${coupon.usage_limit}`}</span>
                    </div>
                    {coupon.min_order_value && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Min Order:</span>
                        <span className="font-bold text-dark">₹{coupon.min_order_value}</span>
                      </div>
                    )}
                    {coupon.max_discount && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Max Discount:</span>
                        <span className="font-bold text-dark">₹{coupon.max_discount}</span>
                      </div>
                    )}
                    {coupon.valid_until && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Expires:</span>
                        <span className="font-bold text-dark">{new Date(coupon.valid_until).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDelete(coupon.id, coupon.code)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditClick(coupon)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-slate-50 rounded-full">
                <AlertCircle className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium font-sans">No coupons found.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <SuccessOverlay 
        isVisible={showSuccess} 
        message={successMessage} 
        onComplete={() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }} 
      />

      {/* Slide-over Modal for Create/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-dark/20 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                      {selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                    </span>
                    <h2 className="text-2xl font-bold text-dark leading-tight">
                      {selectedCoupon ? form.code : 'Setup Discount'}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSaveCoupon} className="space-y-5">
                  
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-dark">Coupon Status</p>
                      <p className="text-xs text-slate-500">Enable or disable this code.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Coupon Code
                    </label>
                    <input 
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER50"
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-brand transition-all ${
                        validationErrors.code ? 'border-red-300' : 'border-slate-200'
                      }`}
                    />
                    {validationErrors.code && <p className="text-red-500 text-xs font-semibold">{validationErrors.code}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type</label>
                      <select
                        value={form.discount_type}
                        onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Value</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={form.discount_value}
                        onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                        placeholder="e.g. 50"
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all ${
                          validationErrors.discount_value ? 'border-red-300' : 'border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  {form.discount_type === 'percentage' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Discount Capping (₹) - Optional</label>
                      <input 
                        type="number"
                        value={form.max_discount}
                        onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                        placeholder="e.g. 1000"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Min Order Value (₹) - Optional</label>
                    <input 
                      type="number"
                      value={form.min_order_value}
                      onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usage Limit - Optional</label>
                      <input 
                        type="number"
                        value={form.usage_limit}
                        onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                        placeholder="e.g. 100"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Expiry - Optional</label>
                      <input 
                        type="date"
                        value={form.valid_until}
                        onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-brand transition-all"
                      />
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCoupon}
                  disabled={isSaving}
                  className="flex-1 py-3.5 bg-brand text-white rounded-2xl font-bold hover:bg-brand-hover transition-all shadow-[0_0_15px_rgba(0,87,255,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {isSaving ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Save Coupon <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
