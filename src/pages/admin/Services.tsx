import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  RefreshCcw, 
  AlertCircle,
  X,
  Tag,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';
import SuccessOverlay from '../../components/ui/SuccessOverlay';
import { serviceCategories } from '../../data/services';

interface Service {
  id: number;
  code: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price: number;
  mode?: string;
  turnaround_time?: string;
  standard_due_rule?: string;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals & Actions State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form Edit State
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    standard_due_rule: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to fetch services catalog', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setEditForm({
      name: service.name || '',
      category: service.category || '',
      price: service.price !== undefined ? String(service.price) : '0',
      description: service.description || '',
      standard_due_rule: service.standard_due_rule || 'No statutory deadline'
    });
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // Client-side Validation
    const errors: Record<string, string> = {};
    if (!editForm.name.trim()) errors.name = 'Service name cannot be empty';
    if (!editForm.category.trim()) errors.category = 'Category cannot be empty';
    
    const parsedPrice = parseFloat(editForm.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      errors.price = 'Price must be a non-negative number';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          price: parsedPrice,
          description: editForm.description,
          standard_due_rule: editForm.standard_due_rule
        })
      });

      if (response.ok) {
        setSuccessMessage(`Service "${editForm.name}" updated successfully.`);
        setShowSuccess(true);
        setIsEditModalOpen(false);
        fetchServices();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update service details');
      }
    } catch (err) {
      console.error('Update service error:', err);
      alert('A network error occurred while updating the service.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get categories from serviceCategories imported from src/data/services.ts
  const categories = ['All', ...serviceCategories.map(c => c.title)];

  // Filter logic
  const filteredServices = services.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Global Service Catalog</h1>
          <p className="text-slate-500">Manage base product/service definitions, rules, and global pricing.</p>
        </div>
        <button 
          onClick={fetchServices}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-dark hover:border-slate-300 transition-all shadow-sm"
        >
          <RefreshCcw className="h-4 w-4" />
          Reload Catalog
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search catalog by name, code or description..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Horizontal scrollable category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${
                selectedCategory === category 
                  ? 'bg-dark text-white border-dark shadow-sm' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-dark hover:text-dark'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={service.id}
                className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Visual Category Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 group-hover:bg-brand transition-colors" />

                <div className="space-y-2.5 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 rounded-full uppercase tracking-wider">
                      {service.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{service.code}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-dark group-hover:text-brand transition-colors leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                      <span>Mode: {service.mode || 'Online'}</span>
                      <span className="text-slate-300">•</span>
                      <span>TAT: {service.turnaround_time || '3-5 days'}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-2 sm:line-clamp-3 font-medium min-h-0 sm:min-h-[54px]">
                    {service.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Base Price</span>
                    <span className="text-lg font-black text-dark font-sans">
                      ₹{service.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleEditClick(service)}
                    className="w-full sm:w-auto justify-center flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-100 hover:bg-brand hover:border-brand hover:text-dark text-slate-500 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Price
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-slate-50 rounded-full">
                <AlertCircle className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium font-sans">No services found matching your query.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="text-brand font-bold text-sm hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Banner Overlay */}
      <SuccessOverlay 
        isVisible={showSuccess} 
        message={successMessage} 
        onComplete={() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }} 
      />

      {/* Slide-over Drawer / Modal for Editing */}
      <AnimatePresence>
        {isEditModalOpen && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-dark/20 backdrop-blur-sm"
            />

            {/* Slide-in Form Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                      Editing Service Details ({selectedService.code})
                    </span>
                    <h2 className="text-2xl font-bold text-dark leading-tight">{selectedService.name}</h2>
                  </div>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSaveService} className="space-y-6">
                  {/* Service Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Service Name
                    </label>
                    <input 
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all ${
                        validationErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-xs font-semibold">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Category & Pricing in columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        Category
                      </label>
                      <input 
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all ${
                          validationErrors.category ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                        }`}
                      />
                      {validationErrors.category && (
                        <p className="text-red-500 text-xs font-semibold">{validationErrors.category}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        Base Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-bold text-slate-400 text-sm">₹</span>
                        <input 
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className={`w-full pl-8 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all ${
                            validationErrors.price ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {validationErrors.price && (
                        <p className="text-red-500 text-xs font-semibold">{validationErrors.price}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Catalog Description
                    </label>
                    <textarea 
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand transition-all leading-relaxed"
                      placeholder="Enter a friendly details description of the statutory service..."
                    />
                  </div>

                  {/* Standard Statutory Rule */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Statutory Due Rule Description
                    </label>
                    <input 
                      type="text"
                      value={editForm.standard_due_rule}
                      onChange={(e) => setEditForm({ ...editForm, standard_due_rule: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand transition-all"
                      placeholder="e.g. 20th of succeeding month"
                    />
                  </div>
                </form>
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveService}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-dark text-white rounded-2xl font-bold hover:bg-dark-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {isSaving ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Save Details
                      <ArrowRight className="h-4 w-4" />
                    </>
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
