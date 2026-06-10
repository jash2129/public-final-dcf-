import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { serviceCategories } from '../data/services';

interface FormData {
  name: string;
  mobile: string;
  email: string;
  category: string;
  service: string;
  address: string;
}

const initialForm: FormData = {
  name: '',
  mobile: '',
  email: '',
  category: '',
  service: '',
  address: '',
};

export default function Contact() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedCategory = serviceCategories.find(c => c.title === form.category);
  const availableServices = selectedCategory?.services ?? [];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      // Reset service when category changes
      ...(name === 'category' ? { service: '' } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setForm(initialForm);
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong. Please try again.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  }

  const selectClass = "w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white outline-none transition-all font-medium text-dark appearance-none";
  const inputClass = "w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white outline-none transition-all font-medium text-dark";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <Helmet>
        <title>Contact Us | Deccan Filings - Get Expert Consultation</title>
        <meta name="description" content="Have questions? Contact Deccan Filings today. Get free expert consultation for company registration, GST, and business compliance in India." />
      </Helmet>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-lightest rounded-full blur-3xl -z-10 opacity-60" />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-dark text-sm font-bold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-brand" />
            We're Here to Help
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark mb-6 tracking-tight">Contact Us</h1>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto leading-relaxed">
            Get in touch with our experts for any queries related to business registration, compliance, and legal services.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Office Info */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-bl-full opacity-50 blur-xl" />
              <h2 className="text-3xl font-bold text-dark mb-8 relative z-10">Our Office</h2>

              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-5 group">
                  <div className="bg-brand-lightest p-4 rounded-2xl text-dark shrink-0 group-hover:bg-brand transition-colors duration-300">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">Address</h3>
                    <p className="text-dark font-bold leading-relaxed">
                      Tor Business Solutions Private Limited<br />
                      Hyderabad, Telangana, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="bg-brand-lightest p-4 rounded-2xl text-dark shrink-0 group-hover:bg-brand transition-colors duration-300">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">Phone</h3>
                    <p className="text-dark font-bold leading-relaxed hover:text-secondary transition-colors cursor-pointer">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="bg-brand-lightest p-4 rounded-2xl text-dark shrink-0 group-hover:bg-brand transition-colors duration-300">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">Email</h3>
                    <p className="text-dark font-bold leading-relaxed hover:text-secondary transition-colors cursor-pointer">hr@deccanfilings.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="bg-brand-lightest p-4 rounded-2xl text-dark shrink-0 group-hover:bg-brand transition-colors duration-300">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">Business Hours</h3>
                    <p className="text-dark font-bold leading-relaxed">Monday - Saturday: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <section className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/50">
              <h2 className="text-2xl font-bold text-dark mb-6">Send a Message</h2>

              {/* Status Banner */}
              {status && (
                <div
                  role="alert"
                  className={`flex items-start gap-3 p-4 rounded-xl mb-6 text-sm font-medium ${
                    status.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {status.type === 'success'
                    ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
                  {status.message}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className={labelClass}>Name <span className="text-red-400">*</span></label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    className={inputClass}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Mobile + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-mobile" className={labelClass}>Mobile Number <span className="text-red-400">*</span></label>
                    <input
                      id="contact-mobile"
                      name="mobile"
                      type="tel"
                      className={inputClass}
                      placeholder="+91 98765 43210"
                      value={form.mobile}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={labelClass}>Email <span className="text-red-400">*</span></label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className={inputClass}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="contact-category" className={labelClass}>Category <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select
                      id="contact-category"
                      name="category"
                      className={selectClass}
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">— Select a category —</option>
                      {serviceCategories
                        .filter(cat => cat.title !== 'More Services')
                        .map(cat => (
                          <option key={cat.slug} value={cat.title}>{cat.title}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Service (conditional on category) */}
                {form.category && (
                  <div>
                    <label htmlFor="contact-service" className={labelClass}>Service</label>
                    <div className="relative">
                      <select
                        id="contact-service"
                        name="service"
                        className={selectClass}
                        value={form.service}
                        onChange={handleChange}
                      >
                        <option value="">— Select a service (optional) —</option>
                        {availableServices.map(svc => (
                          <option key={svc} value={svc}>{svc}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Address */}
                <div>
                  <label htmlFor="contact-address" className={labelClass}>Address <span className="text-red-400">*</span></label>
                  <textarea
                    id="contact-address"
                    name="address"
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Your business / mailing address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  id="contact-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-dark text-white px-4 py-4 rounded-xl font-bold text-lg hover:bg-dark-200 transition-all mt-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Map */}
          <div className="bg-slate-100 p-2.5 rounded-3xl shadow-xl border border-slate-200/60 h-full min-h-[500px] lg:min-h-0 relative group">
            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg z-10 border border-slate-200/60 max-w-xs hidden sm:block">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-brand relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                </span>
                <h3 className="font-black text-dark text-sm">Tor Business Solutions</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">Visit our office for an in-person compliance consultation with senior CA experts.</p>
            </div>
            <iframe
              title="Deccan Filings Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.3802166980095!2d78.44703249999999!3d17.441506699999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb911c9bbaf111%3A0x1c88fe8f0dd41d08!2sTor%20Business%20Solutions%20Private%20Limited!5e0!3m2!1sen!2sin!4v1775744514950!5m2!1sen!2sin"
              className="w-full h-full rounded-2xl"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
