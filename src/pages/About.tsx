import { motion } from 'framer-motion';
import { Target, Users, Landmark, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function About() {
  const stats = [
    { label: 'Happy Clients', value: '10,000+' },
    { label: 'Services Offered', value: '150+' },
    { label: 'Expert Partners', value: '500+' },
    { label: 'Cities Covered', value: '100+' },
  ];

  const values = [
    { title: 'Transparency', desc: 'No hidden costs, no surprises. We believe in complete clarity throughout the process.', icon: Target },
    { title: 'Expertise', desc: 'Our team consists of senior CA, CS, and legal experts with decades of combined experience.', icon: Award },
    { title: 'Customer First', desc: 'We measure our success by your growth. Your business compliance is our priority.', icon: Users },
    { title: 'Innovation', desc: 'We leverage cutting-edge technology to make complex legal processes simple and fast.', icon: Landmark },
  ];

  return (
    <div className="bg-white">
      <Helmet>
        <title>About Us | Deccan Filings - Our Mission & Team</title>
        <meta name="description" content="Learn about Deccan Filings, India's leading cloud-based business services platform. Our mission is to empower entrepreneurs through technology and expertise." />
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-24 bg-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Empowering India's Entrepreneurs
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Deccan Filings is your one-stop partner for business registration, legal compliance, and taxation services in India.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-dark mb-2">{stat.value}</p>
                <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-8">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                To simplify legal and regulatory complexities for startups and established businesses, allowing them to focus entirely on their core growth and innovation.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                We bridge the gap between complex government regulations and business operational reality by providing professional assistance at every step of the entrepreneurial journey.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <v.icon className="h-8 w-8 text-brand mb-4" />
                  <h3 className="font-bold text-dark mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Structure */}
      <section className="py-16">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-dark mb-6">Corporate Structure</h2>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              Deccan Filings is a prominent business compliance platform and a brand wholly owned, managed, and operated by <strong className="text-dark">TOR BUSINESS SOLUTIONS PRIVATE LIMITED</strong> (CIN: U74909TS2023PTC173678). All legal, financial, and contractual obligations are executed under our registered parent entity.
            </p>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-dark mb-8">Ready to start your business journey?</h2>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-dark text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-dark-200 transition-all hover:scale-105"
          >
            Get Started Today <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
