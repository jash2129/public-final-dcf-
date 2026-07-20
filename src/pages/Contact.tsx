import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
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
      <SEO 
        title="Contact Us - Get Expert Consultation" 
        description="Have questions? Contact Deccan Filings today. Get free expert consultation for company registration, GST, and business compliance in India." 
      />
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
                    <div className="flex flex-col gap-1">
                      <a
                        href="tel:+919000930453"
                        className="text-dark font-bold leading-relaxed hover:text-secondary transition-colors cursor-pointer btn-tap"
                      >
                        +91 90009 30453
                      </a>
                      <a
                        href="tel:+919000243270"
                        className="text-dark font-bold leading-relaxed hover:text-secondary transition-colors cursor-pointer btn-tap"
                      >
                        +91 90002 43270
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.42 1.451 5.302 1.453 5.485.002 9.948-4.461 9.952-9.953.002-2.661-1.034-5.163-2.915-7.046C17.106 1.77 14.604.735 11.944.735c-5.49 0-9.957 4.463-9.961 9.955-.001 1.93.499 3.81 1.453 5.419L2.465 20.8l4.182-1.646zm13.438-6.303c-.267-.134-1.58-.78-1.82-.866-.239-.087-.412-.13-.587.135-.176.265-.678.866-.83 1.039-.153.174-.306.195-.573.061-.267-.134-1.127-.415-2.147-1.325-.793-.707-1.329-1.582-1.485-1.85-.156-.268-.017-.413.117-.547.12-.12.267-.312.4-.467.135-.156.18-.268.27-.447.09-.179.046-.336-.023-.47-.069-.134-.588-1.42-.806-1.947-.212-.512-.446-.442-.609-.45-.16-.009-.344-.01-.528-.01-.184 0-.485.07-.74.349-.253.28-1.042 1.02-1.042 2.485 0 1.464 1.065 2.88 1.212 3.081.148.201 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.58-.646 1.8-1.238.22-.593.22-1.102.154-1.207-.066-.105-.24-.167-.507-.3z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/919000930453"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark font-bold leading-relaxed hover:text-emerald-600 transition-colors block cursor-pointer btn-tap"
                    >
                      +91 90009 30453
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="bg-brand-lightest p-4 rounded-2xl text-dark shrink-0 group-hover:bg-brand transition-colors duration-300">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">Email</h3>
                    <a
                      href="mailto:hr@deccanfilings.com"
                      className="text-dark font-bold leading-relaxed hover:text-secondary transition-colors block cursor-pointer btn-tap"
                    >
                      hr@deccanfilings.com
                    </a>
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
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={inputClass}
                      placeholder="+91 90009 30453"
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
                  className="w-full bg-dark text-white px-4 py-4 rounded-xl font-bold text-lg hover:bg-dark-200 transition-all mt-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 btn-tap"
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
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-md z-10 border border-slate-200/60 max-w-[200px] hidden sm:block">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-brand relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                </span>
                <h3 className="font-black text-dark text-xs">Tor Business Solutions</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">Visit our office for an in-person compliance consultation with senior CA experts.</p>
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
