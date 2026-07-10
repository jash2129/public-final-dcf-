import { Link, useLocation } from 'react-router-dom';
import { Building2, ArrowRight, FileText, Briefcase, CheckCircle, Globe, Scale, BookOpen, Calculator, Wallet, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { serviceCategories, generateSlug } from '../data/services';
import { useState, useEffect, useMemo } from 'react';

const categoryIcons: Record<string, any> = {
  "StartUp Registrations": Building2,
  "License": FileText,
  "Income Tax": BookOpen,
  "GST": Calculator,
  "MCA": Building2,
  "Compliance": CheckCircle,
  "Trademark": Briefcase,
  "Finance": Wallet,
  "Global": Globe
};

function getServiceDescription(serviceName: string): string {
  const lower = serviceName.toLowerCase();
  
  if (lower.includes('proprietorship') || lower.includes('partnership')) {
    return `Start your business quickly with our hassle-free ${serviceName} services.`;
  }
  if (lower.includes('company registration') || lower.includes('llp')) {
    return `Incorporate your ${serviceName.replace(' Registration', '')} with expert CA/CS guidance and complete documentation.`;
  }
  if (lower.includes('gst registration')) {
    return `Get your GSTIN quickly to start billing and stay compliant with tax laws.`;
  }
  if (lower.includes('gst return') || lower.includes('gst filing') || lower.includes('gst form')) {
    return `Ensure accurate and timely GST filings to avoid penalties and claim ITC.`;
  }
  if (lower.includes('trademark registration')) {
    return `Protect your brand identity and logo with our end-to-end trademark filing services.`;
  }
  if (lower.includes('trademark') || lower.includes('copyright') || lower.includes('patent') || lower.includes('design')) {
    return `Safeguard your intellectual property with professional ${serviceName} support.`;
  }
  if (lower.includes('itr') || lower.includes('income tax') || lower.includes('tds')) {
    return `Maximize your tax savings and ensure compliance with our expert income tax services.`;
  }
  if (lower.includes('mca') || lower.includes('roc') || lower.includes('dir-3') || lower.includes('annual return')) {
    return `Maintain corporate compliance with timely MCA filings and ROC updates.`;
  }
  if (lower.includes('license') || lower.includes('fssai') || lower.includes('certification') || lower.includes('code') || lower.includes('registration')) {
    return `Obtain necessary business licenses and certifications with our streamlined process.`;
  }
  if (lower.includes('drafting') || lower.includes('agreement') || lower.includes('deed')) {
    return `Get legally sound and customized documents drafted by experienced professionals.`;
  }
  if (lower.includes('uae') || lower.includes('usa') || lower.includes('foreign') || lower.includes('global')) {
    return `Expand your business globally with our international company incorporation services.`;
  }
  if (lower.includes('payroll') || lower.includes('bookkeeping') || lower.includes('accounting') || lower.includes('attendance')) {
    return `Streamline your finances and HR with our comprehensive management solutions.`;
  }
  if (lower.includes('amendment') || lower.includes('change') || lower.includes('transfer')) {
    return `Update your business details legally with our quick amendment services.`;
  }
  if (lower.includes('closure') || lower.includes('strike off') || lower.includes('cancellation')) {
    return `Legally close your business entities or registrations with proper compliance.`;
  }
  if (lower.includes('advisory') || lower.includes('consulting') || lower.includes('valuation')) {
    return `Expert guidance to optimize your business operations, valuation, and compliance.`;
  }
  if (lower.includes('loan')) {
    return `Access quick and flexible financing solutions for your personal or business needs.`;
  }
  if (lower.includes('insurance')) {
    return `Secure your family and business future with our comprehensive insurance plans.`;
  }
  if (lower.includes('mutual fund')) {
    return `Grow your wealth with professionally managed investment portfolios tailored to your goals.`;
  }
  
  return `Professional ${serviceName} with dedicated support and fast turnaround times.`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function ServicesCatalog() {
  const [activeCategory, setActiveCategory] = useState(serviceCategories[0]?.slug || '');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && location.hash) {
      const slug = location.hash.replace('#', '');
      const categoryExists = serviceCategories.some(c => c.slug === slug);
      if (categoryExists) {
        setActiveCategory(slug);
      }
    }
  }, [loading, location.hash]);

  // Flatten all services for global search
  const allServices = useMemo(() => {
    const list: { name: string; categoryTitle: string; categorySlug: string; icon: any }[] = [];
    serviceCategories.forEach((cat) => {
      cat.services.forEach((s) => {
        list.push({
          name: s,
          categoryTitle: cat.title,
          categorySlug: cat.slug,
          icon: categoryIcons[cat.title] || FileText
        });
      });
    });
    return list;
  }, []);

  // Filter based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return allServices.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        getServiceDescription(s.name).toLowerCase().includes(query) ||
        s.categoryTitle.toLowerCase().includes(query)
    );
  }, [searchQuery, allServices]);

  const activeCategoryData = useMemo(() => {
    return serviceCategories.find((c) => c.slug === activeCategory) || serviceCategories[0];
  }, [activeCategory]);

  const ActiveCategoryIcon = useMemo(() => {
    return activeCategoryData ? (categoryIcons[activeCategoryData.title] || FileText) : FileText;
  }, [activeCategoryData]);

  return (
    <div className="bg-background min-h-screen py-12 md:py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8 md:mb-12 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-brand/20 rounded-full blur-[80px] md:blur-[100px] -z-10"></div>
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/60 text-dark text-xs sm:text-sm font-bold mb-6 md:mb-8 shadow-sm backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
            Comprehensive Solutions
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-dark mb-4 md:mb-6 tracking-tight">
            Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark to-dark-400">Catalogue</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-dark-400 max-w-2xl mx-auto leading-relaxed px-4">
            Explore our comprehensive range of compliance, registration, and legal services tailored for your business needs.
          </p>
        </motion.div>

        {/* Global Search Bar */}
        <div className="max-w-lg mx-auto mb-10 px-4 relative z-40">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search all services (e.g. GST, ITR, Private Limited)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 sm:py-4 bg-white border border-slate-200 focus:border-brand rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand/20 shadow-sm transition-all text-dark font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-dark hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {searchQuery.trim().length > 0 ? (
          /* ─── Search Results View ─── */
          <div className="mb-24 px-2 sm:px-0">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-5 mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark tracking-tight">
                Search Results ({searchResults.length})
              </h2>
              {searchResults.length > 0 && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-slate-500 hover:text-dark transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
                <p className="text-slate-500 font-bold mb-4 text-sm sm:text-base">No services found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 bg-dark text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Back to Catalogue
                </button>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {searchResults.map((res) => {
                  const ResIcon = res.icon;
                  return (
                    <motion.div 
                      variants={itemVariants}
                      key={res.name} 
                      className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col hover:border-brand/50 hover:shadow-2xl hover:shadow-brand/5 transition-all duration-500 group relative"
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-lightest/80 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="p-5 sm:p-8 flex-grow relative z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 rounded-full uppercase tracking-wider mb-4">
                          {res.categoryTitle}
                        </span>
                        
                        {/* Compact mobile layout, vertical desktop layout */}
                        <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0 mb-4 sm:mb-8">
                          <div className="h-12 w-12 sm:h-14 sm:w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand group-hover:border-brand group-hover:text-dark transition-all duration-300 text-dark-400 shadow-sm sm:mb-6">
                            <ResIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                          </div>
                          <h3 className="font-bold text-base sm:text-lg md:text-xl text-dark group-hover:text-brand-hover transition-colors leading-tight">{res.name}</h3>
                        </div>
                        
                        <p className="text-dark-400 text-xs sm:text-sm leading-relaxed">{getServiceDescription(res.name)}</p>
                      </div>
                      
                      <div className="px-5 pb-5 pt-1 sm:px-8 sm:pb-8 sm:pt-2 relative z-10 mt-auto">
                        <Link to={`/services/${res.categorySlug}/${generateSlug(res.name)}`} className="inline-flex items-center gap-2 text-dark font-bold hover:text-brand transition-colors group/link text-xs sm:text-sm">
                          View Details 
                          <span className="bg-slate-100 p-1.5 rounded-full group-hover/link:bg-brand group-hover/link:text-dark transition-colors">
                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/link:translate-x-0.5 transition-transform" />
                          </span>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        ) : (
          /* ─── Standard Category Tabs View ─── */
          <>
            <div className="relative max-w-5xl mx-auto mb-10 md:mb-16">
              {/* Fade masks for scroll indication on mobile */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface/90 to-transparent pointer-events-none md:hidden z-50 rounded-r-2xl"></div>
              <div className="sticky top-20 z-40 bg-surface/90 backdrop-blur-md border border-slate-200/50 rounded-2xl p-2 shadow-soft flex items-center gap-1 overflow-x-auto scrollbar-none scroll-smooth">
                {serviceCategories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setActiveCategory(category.slug)}
                    className={`px-4.5 py-3 rounded-xl text-xs font-black transition-all shrink-0 capitalize whitespace-nowrap cursor-pointer min-h-[44px] ${
                      activeCategory === category.slug 
                        ? 'bg-dark text-white shadow-md' 
                        : 'text-slate-500 hover:text-dark hover:bg-surface-hover/80'
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Category Listing */}
            {activeCategoryData && (
              <motion.div 
                key={activeCategoryData.slug} 
                id={activeCategoryData.slug} 
                className="mb-24 px-2 sm:px-0"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {/* Category Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-200/60 pb-6">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="bg-gradient-to-br from-dark to-dark-200 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl shadow-dark/10 ring-1 ring-white/10 shrink-0">
                      <ActiveCategoryIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark tracking-tight">{activeCategoryData.title}</h2>
                      <p className="text-dark-400 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">Professional {activeCategoryData.title.toLowerCase()} services for your business.</p>
                    </div>
                  </div>
                </motion.div>
                
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-3xl border border-slate-200/60" />
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {activeCategoryData.services.map((service) => (
                      <motion.div 
                        variants={itemVariants}
                        key={service} 
                        className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col hover:border-brand/50 hover:shadow-2xl hover:shadow-brand/5 transition-all duration-500 group relative"
                      >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-lightest/80 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="p-5 sm:p-8 flex-grow relative z-10">
                          {/* Compact mobile layout, vertical desktop layout */}
                          <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0 mb-4 sm:mb-8">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand group-hover:border-brand group-hover:text-dark transition-all duration-300 text-dark-400 shadow-sm sm:mb-6">
                              <ActiveCategoryIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <h3 className="font-bold text-base sm:text-lg md:text-xl text-dark group-hover:text-brand-hover transition-colors leading-tight">{service}</h3>
                          </div>
                          
                          <p className="text-dark-400 text-xs sm:text-sm leading-relaxed">{getServiceDescription(service)}</p>
                        </div>
                        
                        <div className="px-5 pb-5 pt-1 sm:px-8 sm:pb-8 sm:pt-2 relative z-10 mt-auto">
                          <Link to={`/services/${activeCategoryData.slug}/${generateSlug(service)}`} className="inline-flex items-center gap-2 text-dark font-bold hover:text-brand transition-colors group/link text-xs sm:text-sm">
                            View Details 
                            <span className="bg-slate-100 p-1.5 rounded-full group-hover/link:bg-brand group-hover/link:text-dark transition-colors">
                              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/link:translate-x-0.5 transition-transform" />
                            </span>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
