import React, { useState } from 'react';
import {
  Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Users,
  TrendingUp, Shield, Coffee, Send, CheckCircle, AlertCircle,
  ChevronDown, Star, Globe, BookOpen
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  skills: string[];
}

const openPositions: Job[] = [
  {
    id: 1,
    title: 'CA / Tax Consultant',
    department: 'Taxation',
    location: 'Hyderabad',
    type: 'Full-time',
    experience: '2–5 years',
    description: 'Handle GST filings, income tax returns, and client advisory for SME and corporate clients.',
    skills: ['GST', 'ITR Filing', 'Tax Planning', 'Tally'],
  },
  {
    id: 2,
    title: 'Company Secretary (CS)',
    department: 'Compliance',
    location: 'Hyderabad',
    type: 'Full-time',
    experience: '1–4 years',
    description: 'Manage MCA filings, ROC compliance, board resolutions, and statutory registers.',
    skills: ['MCA Portal', 'ROC Filings', 'SEBI', 'Corporate Law'],
  },
  {
    id: 3,
    title: 'Business Development Executive',
    department: 'Sales',
    location: 'Hyderabad / Remote',
    type: 'Full-time',
    experience: '1–3 years',
    description: 'Drive client acquisition, manage leads, and grow revenue across our service verticals.',
    skills: ['B2B Sales', 'Lead Generation', 'CRM', 'Communication'],
  },
  {
    id: 4,
    title: 'Operations Executive',
    department: 'Operations',
    location: 'Hyderabad',
    type: 'Full-time',
    experience: '0–2 years',
    description: 'Coordinate with clients, track service delivery timelines, and ensure smooth operations.',
    skills: ['Client Coordination', 'MS Office', 'Process Management'],
  },
  {
    id: 5,
    title: 'Digital Marketing Specialist',
    department: 'Marketing',
    location: 'Hyderabad / Remote',
    type: 'Full-time',
    experience: '2–4 years',
    description: 'Run SEO, paid ads, social media campaigns and grow our digital presence.',
    skills: ['SEO', 'Google Ads', 'Meta Ads', 'Analytics'],
  },
  {
    id: 6,
    title: 'React / Full-Stack Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    experience: '2–5 years',
    description: 'Build and maintain our client-facing web platform using React, Node.js, and MySQL.',
    skills: ['React', 'Node.js', 'TypeScript', 'MySQL'],
  },
];

const benefits = [
  { icon: TrendingUp, title: 'Career Growth', description: 'Structured growth paths, mentorship, and leadership opportunities in a fast-scaling firm.' },
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health coverage for you and your family, plus wellness initiatives.' },
  { icon: Coffee, title: 'Work-Life Balance', description: 'Flexible timings, paid leave, and a culture that respects personal time.' },
  { icon: BookOpen, title: 'Learning & Development', description: 'Sponsored certifications, CA study support, and access to industry learning resources.' },
  { icon: Users, title: 'Great Culture', description: 'Diverse, inclusive team that celebrates wins together and supports each other.' },
  { icon: Zap, title: 'Competitive Compensation', description: 'Market-competitive salaries, performance bonuses, and incentive structures.' },
];

const stats = [
  { value: '50+', label: 'Team Members' },
  { value: '5000+', label: 'Clients Served' },
  { value: '10+', label: 'Service Verticals' },
  { value: '5★', label: 'Workplace Rating' },
];

interface AppForm {
  name: string;
  email: string;
  mobile: string;
  role: string;
  experience: string;
  message: string;
}

const initialApp: AppForm = { name: '', email: '', mobile: '', role: '', experience: '', message: '' };

const deptColors: Record<string, string> = {
  Taxation: 'bg-amber-100 text-amber-800',
  Compliance: 'bg-blue-100 text-blue-800',
  Sales: 'bg-green-100 text-green-800',
  Operations: 'bg-purple-100 text-purple-800',
  Marketing: 'bg-pink-100 text-pink-800',
  Engineering: 'bg-cyan-100 text-cyan-800',
};

