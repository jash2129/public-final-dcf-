import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, MessageSquare, Search, Phone, User, ChevronRight, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { serviceCategories, generateSlug } from '../../data/services';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleMobileNavClick = (categoryTitle: string) => {
    setActiveMobileCategory(activeMobileCategory === categoryTitle ? null : categoryTitle);
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { name: string; category: string; slug: string; catSlug: string }[] = [];
    
    serviceCategories.forEach(cat => {
      cat.services.forEach(srv => {
        if (srv.toLowerCase().includes(query)) {
          results.push({
            name: srv,
            category: cat.title,
            slug: generateSlug(srv),
            catSlug: cat.slug
          });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(`/services/${searchResults[0].catSlug}/${searchResults[0].slug}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (searchQuery.trim()) {
      navigate('/services');
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navCategories = serviceCategories;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-dark overflow-x-hidden">
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark/80 backdrop-blur-sm flex flex-col pt-20 px-4"
          >
            <div className="absolute top-6 right-6">
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="max-w-3xl w-full mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services..." 
                  className="w-full bg-white rounded-2xl py-6 pl-20 pr-6 text-2xl text-dark placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand shadow-2xl"
                />
              </form>

              {searchQuery.trim().length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                  {searchResults.length > 0 ? (
                    <div className="py-2 max-h-[60vh] overflow-y-auto overscroll-contain">
                      {searchResults.map((result, idx) => (
                        <Link 
                          key={idx}
                          to={`/services/${result.catSlug}/${result.slug}`}
                          className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <div>
                            <div className="text-lg font-bold text-dark group-hover:text-secondary transition-colors">{result.name}</div>
                            <div className="text-sm text-dark-400">{result.category}</div>
                          </div>
                          <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-secondary transition-colors" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-dark-400">
                      <p className="text-lg">No services found matching "{searchQuery}".</p>
                      <Link 
                        to="/services" 
                        className="text-secondary hover:underline font-bold mt-4 inline-block"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        View all services
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="bg-dark-200 text-brand-lightest py-1.5 px-4 sm:px-6 lg:px-8 text-xs flex justify-between items-center hidden md:flex">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-brand" /> +91 90009 30453</span>
          <span>India's Trusted Compliance Platform</span>
        </div>
        <div className="flex gap-4">
          <Link to="/tools/compliance-calendar" className="hover:text-brand transition-colors">Compliance Calendar</Link>
          <Link to="/blog" className="hover:text-brand transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-brand transition-colors">About Us</Link>
          <Link to="/contact" className="hover:text-brand transition-colors">Contact</Link>
        </div>
      </div>

      {/* Navigation */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/40 sticky top-0 z-50 shadow-sm transition-all duration-300">
        {/* Top glowing edge line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-hover/70 to-secondary/70"></div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center group flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Deccan Filings" 
                  className="h-14 lg:h-16 2xl:h-20 w-auto group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-2 h-full mx-2 2xl:mx-4">
              {navCategories.slice(0, 7).map((category, index) => (
                <div key={category.title} className="relative group h-full flex items-center">
                  <button className="flex items-center gap-1 text-dark-400 hover:text-dark font-medium px-2 2xl:px-3 py-2 text-sm rounded-full hover:bg-slate-100/80 transition-all whitespace-nowrap">
                    {category.title} 
                    {category.title === 'Finance' && (
                      <span className="relative flex h-2 w-2 ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                      </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  
                  {/* Mega Menu with Premium Glassmorphism and 3-Column Layout */}
                  <div className={`absolute top-full ${index <= 1 ? 'left-0' : index >= 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'} w-[820px] bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-3xl py-7 px-7 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-50 grid grid-cols-12 gap-6`}>
                    {/* Left Column Promo Card */}
                    <div className="col-span-4 bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 flex flex-col justify-between relative overflow-hidden group/promo">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-secondary/5 rounded-full blur-2xl"></div>
                      <div className="relative z-10">
                        <span className="text-[9px] font-black tracking-widest text-brand uppercase bg-brand/10 px-2.5 py-1 rounded-full border border-brand/20">TRENDING</span>
                        <h4 className="font-bold text-sm text-dark mt-4 leading-tight">All-in-one compliance for fast-growing startups</h4>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">Book a fast-track consultation to get your business structure right from day one.</p>
                      </div>
                      <Link to="/contact" className="inline-flex items-center gap-1.5 text-xs font-black text-dark hover:text-secondary mt-6 transition-colors group/btn relative z-10">
                        Book Consultation <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Middle and Right Column Service Items */}
                    <div className="col-span-8 flex flex-col justify-between">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                        {category.services.slice(0, 8).map((service) => (
                          <Link 
                            key={service} 
                            to={`/services/${category.slug}/${generateSlug(service)}`} 
                            className="text-xs text-slate-600 hover:text-dark hover:translate-x-1.5 transition-all flex items-start gap-2.5 group/link"
                          >
                            <div className="bg-slate-100/80 p-1 rounded-md group-hover/link:bg-brand transition-colors mt-0.5 shrink-0">
                              <ChevronRight className="h-3 w-3 text-dark shrink-0" />
                            </div>
                            <span className="leading-tight font-bold">{service}</span>
                          </Link>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100/80 flex justify-between items-center">
                        <Link to={`/services#${category.slug}`} className="text-xs font-black text-dark hover:text-secondary flex items-center gap-1.5 group/all">
                          Explore all {category.title} services <ArrowRight className="h-3.5 w-3.5 group-hover/all:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* More Dropdown */}
              {navCategories.length > 7 && (
                <div className="relative group h-full flex items-center">
                  <button className="flex items-center gap-1 text-dark-400 hover:text-dark font-medium px-2 2xl:px-3 py-2 text-sm rounded-full hover:bg-slate-100/80 transition-all">
                    More <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute top-full right-0 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl py-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-50">
                    {navCategories.slice(7).map((category) => (
                      <div key={category.title} className="relative group/sub px-2">
                        <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-dark-400 hover:text-dark hover:bg-slate-50 rounded-xl transition-all">
                          {category.title}
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </button>
                        
                        {/* Sub dropdown with slide-in transition */}
                        <div className="absolute right-full top-0 mr-1 w-64 bg-white border border-slate-200/60 shadow-2xl rounded-2xl py-4 opacity-0 pointer-events-none group-hover/sub:opacity-100 group-hover/sub:pointer-events-auto transform -translate-x-4 group-hover/sub:translate-x-0 transition-all duration-300 z-50">
                          {category.services.slice(0, 8).map((service) => (
                            <Link 
                              key={service} 
                              to={`/services/${category.slug}/${generateSlug(service)}`} 
                              className="block px-6 py-2 text-sm text-dark-400 hover:text-dark hover:bg-slate-50 transition-colors"
                            >
                              {service}
                            </Link>
                          ))}
                          <div className="mt-2 px-6 pt-2 border-t border-slate-100">
                             <Link to={`/services#${category.slug}`} className="text-xs font-bold text-secondary hover:underline">
                               View all {category.title}
                             </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 xl:gap-2.5 2xl:gap-5 flex-shrink-0">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-dark-400 hover:text-dark p-2 rounded-full hover:bg-slate-100 transition-colors" 
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link to="/login" className="flex items-center gap-1.5 text-dark-400 hover:text-dark font-medium text-[13px] 2xl:text-sm px-1 whitespace-nowrap">
                <User className="h-4 w-4" /> Login
              </Link>
              <Link to="/contact" className="bg-dark text-white px-3.5 xl:px-4 2xl:px-6 py-2.5 rounded-full font-bold text-[13px] 2xl:text-sm hover:bg-dark-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
                Talk to Expert
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center xl:hidden gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-dark-400 hover:text-secondary p-2 md:hidden"
              >
                <Search className="h-5 w-5" />
              </button>
              <button 
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  if (isMenuOpen) setTimeout(() => setActiveMobileCategory(null), 300);
                }} 
                className="text-dark-400 p-2 bg-slate-100 rounded-md"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Drill-down) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="xl:hidden bg-white border-b border-slate-200 absolute top-full left-0 w-full overflow-hidden shadow-xl"
              style={{ height: 'calc(100vh - 80px)' }}
            >
              <div 
                className="w-full h-full flex transition-transform duration-300 ease-in-out" 
                style={{ transform: activeMobileCategory ? 'translateX(-100%)' : 'translateX(0)' }}
              >
                
                {/* Level 1: Categories */}
                <div className="w-full h-full flex-shrink-0 overflow-y-auto px-4 py-2 bg-white">
                  <div className="space-y-1">
                    {serviceCategories.map((category) => (
                      <div key={category.title} className="border-b border-slate-100 last:border-0">
                        <button 
                          onClick={() => setActiveMobileCategory(category.title)}
                          className="w-full flex items-center justify-between py-4 text-base font-bold text-dark"
                        >
                          <span className="flex items-center gap-2">
                            {category.title}
                            {category.title === 'Finance' && (
                              <span className="bg-brand text-dark text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">New</span>
                            )}
                          </span>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </button>
                      </div>
                    ))}
                    <div className="border-b border-slate-100">
                      <Link 
                        to="/tools/compliance-calendar" 
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-between py-4 text-base font-bold text-secondary"
                      >
                        <span className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5" />
                          Compliance Calendar 2026
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                  <div className="pt-8 pb-24 flex flex-col gap-3">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full flex items-center justify-center gap-2 border border-slate-300 text-dark px-4 py-3.5 rounded-xl font-bold">
                      <User className="h-5 w-5" /> Login
                    </Link>
                    <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-brand text-dark px-4 py-3.5 rounded-xl font-bold">
                      Talk to Expert
                    </Link>
                  </div>
                </div>

                {/* Level 2: Services */}
                <div className="w-full h-full flex-shrink-0 overflow-y-auto bg-slate-50 flex flex-col">
                  <div className="sticky top-0 bg-white px-4 py-4 border-b border-slate-200 flex items-center gap-3 shadow-sm z-10">
                    <button 
                      onClick={() => setActiveMobileCategory(null)}
                      className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <ChevronRight className="h-6 w-6 text-dark rotate-180" />
                    </button>
                    <h3 className="font-bold text-lg text-dark">{activeMobileCategory}</h3>
                  </div>
                  
                  <div className="px-4 py-2 pb-24 flex-grow">
                    {serviceCategories.map(category => (
                      <div key={category.title} className={activeMobileCategory === category.title ? 'block' : 'hidden'}>
                        {category.services.map((service) => (
                          <Link 
                            key={service}
                            to={`/services/${category.slug}/${generateSlug(service)}`}
                            className="block text-base font-medium text-dark-400 hover:text-secondary py-3.5 border-b border-slate-200/50 last:border-0"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setTimeout(() => setActiveMobileCategory(null), 300);
                            }}
                          >
                            {service}
                          </Link>
                        ))}
                        <Link 
                          to={`/services#${category.slug}`}
                          className="block text-base font-bold text-secondary py-4 mt-2"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setTimeout(() => setActiveMobileCategory(null), 300);
                          }}
                        >
                          View all {category.title} services &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer Redesign with premium dark gradient and underline hovers */}
      <footer className="bg-gradient-to-b from-dark via-dark-100 to-black text-slate-300 pt-16 pb-8 border-t border-brand/10 relative overflow-hidden">
        {/* Glowing bottom accent line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand/20 to-transparent"></div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2 pr-8">
              <div className="inline-flex items-center mb-6 bg-white p-3.5 rounded-2xl shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="Deccan Filings" 
                  className="h-12 w-auto object-contain" 
                />
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Deccan Filings is India's largest cloud-based business services platform dedicated to helping Entrepreneurs easily start and grow their business, at an affordable cost.
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                <p className="flex items-center gap-2 flex-wrap">
                  <Phone className="h-4 w-4 text-brand" />
                  <a href="tel:+919000930453" className="hover:text-brand transition-colors">+91 90009 30453</a>
                  <span className="text-slate-600">/</span>
                  <a href="tel:+919000243270" className="hover:text-brand transition-colors">+91 90002 43270</a>
                </p>
                <p className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-brand" />
                  <a href="mailto:support@deccanfilings.com" className="hover:text-brand transition-colors">
                    support@deccanfilings.com
                  </a>
                </p>
              </div>
            </div>
            
            {/* Footer Links */}
            {serviceCategories.slice(0, 5).map((category) => (
              <div key={category.title}>
                <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">{category.title}</h3>
                <ul className="space-y-2.5 text-sm">
                  {category.services.slice(0, 6).map(service => (
                    <li key={service}>
                      <Link 
                        to={`/services/${category.slug}/${generateSlug(service)}`} 
                        className="text-slate-400 hover:text-brand transition-colors relative py-0.5 inline-block after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 hover:after:scale-x-100"
                      >
                        {service}
                      </Link>
                    </li>
                  ))}
                  {category.services.length > 6 && (
                    <li>
                      <Link to={`/services#${category.slug}`} className="text-secondary hover:text-secondary-hover font-bold inline-block">
                        View all &rarr;
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-800/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div className="text-center md:text-left space-y-1">
              <p>© 2026 Deccan Filings. All rights reserved.</p>
              <p>Deccan Filings is a brand owned and operated by <strong className="text-white">TOR BUSINESS SOLUTIONS PRIVATE LIMITED.</strong></p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { name: 'Blog', path: '/blog' },
                { name: 'Careers', path: '/careers' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Refund Policy', path: '/refund' }
              ].map(link => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className="hover:text-white transition-colors relative py-0.5 inline-block after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Contact CTA (Mobile Only) */}
      <div className="fixed bottom-0 left-0 w-full p-4 md:hidden z-40 bg-gradient-to-t from-white via-white/90 to-transparent pb-safe">
         <div className="glass shadow-premium rounded-2xl p-2 flex gap-2">
           <a href="tel:+919000930453" className="flex-1 bg-dark text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all">
             <Phone className="h-3.5 w-3.5 text-brand" /> Call Expert
           </a>
           <Link to="/register" className="flex-1 bg-brand text-dark py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
             Get Started &rarr;
           </Link>
         </div>
      </div>

      {/* Floating Chatbot Widget Mock with micro-animations & hover status (Desktop) */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50 group">
        <span className="absolute -top-12 right-0 bg-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-premium whitespace-nowrap border border-white/10 pointer-events-none">
          Chat with CA/CS Expert
        </span>
        <button 
          onClick={() => navigate('/contact')}
          className="relative flex bg-brand-lightest text-dark p-4 rounded-full shadow-xl hover:bg-brand-light hover:scale-105 active:scale-95 transition-all items-center justify-center cursor-pointer"
        >
          <span className="absolute inset-0 rounded-full bg-brand-lightest opacity-30 animate-ping"></span>
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow-sm">1</span>
          <MessageSquare className="h-6 w-6 relative z-10" />
        </button>
      </div>
    </div>
  );
}
