import { Link, useLocation } from 'react-router-dom';
import { Building2, ArrowRight, FileText, Briefcase, CheckCircle, Globe, Scale, BookOpen, Calculator, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { serviceCategories, generateSlug } from '../data/services';
import { useState, useEffect } from 'react';

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
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function ServicesCatalog() {
  const [activeCategory, setActiveCategory] = useState(serviceCategories[0]?.slug || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const scrollToCategory = (slug: string) => {
    setActiveCategory(slug);
    const element = document.getElementById(slug);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (!loading && location.hash) {
      const slug = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        scrollToCategory(slug);
      }, 150); // slight delay to ensure DOM paint is complete
      return () => clearTimeout(timer);
    }
  }, [loading, location.hash]);

  return (
    <div className="bg-background min-h-screen py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/20 rounded-full blur-[100px] -z-10"></div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/60 text-dark text-sm font-bold mb-8 shadow-sm backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
            Comprehensive Solutions
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-dark mb-6 tracking-tight">
            Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark to-dark-400">Catalogue</span>
          </h1>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto leading-relaxed">
            Explore our comprehensive range of compliance, registration, and legal services tailored for your business needs.
          </p>
        </motion.div>

        {/* Sticky category filter tabs bar */}
        <div className="sticky top-24 z-40 bg-surface/90 backdrop-blur-md border border-slate-200/50 rounded-2xl p-2 mb-16 shadow-soft max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none scroll-smooth">
          {serviceCategories.map((category) => (
            <button
              key={category.slug}
              onClick={() => scrollToCategory(category.slug)}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 capitalize whitespace-nowrap cursor-pointer ${
                activeCategory === category.slug 
                  ? 'bg-dark text-white shadow-md' 
                  : 'text-slate-500 hover:text-dark hover:bg-surface-hover/80'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        {serviceCategories.map((category, idx) => {
          const Icon = categoryIcons[category.title] || FileText;
          
          return (
            <motion.div 
              key={category.slug} 
              id={category.slug} 
              className="mb-24 scroll-mt-32"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-slate-200/60 pb-6">
                <div className="flex items-center gap-5">
                  <div className="bg-gradient-to-br from-dark to-dark-200 text-white p-4 rounded-2xl shadow-xl shadow-dark/10 ring-1 ring-white/10">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">{category.title}</h2>
                    <p className="text-dark-400 mt-2 text-lg">Professional {category.title.toLowerCase()} services for your business.</p>
                  </div>
                </div>
              </motion.div>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl border border-slate-200/60" />
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {category.services.map((service) => (
                    <motion.div 
                      variants={itemVariants}
                      key={service} 
                      className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col hover:border-brand/50 hover:shadow-2xl hover:shadow-brand/5 transition-all duration-500 group relative"
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-lightest/80 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="p-8 flex-grow relative z-10">
                        <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand group-hover:border-brand group-hover:text-dark transition-all duration-300 text-dark-400 shadow-sm">
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-dark group-hover:text-brand-hover transition-colors leading-tight">{service}</h3>
                        <p className="text-dark-400 text-sm leading-relaxed">{getServiceDescription(service)}</p>
                      </div>
                      <div className="px-8 pb-8 pt-2 relative z-10 mt-auto">
                        <Link to={`/services/${category.slug}/${generateSlug(service)}`} className="inline-flex items-center gap-2 text-dark font-bold hover:text-brand transition-colors group/link">
                          View Details 
                          <span className="bg-slate-100 p-1.5 rounded-full group-hover/link:bg-brand group-hover/link:text-dark transition-colors">
                            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
                          </span>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}

      </div>
    </div>
  );
}
