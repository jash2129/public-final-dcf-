import React from 'react';
import { Link } from 'react-router-dom';
import { Building, FileText, Briefcase, CheckCircle, Star, ArrowRight, Shield, Clock, Users, Quote, ChevronRight, Calculator, Building2, ShieldCheck, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { serviceCategories, generateSlug } from '../data/services';

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

const popularServices = [
  { name: "ITR Filing", price: "999", icon: FileText, desc: "Expert assisted income tax return filing" },
  { name: "GST Registration", price: "2,999", icon: Calculator, desc: "Complete GST registration and compliance" },
  { name: "Partnership Firm", price: "5,999", icon: Users, desc: "Quick and compliant partnership registration" },
  { name: "Private Limited Company", price: "14,999", icon: Building2, desc: "End-to-end Pvt Ltd incorporation" },
  { name: "Trademark Registration", price: "9,499", icon: ShieldCheck, desc: "Protect your brand identity legally" },
  { name: "FSSAI License", price: "3,499", icon: Utensils, desc: "Food safety license for your business" }
];

export default function HomeBelowFold() {
  return (
    <>
      {/* Trusted By Banner */}
      <section className="bg-white border-b border-slate-100 py-8 relative z-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by 1000+ Fast-Growing Companies</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder logos using text for now */}
            <div className="text-2xl font-bold font-display">JSW Steel</div>
            <div className="text-2xl font-bold font-display">Aurobindo</div>
            <div className="text-2xl font-bold font-display">Dr.Reddys</div>
            <div className="text-2xl font-bold font-display">Velary Labs</div>
            <div className="text-2xl font-bold font-display hidden md:block">Wellsfargo</div>
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
              <Link to="/services#startup-registrations" className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full relative overflow-hidden btn-tap">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full group-hover:bg-brand/10 transition-colors"></div>
                <div>
                  <div className="bg-brand-lightest w-14 h-14 rounded-xl flex items-center justify-center text-dark group-hover:bg-brand group-hover:scale-110 transition-all duration-300 mb-8">
                    <Building className="h-7 w-7" />
                  </div>
                  <h2 className="font-bold text-2xl text-dark mb-3 group-hover:text-secondary transition-colors">Business Registration</h2>
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
              <Link to="/services/gst/gst-registration" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full btn-tap">
                <div>
                  <div className="bg-brand-lightest w-14 h-14 rounded-xl flex items-center justify-center text-dark group-hover:bg-brand group-hover:scale-110 transition-all duration-300 mb-6">
                    <FileText className="h-7 w-7" />
                  </div>
                  <h2 className="font-bold text-xl text-dark mb-2 group-hover:text-secondary transition-colors">GST Compliance</h2>
                  <p className="text-dark-400 text-sm">Hassle-free GST registration & monthly return filings.</p>
                </div>
                <span className="text-xs font-black text-secondary hover:underline mt-6 inline-flex items-center gap-1">File Return &rarr;</span>
              </Link>
            </motion.div>

            {/* Bento Card 3 - Standard */}
            <motion.div variants={fadeInUp} className="col-span-1">
              <Link to="/services#mca" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full btn-tap">
                <div>
                  <div className="bg-brand-lightest w-14 h-14 rounded-xl flex items-center justify-center text-dark group-hover:bg-brand group-hover:scale-110 transition-all duration-300 mb-6">
                    <Briefcase className="h-7 w-7" />
                  </div>
                  <h2 className="font-bold text-xl text-dark mb-2 group-hover:text-secondary transition-colors">MCA Compliance</h2>
                  <p className="text-dark-400 text-sm">Maintain Roc compliance, annual returns & corporate changes.</p>
                </div>
                <span className="text-xs font-black text-secondary hover:underline mt-6 inline-flex items-center gap-1">ROC Filings &rarr;</span>
              </Link>
            </motion.div>

            {/* Bento Card 4 - Full Width Row */}
            <motion.div variants={fadeInUp} className="md:col-span-3 lg:col-span-4">
              <Link to="/services#income-tax" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full relative overflow-hidden btn-tap">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors -z-10"></div>
                <div className="flex items-start sm:items-center gap-6">
                  <div className="bg-brand-lightest w-14 h-14 rounded-xl flex items-center justify-center text-dark group-hover:bg-brand group-hover:scale-110 transition-all duration-300 shrink-0">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-dark mb-1 group-hover:text-secondary transition-colors">Income Tax Return Filing</h2>
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
            {serviceCategories.map((category) => (
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
            <Link to="/services" className="inline-flex items-center gap-2 bg-slate-100 text-dark px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors btn-tap">
              View All Catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-12">
            {popularServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link 
                  to="/contact" 
                  key={index}
                  className="group bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-brand hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer btn-tap"
                >
                  <div className="w-14 h-14 bg-slate-50 text-brand rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-dark transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-dark mb-2">{service.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 flex-grow">{service.desc}</p>
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Starting at</p>
                      <p className="text-xl sm:text-2xl font-black text-dark">₹{service.price}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-dark group-hover:text-brand transition-colors">
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
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
              <h2 className="font-bold text-2xl mb-4 text-dark">Bank-Grade Security</h2>
              <p className="text-dark-400 text-lg">Your data and documents are encrypted and stored securely.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center p-10 bg-white rounded-3xl shadow-sm border border-brand-light">
              <div className="bg-brand-lightest p-4 rounded-2xl mb-6">
                <Clock className="h-10 w-10 text-dark" />
              </div>
              <h2 className="font-bold text-2xl mb-4 text-dark">Fastest Turnaround</h2>
              <p className="text-dark-400 text-lg">Streamlined processes ensure quick filing and approvals.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center p-10 bg-white rounded-3xl shadow-sm border border-brand-light">
              <div className="bg-brand-lightest p-4 rounded-2xl mb-6">
                <Users className="h-10 w-10 text-dark" />
              </div>
              <h2 className="font-bold text-2xl mb-4 text-dark">Dedicated Support</h2>
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
    
    </>
  );
}
