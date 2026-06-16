import { Link, useNavigate } from 'react-router-dom';
import { Search, Building, FileText, Briefcase, CheckCircle, Star, ArrowRight, Shield, Clock, Users, Quote, ChevronRight, Play } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { serviceCategories, generateSlug } from '../data/services';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [activeFilingIndex, setActiveFilingIndex] = useState(0);
  const [filingProgress, setFilingProgress] = useState(65);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setFilingProgress((prev) => {
        if (prev >= 100) {
          setActiveFilingIndex((idx) => (idx + 1) % 3);
          return 15;
        }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    return results.slice(0, 6);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(`/services/${searchResults[0].catSlug}/${searchResults[0].slug}`);
    } else if (searchQuery.trim()) {
      navigate('/services');
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="overflow-hidden">
      <Helmet>
        <title>Deccan Filings | India's Trusted Compliance Platform</title>
        <meta name="description" content="Start and grow your business in India with Deccan Filings. Expert assistance for Company Registration, GST, Trademark, and more. 100% online process." />
        <meta property="og:title" content="Deccan Filings | Start & Grow Your Business" />
        <meta property="og:description" content="India's leading cloud-based business services platform. Expert CA/CS assistance for all your compliance needs." />
      </Helmet>
      {/* Hero Section */}
      <section className="bg-dark text-white pt-28 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract background pattern with pulse-glow animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand/25 blur-3xl animate-pulse-glow"></div>
          <div className="absolute top-[45%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-3xl animate-pulse-glow animate-float-delayed"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHoiLz48L2c+PC9zdmc+')] opacity-20"></div>
        </div>
        
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column - Hero Content & Search */}
          <div className="lg:col-span-7 text-left space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse"></span>
              India's #1 Compliance Platform
            </motion.div>
            
            <motion.h1 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1]"
            >
              Start & Grow Your Business <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Without the Hassle</span>
            </motion.h1>
            
            <motion.p 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-lg md:text-xl text-slate-300 font-light max-w-2xl leading-relaxed"
            >
              Expert CA/CS assistance, 100% online process, and transparent pricing. Join 100,000+ founders who trust Deccan Filings.
            </motion.p>
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="relative max-w-2xl"
              ref={searchContainerRef}
            >
              <form 
                onSubmit={handleSearchSubmit}
                className={`bg-white/10 backdrop-blur-xl border ${isSearchFocused ? 'border-brand' : 'border-white/20'} rounded-2xl p-2 flex flex-col sm:flex-row items-center shadow-2xl transition-colors`}
              >
                <Search className={`h-6 w-6 ml-4 shrink-0 hidden sm:block ${isSearchFocused ? 'text-brand' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  placeholder="Search for services (e.g. GST Registration, Trademark...)" 
                  className="flex-1 px-4 py-3.5 text-white placeholder-slate-400 bg-transparent focus:outline-none text-base w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                />
                <button type="submit" className="w-full sm:w-auto bg-brand text-dark px-8 py-3.5 rounded-xl font-bold hover:bg-brand-hover transition-all shrink-0 shadow-[0_0_20px_rgba(229,255,143,0.3)] hover:shadow-[0_0_30px_rgba(229,255,143,0.5)] cursor-pointer text-sm">
                  Search Services
                </button>
              </form>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim().length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-left"
                  >
                    {searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((result, idx) => (
                          <Link 
                            key={idx}
                            to={`/services/${result.catSlug}/${result.slug}`}
                            className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors group"
                            onClick={() => setIsSearchFocused(false)}
                          >
                            <div>
                              <div className="text-dark font-bold group-hover:text-secondary transition-colors">{result.name}</div>
                              <div className="text-sm text-dark-400">{result.category}</div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-secondary transition-colors" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-dark-400">
                        No services found matching "{searchQuery}". <br/>
                        <Link to="/services" className="text-secondary hover:underline font-bold mt-2 inline-block" onClick={() => setIsSearchFocused(false)}>View all services</Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-400 font-bold uppercase tracking-wider"
            >
              <span className="text-slate-500">Trending:</span>
              <Link to="/services/startup-registrations/private-limited-company-registration" className="hover:text-brand transition-colors">Private Limited Company</Link>
              <Link to="/services/gst/gst-registration" className="hover:text-brand transition-colors">GST Registration</Link>
              <Link to="/services/trademark/trademark-registration-indian" className="hover:text-brand transition-colors">Trademark</Link>
            </motion.div>
          </div>

          {/* Right Column - Premium Glassmorphic Live Preview Card */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-float"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80"></div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono ml-2">portal.deccanfilings.com</span>
                </div>
                <span className="text-[9px] font-bold text-brand uppercase bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full tracking-widest animate-pulse">LIVE TRACKING</span>
              </div>

              {/* Progress Tracker Graphic */}
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">GST Registration #DCF-2940</span>
                    <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2.5 py-0.5 rounded-full border border-green-400/20">Approved</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-slate-400">CA verification & GSTIN certificate uploaded successfully.</p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">
                      {activeFilingIndex === 0 ? "Trademark Application" : activeFilingIndex === 1 ? "LLP Incorporation" : "FSSAI License Filing"}
                    </span>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2.5 py-0.5 rounded-full border border-blue-400/20 animate-pulse">
                      {filingProgress < 40 ? "Uploading" : filingProgress < 85 ? "Processing" : "Signing"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${filingProgress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 h-8">
                    {activeFilingIndex === 0 && `Uploading brand mark files... (${filingProgress}%)`}
                    {activeFilingIndex === 1 && `Verifying Spice+ Part B documents... (${filingProgress}%)`}
                    {activeFilingIndex === 2 && `Submitting authority declarations... (${filingProgress}%)`}
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-brand/10 rounded-xl border border-brand/20 flex items-center justify-center">
                      <FileText className="h-4.5 w-4.5 text-brand" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">Certificate of Incorporation</p>
                      <p className="text-[9px] text-slate-500">COI_PvtLtd_2026.pdf</p>
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-[10px] font-bold transition-all">
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Glowing blur ball behind card */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/30 rounded-full blur-2xl -z-10 animate-pulse-glow"></div>
          </div>
        </div>
      </section>

      {/* Trusted By Banner */}
      <section className="bg-white border-b border-slate-100 py-8 relative z-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by 10,000+ Fast-Growing Companies</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder logos using text for now */}
            <div className="text-2xl font-bold font-display">Acme Corp</div>
            <div className="text-2xl font-bold font-display">GlobalTech</div>
            <div className="text-2xl font-bold font-display">Nexus</div>
            <div className="text-2xl font-bold font-display">Stark Ind.</div>
            <div className="text-2xl font-bold font-display hidden md:block">Wayne Ent.</div>
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {/* Bento Card 1 - Double Width */}
            <motion.div variants={fadeInUp} className="md:col-span-2 lg:col-span-2">
              <Link to="/services#startup-registrations" className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full group-hover:bg-brand/10 transition-colors"></div>
                <div>
                  <div className="bg-brand-lightest w-14 h-14 rounded-xl flex items-center justify-center text-dark group-hover:bg-brand group-hover:scale-110 transition-all duration-300 mb-8">
                    <Building className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-2xl text-dark mb-3 group-hover:text-secondary transition-colors">Business Registration</h3>
                  <p className="text-dark-400 text-sm max-w-md mb-6">Incorporate your venture quickly with end-to-end guidance. We handle Pvt Ltd, LLP, OPC, and Partner Firms.</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Pvt Ltd', 'LLP', 'One Person Company', 'Partnership'].map((type) => (
                    <span key={type} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full">{type}</span>
                  ))}
                </div>
              </Link>
            </motion.div>

            {/* Bento Card 2 - Standard */}
            <motion.div variants={fadeInUp} className="col-span-1">
              <Link to="/services/gst/gst-registration" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full">
                <div>
                  <div className="bg-brand-lightest w-14 h-14 rounded-xl flex items-center justify-center text-dark group-hover:bg-brand group-hover:scale-110 transition-all duration-300 mb-6">
                    <FileText className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-xl text-dark mb-2 group-hover:text-secondary transition-colors">GST Compliance</h3>
                  <p className="text-dark-400 text-sm">Hassle-free GST registration & monthly return filings.</p>
                </div>
                <span className="text-xs font-black text-secondary hover:underline mt-6 inline-flex items-center gap-1">File Return &rarr;</span>
              </Link>
            </motion.div>

            {/* Bento Card 3 - Standard */}
            <motion.div variants={fadeInUp} className="col-span-1">
              <Link to="/services#mca" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full">
                <div>
                  <div className="bg-brand-lightest w-14 h-14 rounded-xl flex items-center justify-center text-dark group-hover:bg-brand group-hover:scale-110 transition-all duration-300 mb-6">
                    <Briefcase className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-xl text-dark mb-2 group-hover:text-secondary transition-colors">MCA Compliance</h3>
                  <p className="text-dark-400 text-sm">Maintain Roc compliance, annual returns & corporate changes.</p>
                </div>
                <span className="text-xs font-black text-secondary hover:underline mt-6 inline-flex items-center gap-1">ROC Filings &rarr;</span>
              </Link>
            </motion.div>

            {/* Bento Card 4 - Full Width Row */}
            <motion.div variants={fadeInUp} className="md:col-span-3 lg:col-span-4">
              <Link to="/services#income-tax" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors -z-10"></div>
                <div className="flex items-start sm:items-center gap-6">
                  <div className="bg-brand-lightest w-14 h-14 rounded-xl flex items-center justify-center text-dark group-hover:bg-brand group-hover:scale-110 transition-all duration-300 shrink-0">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-dark mb-1 group-hover:text-secondary transition-colors">Income Tax Return Filing</h3>
                    <p className="text-dark-400 text-sm max-w-xl">Accurate and compliant ITR filing for individuals, salaried employees, freelancers, and businesses. Maximize your tax savings with CA review.</p>
                  </div>
                </div>
                <div className="bg-dark text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-dark-200 shrink-0 transition-colors shadow-md">
                  File ITR Now
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100"
          >
            <motion.div variants={fadeInUp}>
              <div className="text-4xl md:text-5xl font-bold text-dark mb-2 tracking-tight">1L+</div>
              <div className="text-dark-400 font-medium text-lg">Happy Clients</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl md:text-5xl font-bold text-dark mb-2 tracking-tight">100+</div>
              <div className="text-dark-400 font-medium text-lg">Services Offered</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl md:text-5xl font-bold text-dark mb-2 tracking-tight">300+</div>
              <div className="text-dark-400 font-medium text-lg">Expert Professionals</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl md:text-5xl font-bold text-dark mb-2 tracking-tight flex items-center justify-center gap-2">
                4.8 <Star className="h-8 w-8 fill-current text-brand" />
              </div>
              <div className="text-dark-400 font-medium text-lg">Google Rating</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Top Service Categories Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-dark mb-6"
            >
              Explore Our Services
            </motion.h2>
            <motion.p 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-xl text-dark-400 max-w-2xl mx-auto"
            >
              Comprehensive legal, tax, and compliance solutions for your business.
            </motion.p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {serviceCategories.slice(0, 8).map((category) => (
              <motion.div key={category.title} variants={fadeInUp} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <h3 className="font-bold text-2xl text-dark mb-6 pb-4 border-b border-slate-100">{category.title}</h3>
                <ul className="space-y-4 mb-8">
                  {category.services.slice(0, 5).map(service => (
                    <li key={service}>
                      <Link to={`/services/${category.slug}/${generateSlug(service)}`} className="text-dark-400 hover:text-dark font-medium flex items-start gap-3 group">
                        <div className="bg-slate-50 p-1 rounded-md group-hover:bg-brand transition-colors mt-0.5">
                          <ChevronRight className="h-4 w-4 text-dark shrink-0" />
                        </div>
                        <span className="leading-tight">{service}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to={`/services#${category.slug}`} className="inline-flex items-center gap-2 text-dark font-bold hover:text-secondary group">
                  View all {category.services.length} services 
                  <span className="bg-dark text-white p-1 rounded-full group-hover:bg-secondary transition-colors">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-dark mb-6">Popular Services</h2>
              <p className="text-xl text-dark-400">Most frequently requested services by our clients.</p>
            </div>
            <Link to="/services" className="inline-flex items-center gap-2 bg-slate-100 text-dark px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">
              View All Catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: 'Private Limited Company', price: '₹5,999', path: '/services/startup-registrations/private-limited-company-registration', category: 'Startup' },
              { title: 'GST Registration', price: '₹1,499', path: '/services/gst/gst-registration', category: 'Registrations' },
              { title: 'Trademark Registration', price: '₹1,999', path: '/services/trademark/trademark-registration-indian', category: 'Trademark' },
              { title: 'FSSAI License', price: '₹2,499', path: '/services/license/fssai-license-food-license-registration', category: 'Registrations' },
            ].map((service) => (
              <motion.div key={service.title} variants={fadeInUp} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-brand hover:shadow-2xl transition-all duration-300 group">
                <div className="p-8 flex-grow">
                  <div className="inline-block px-3 py-1 bg-slate-100 text-dark text-xs font-bold rounded-full mb-6">{service.category}</div>
                  <h3 className="font-bold text-2xl mb-6 text-dark group-hover:text-secondary transition-colors leading-tight">{service.title}</h3>
                  <div className="text-sm text-dark-400 mb-2">Professional fees starting at</div>
                  <div className="text-3xl font-bold text-dark">{service.price}</div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 group-hover:bg-brand-lightest transition-colors">
                  <Link to={service.path} className="flex items-center justify-between text-dark font-bold group/link">
                    Get Started 
                    <div className="bg-white p-2 rounded-full shadow-sm group-hover/link:bg-brand group-hover/link:scale-110 transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent blur-3xl rounded-full"></div>
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-20">How Deccan Filings Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] w-[68%] h-0.5 bg-white/10"></div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-brand text-dark rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-[0_0_0_8px_rgba(229,255,143,0.1)]">1</div>
              <h3 className="font-bold text-2xl mb-4">Submit Request</h3>
              <p className="text-slate-400 text-lg leading-relaxed">Select your service, fill a simple form, and upload required documents securely.</p>
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-brand text-dark rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-[0_0_0_8px_rgba(229,255,143,0.1)]">2</div>
              <h3 className="font-bold text-2xl mb-4">Expert Processing</h3>
              <p className="text-slate-400 text-lg leading-relaxed">Our dedicated CA/CS experts verify your details and file the application with authorities.</p>
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-brand text-dark rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-[0_0_0_8px_rgba(229,255,143,0.1)]">3</div>
              <h3 className="font-bold text-2xl mb-4">Get Delivered</h3>
              <p className="text-slate-400 text-lg leading-relaxed">Track progress in real-time via dashboard and receive final documents online.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 bg-brand-lightest border-b border-brand-light">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center p-10 bg-white rounded-3xl shadow-sm border border-brand-light">
              <div className="bg-brand-lightest p-4 rounded-2xl mb-6">
                <Shield className="h-10 w-10 text-dark" />
              </div>
              <h4 className="font-bold text-2xl mb-4 text-dark">Bank-Grade Security</h4>
              <p className="text-dark-400 text-lg">Your data and documents are encrypted and stored securely.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center p-10 bg-white rounded-3xl shadow-sm border border-brand-light">
              <div className="bg-brand-lightest p-4 rounded-2xl mb-6">
                <Clock className="h-10 w-10 text-dark" />
              </div>
              <h4 className="font-bold text-2xl mb-4 text-dark">Fastest Turnaround</h4>
              <p className="text-dark-400 text-lg">Streamlined processes ensure quick filing and approvals.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center p-10 bg-white rounded-3xl shadow-sm border border-brand-light">
              <div className="bg-brand-lightest p-4 rounded-2xl mb-6">
                <Users className="h-10 w-10 text-dark" />
              </div>
              <h4 className="font-bold text-2xl mb-4 text-dark">Dedicated Support</h4>
              <p className="text-dark-400 text-lg">Get a dedicated relationship manager for your business.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark mb-6">Loved by Entrepreneurs</h2>
            <p className="text-xl text-dark-400 max-w-2xl mx-auto">See what our clients have to say about their experience with Deccan Filings.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rahul Sharma', company: 'TechNova Solutions', text: 'Registering my Private Limited Company was a breeze. The team at Deccan Filings handled everything professionally and kept me updated throughout.' },
              { name: 'Priya Patel', company: 'Priya Bakes', text: 'Got my FSSAI and GST registration done within days. Their platform is very easy to use and the support team is highly responsive.' },
              { name: 'Amit Kumar', company: 'Global Exports', text: 'I use Deccan Filings for all my annual MCA compliances and GST returns. It gives me peace of mind knowing experts are handling my business.' },
            ].map((testimonial, i) => (
              <motion.div 
                key={i} 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-slate-50 p-10 rounded-3xl border border-slate-100 relative hover:shadow-xl transition-shadow"
              >
                <Quote className="h-12 w-12 text-brand absolute top-8 right-8 opacity-50" />
                <div className="flex text-brand mb-6">
                  <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-dark-400 mb-8 relative z-10 text-lg leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-dark text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-dark text-lg">{testimonial.name}</div>
                    <div className="text-sm text-dark-400">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
