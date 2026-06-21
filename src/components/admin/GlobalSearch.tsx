import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, ShoppingBag, Layers, AlertCircle, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  id: number;
  name: string;
  email: string;
  whatsapp_number?: string;
}

interface Order {
  id: string;
  service: string;
  user_name: string;
  user_email: string;
  status: string;
}

interface Service {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
}

interface ComplianceTask {
  id: number;
  title: string;
  type: string;
  user_name: string;
  status: string;
}

interface GroupedResults {
  customers: Customer[];
  orders: Order[];
  services: Service[];
  compliance: ComplianceTask[];
}

const matchesQuery = (text: string | undefined, query: string) => {
  if (!text) return false;
  return text.toLowerCase().includes(query.toLowerCase());
};

function useGlobalSearch(searchTerm: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GroupedResults>({
    customers: [],
    orders: [],
    services: [],
    compliance: []
  });

  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchAllData = async () => {
      const trimmed = debouncedTerm.trim();
      if (!trimmed) {
        setResults({ customers: [], orders: [], services: [], compliance: [] });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [usersRes, ordersRes, servicesRes, complianceRes] = await Promise.all([
          fetch('/api/admin/users', { headers }),
          fetch('/api/admin/orders', { headers }),
          fetch('/api/admin/services', { headers }),
          fetch('/api/admin/compliance', { headers })
        ]);

        let customers: Customer[] = [];
        let orders: Order[] = [];
        let services: Service[] = [];
        let compliance: ComplianceTask[] = [];

        if (usersRes.ok) {
          const allUsers = await usersRes.json();
          customers = allUsers.filter((u: any) => 
            matchesQuery(u.name, trimmed) || 
            matchesQuery(u.email, trimmed) || 
            matchesQuery(u.whatsapp_number, trimmed)
          );
        }

        if (ordersRes.ok) {
          const allOrders = await ordersRes.json();
          orders = allOrders.filter((o: any) => 
            matchesQuery(o.id, trimmed) || 
            matchesQuery(o.service, trimmed) || 
            matchesQuery(o.user_name, trimmed) || 
            matchesQuery(o.user_email, trimmed)
          );
        }

        if (servicesRes.ok) {
          const allServices = await servicesRes.json();
          services = allServices.filter((s: any) => 
            matchesQuery(s.name, trimmed) || 
            matchesQuery(s.code, trimmed) || 
            matchesQuery(s.category, trimmed) || 
            matchesQuery(s.description, trimmed)
          );
        }

        if (complianceRes.ok) {
          const allCompliance = await complianceRes.json();
          compliance = allCompliance.filter((t: any) => 
            matchesQuery(t.title, trimmed) || 
            matchesQuery(t.type, trimmed) || 
            matchesQuery(t.user_name, trimmed)
          );
        }

        setResults({ customers, orders, services, compliance });
      } catch (err: any) {
        console.error('Global search fetch error:', err);
        setError(err.message || 'Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [debouncedTerm]);

  return { results, loading, error };
}

export default function GlobalSearch({ onClose }: { onClose?: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading, error } = useGlobalSearch(searchTerm);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation / closing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectResult = (path: string) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate(path);
    if (onClose) onClose();
  };

  const hasResults = 
    results.customers.length > 0 || 
    results.orders.length > 0 || 
    results.services.length > 0 ||
    results.compliance.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-50">
      {/* Search Input Container */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Global search by customers, orders, or services..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-dark placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-dark hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (searchTerm.trim() !== '') && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto"
          >
            {loading && (
              <div className="flex items-center justify-center py-12 gap-3 text-slate-400 font-bold text-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
                >
                  <Search className="h-5 w-5 animate-pulse" />
                </motion.div>
                Searching platform data...
              </div>
            )}

            {!loading && error && (
              <div className="p-6 text-center text-red-500 font-bold text-sm flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {!loading && !error && !hasResults && (
              <div className="p-8 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2">
                <div className="p-3 bg-slate-50 rounded-full">
                  <Search className="h-6 w-6 text-slate-300" />
                </div>
                <span>No results found matching "{searchTerm}"</span>
              </div>
            )}

            {!loading && !error && hasResults && (
              <div className="py-2 divide-y divide-slate-100">
                {/* 1. Customers Section */}
                {results.customers.length > 0 && (
                  <div className="py-3 px-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      Customers ({results.customers.length})
                    </div>
                    <div className="space-y-1">
                      {results.customers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectResult(`/admin/users/${c.id}`)}
                          className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
                        >
                          <p className="text-sm font-bold text-dark">{c.name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{c.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Orders Section (Includes both orders and compliance tasks) */}
                {(results.orders.length > 0 || results.compliance.length > 0) && (
                  <div className="py-3 px-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                      <ShoppingBag className="h-3 w-3" />
                      Orders & Tasks ({results.orders.length + results.compliance.length})
                    </div>
                    <div className="space-y-1">
                      {/* Active Orders */}
                      {results.orders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => handleSelectResult(`/admin/orders?id=${o.id}`)}
                          className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-bold text-dark">{o.service}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {o.id} • Customer: {o.user_name}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase">
                            {o.status}
                          </span>
                        </div>
                      ))}

                      {/* Compliance Tasks */}
                      {results.compliance.map((t) => (
                        <div
                          key={`comp-${t.id}`}
                          onClick={() => handleSelectResult(`/admin/compliance?search=${t.title}`)}
                          className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <CalendarClock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              {t.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">Statutory Filing • Customer: {t.user_name}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 uppercase">
                            {t.status || 'Compliance'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Services Section */}
                {results.services.length > 0 && (
                  <div className="py-3 px-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                      <Layers className="h-3 w-3" />
                      Services ({results.services.length})
                    </div>
                    <div className="space-y-1">
                      {results.services.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelectResult(`/admin/services?search=${s.code}`)}
                          className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-sm font-bold text-dark line-clamp-1">{s.name}</p>
                            <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{s.code}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{s.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