export default function Careers() {
  const [selected, setSelected] = useState<Job | null>(null);
  const [app, setApp] = useState<AppForm>(initialApp);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setApp(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function openApply(job: Job) {
    setSelected(job);
    setApp(prev => ({ ...prev, role: job.title }));
    setStatus(null);
    setTimeout(() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: app.name,
          mobile: app.mobile,
          email: app.email,
          category: 'Career Application',
          service: app.role,
          address: `Experience: ${app.experience}\n\nMessage: ${app.message}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: 'Application submitted! Our HR team will reach out to you shortly.' });
        setApp(initialApp);
        setSelected(null);
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong. Please try again.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white outline-none transition-all font-medium text-dark";
  const labelCls = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="bg-slate-50 min-h-screen">
      <Helmet>
        <title>Careers | Deccan Filings — Join Our Team</title>
        <meta name="description" content="Join the Deccan Filings team. Explore open positions in CA/CS, operations, sales, marketing and tech at Hyderabad's leading business compliance firm." />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative bg-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #c8f135 0%, transparent 60%), radial-gradient(circle at 80% 20%, #c8f135 0%, transparent 50%)' }} />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-bold mb-8 backdrop-blur">
            <Star className="h-4 w-4 text-brand fill-brand" />
            We're Hiring — Hyderabad's #1 Compliance Firm
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Build Your Career<br />
            <span className="text-brand">With Purpose</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join Deccan Filings and help thousands of Indian businesses stay compliant, grow faster, and thrive. Work that matters, with people who care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#open-positions" className="inline-flex items-center gap-2 bg-brand text-dark px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand/90 transition-all hover:-translate-y-0.5 shadow-lg">
              View Open Positions <ArrowRight className="h-5 w-5" />
            </a>
            <a href="#apply-form" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur">
              Send Open Application
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-4xl font-black text-dark mb-1">{s.value}</div>
                <div className="text-sm font-medium text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-lightest border border-brand/20 text-dark text-sm font-bold mb-6">
              <Globe className="h-4 w-4" /> Why Deccan Filings?
            </div>
            <h2 className="text-4xl font-black text-dark mb-4">A Workplace You'll Love</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We invest in our people because we know that happy, empowered employees build exceptional client experiences.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-brand/40 hover:shadow-lg transition-all group">
                <div className="bg-brand-lightest group-hover:bg-brand p-4 rounded-2xl inline-flex mb-5 transition-colors duration-300">
                  <b.icon className="h-6 w-6 text-dark" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{b.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Positions ── */}
      <section id="open-positions" className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-dark mb-3">Open Positions</h2>
            <p className="text-slate-500">Find your role and make an impact from day one.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {openPositions.map(job => (
              <article
                key={job.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-brand/50 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block ${deptColors[job.department] || 'bg-slate-100 text-slate-700'}`}>
                      {job.department}
                    </span>
                    <h3 className="text-xl font-black text-dark">{job.title}</h3>
                  </div>
                  <span className="shrink-0 text-xs bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1 rounded-full">
                    {job.type}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{job.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-5">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.experience}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.department}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills.map(skill => (
                    <span key={skill} className="text-xs bg-white border border-slate-200 text-dark font-medium px-3 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => openApply(job)}
                  className="w-full bg-dark text-white py-3 rounded-xl font-bold text-sm hover:bg-dark/80 transition-all group-hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Apply for this Role <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section id="apply-form" className="py-20 bg-slate-50">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-dark mb-3">
              {selected ? `Apply — ${selected.title}` : 'Send an Open Application'}
            </h2>
            <p className="text-slate-500">
              {selected
                ? `You're applying for the ${selected.title} position in ${selected.department}.`
                : "Don't see a perfect fit? We'd love to hear from you anyway."}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8">
            {/* Status */}
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

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Name + Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="app-name" className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                  <input id="app-name" name="name" type="text" className={inputCls} placeholder="Your full name" value={app.name} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="app-mobile" className={labelCls}>Mobile Number <span className="text-red-400">*</span></label>
                  <input id="app-mobile" name="mobile" type="tel" className={inputCls} placeholder="+91 98765 43210" value={app.mobile} onChange={handleChange} required />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="app-email" className={labelCls}>Email Address <span className="text-red-400">*</span></label>
                <input id="app-email" name="email" type="email" className={inputCls} placeholder="you@example.com" value={app.email} onChange={handleChange} required />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="app-role" className={labelCls}>Position Applying For <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select id="app-role" name="role" className={`${inputCls} appearance-none`} value={app.role} onChange={handleChange} required>
                    <option value="">— Select a position —</option>
                    {openPositions.map(j => (
                      <option key={j.id} value={j.title}>{j.title} · {j.department}</option>
                    ))}
                    <option value="Open Application">Open Application (Any Role)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label htmlFor="app-experience" className={labelCls}>Years of Experience <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select id="app-experience" name="experience" className={`${inputCls} appearance-none`} value={app.experience} onChange={handleChange} required>
                    <option value="">— Select experience level —</option>
                    <option value="Fresher (0–1 year)">Fresher (0–1 year)</option>
                    <option value="1–3 years">1–3 years</option>
                    <option value="3–5 years">3–5 years</option>
                    <option value="5–8 years">5–8 years</option>
                    <option value="8+ years">8+ years</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Message / Cover Note */}
              <div>
                <label htmlFor="app-message" className={labelCls}>Cover Note</label>
                <textarea
                  id="app-message"
                  name="message"
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Tell us a bit about yourself, your skills, and why you'd like to join Deccan Filings…"
                  value={app.message}
                  onChange={handleChange}
                />
              </div>

              <button
                id="app-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-dark text-white px-4 py-4 rounded-xl font-bold text-lg hover:bg-dark/80 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Application
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 mt-2">
                Your information is sent directly to <strong>hr@deccanfilings.com</strong> and kept confidential.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
