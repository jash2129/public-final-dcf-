import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Phone,
  ShieldCheck,
  Star,
  AlertCircle,
  User,
  Mail,
  CheckCircle2,
  XCircle,
  ChevronDown,
  MessageCircle,
  Zap,
  BadgeCheck,
  Award,
  Lock,
  ArrowRight,
  ClipboardList,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PRICING_PLANS = [
  {
    id: 'basic',
    badge: null,
    tag: 'Salaried / Single Source Income',
    title: 'Salaried Plan',
    price: '₹999',
    originalPrice: '₹1,999',
    discount: '50% OFF',
    description: 'Perfect for salaried professionals with standard income sources seeking expert review and fast, error-free filing.',
    features: [
      '1-on-1 Dedicated CA Review',
      '30-Point Deduction Optimization Check (Sec 80C, 80D, HRA)',
      'Express 24-Hour Filing Turnaround',
      'Form 16 Cross-Check with AIS & Form 26AS',
      'WhatsApp Support During Filing Window',
    ],
    cta: 'Select Basic Plan',
    highlighted: false,
  },
  {
    id: 'premium',
    badge: 'Most Popular',
    tag: 'Business, Traders & Investors',
    title: 'Premium Business & Trader Plan',
    price: '₹2,499',
    originalPrice: '₹4,999',
    discount: '50% OFF',
    description: 'Built for business owners, traders, and investors with complex income sources requiring deep expertise.',
    features: [
      'Everything in the Salaried Plan',
      'Complex Multi-Source Review (Capital Gains, Stocks, Intraday, Crypto)',
      '1-Year Income Tax Notice Protection & Complete Response Coverage',
      'Optimal Tax Regime Selection (Old vs. New)',
      'Priority 12-Hour Filing Turnaround',
    ],
    cta: 'Select Premium Plan',
    highlighted: true,
  },
];

const VALUE_STACK = [
  {
    icon: '🧑‍💼',
    title: '1-on-1 Dedicated CA Review',
    body: 'A personal tax expert reviews your income sources, capital gains, or salaries to eliminate filing errors completely.',
  },
  {
    icon: '🔍',
    title: '30-Point Deduction Optimization Check',
    body: 'We comb through Section 80C, 80D, HRA, and home loans to ensure you keep more of your hard-earned money.',
  },
  {
    icon: '🛡️',
    title: '1-Year Income Tax Notice Protection',
    body: 'Total peace of mind. If the IT department sends a routine query within the next 12 months, our expert CAs draft and submit the legal response for you — absolutely free.',
  },
];

const COMPARISON = [
  {
    old: 'Standard Government Portal',
    new: 'Done for you in 24 hours',
  },
  {
    old: 'Confusing tax regimes & forms',
    new: 'Expert CA picks the optimal tax regime',
  },
  {
    old: 'High risk of accidental IT notices',
    new: '100% error-free verification check',
  },
  {
    old: 'Hours spent deciphering complex tax codes alone',
    new: 'Complete year-round response protection',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Rameshwar',
    location: 'Bengaluru',
    stars: 5,
    text: 'I was dreading filing my ITR this year. Deccan Filings assigned me a CA within 2 hours and my return was filed by the next morning. Got a ₹18,000 refund I didn\'t even know I was owed!',
    role: 'Software Engineer at TCS',
  },
  {
    name: 'Sanjay Mehrotra',
    location: 'Hyderabad',
    stars: 5,
    text: 'Had capital gains from selling shares and was totally confused about which regime to use. The CA explained everything clearly and maximized my deductions. Zero errors, zero stress.',
    role: 'Business Owner',
  },
  {
    name: 'Lakshmi Venkataraman',
    location: 'Chennai',
    stars: 5,
    text: 'Got an IT notice last year and panicked. Deccan Filings handled the entire response on my behalf at no extra cost. This year I\'ve already pre-booked them again. Highly recommend!',
    role: 'Govt. Sector Employee',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does the 24-hour filing process work?',
    a: 'After you submit the form, a dedicated CA contacts you within 60 minutes. You share your Form 16 (and any other documents) securely via WhatsApp or our portal. Your CA reviews, optimizes, and files your ITR — typically within 24 hours of receiving all documents.',
  },
  {
    q: 'What documents do I need to provide?',
    a: 'For most salaried employees, only Form 16 is required. For business income or capital gains, you may need additional statements. Your assigned CA will provide a precise checklist tailored to your situation.',
  },
  {
    q: 'Is my financial data safe with you?',
    a: 'Absolutely. We use ISO 27001-certified data security protocols. All data is transmitted over encrypted channels and stored securely. We never share your financial information with third parties.',
  },
  {
    q: 'What if I receive an income tax notice after filing?',
    a: 'Our 1-Year Notice Protection means we handle any routine IT department queries or notices within 12 months of your filing date — completely free of charge. Our CA team drafts and submits the official legal response on your behalf.',
  },
  {
    q: 'What is your refund guarantee?',
    a: 'If we make an operational filing error on your tax return, we issue a 100% refund of your service fee and correct the return at absolutely no additional cost to you. Your accuracy is our responsibility.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ItrLandingPageB() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (heroRef.current) {
        setShowStickyBar(heroRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => nameInputRef.current?.focus(), 600);
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Full name is required';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) errs.phone = 'Phone number is required';
    else if (!phoneRegex.test(phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Enter a valid email address';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    try {
      await fetch('https://hook.eu1.make.com/kn9e94j7t8gs8lghxaa311k7v8su7ayo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          variant: 'B',
          source: 'itr-filing-b',
        }),
      });
    } catch (err) {
      console.error('Webhook failed:', err);
    }

    setIsSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      const params = new URLSearchParams({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        plan: 'assisted',
      });
      navigate(`/register?${params.toString()}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F0E0E] text-[#0F172A] dark:text-[#F8F6F0] font-sans antialiased overflow-x-hidden">
      <Helmet>
        <title>File Your ITR in 24 Hours & Maximize Your Tax Refund | Deccan Filings</title>
        <meta
          name="description"
          content="Get a dedicated Chartered Accountant to optimize your tax regime, claim every legal deduction, and file your ITR securely today. 100% error-free. ISO 27001 certified."
        />
        <meta property="og:title" content="File Your ITR in 24 Hours — Deccan Filings" />
        <meta
          property="og:description"
          content="Skip the confusing government portal. Expert CA assistance. 24-hour filing. Max refund guarantee."
        />
      </Helmet>

      {/* ══════════════════════════════════════════════════
          URGENT COUNTDOWN BANNER
      ══════════════════════════════════════════════════ */}
      <div className="bg-[#0F172A] text-white py-2 px-4 text-center text-[11px] sm:text-sm font-bold tracking-wide relative z-50">
        <span className="animate-pulse inline-block mr-1">⚠️</span>
        URGENT: July 31st ITR Deadline Approaching — Avoid ₹5,000 Section 234F Penalty. File Now!
      </div>

      {/* ══════════════════════════════════════════════════
          HEADER — Leak-Free, No Nav
      ══════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#171514]/95 backdrop-blur-xl border-b border-slate-200 dark:border-[#242220] shadow-sm py-2.5'
            : 'bg-white dark:bg-[#171514] border-b border-slate-100 dark:border-[#242220] py-3'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Deccan Filings"
              className="h-8 sm:h-10 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-black text-lg sm:text-xl text-[#0F172A] tracking-tight hidden xs:block">
              Deccan Filings
            </span>
          </div>

          {/* Header CTA */}
          <a
            href="tel:+919000930453"
            id="header-cta-call"
            className="flex items-center gap-2 border-2 border-[#0F172A] dark:border-[#F8F6F0] hover:bg-[#0F172A] dark:hover:bg-[#F8F6F0] hover:text-white dark:hover:text-[#0F172A] text-[#0F172A] dark:text-[#F8F6F0] px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Talk to a Tax Expert: +91 90009 30453</span>
            <span className="sm:hidden">+91 90009 30453</span>
          </a>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          HERO — Split Layout (Left Hook + Right Form)
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        id="hero"
        className="relative overflow-hidden py-10 sm:py-16 px-4 sm:px-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"
      >
        {/* Subtle mesh blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#EA580C]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-[#16A34A]/8 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* LEFT — Hook & Promise */}
            <div className="space-y-6 text-white">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-[#EA580C]/20 border border-[#EA580C]/30 text-[#FB923C] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                <Zap className="h-3.5 w-3.5" />
                Expert CA Assisted Filing
              </div>

              {/* H1 */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black leading-[1.12] tracking-tight text-white">
                File Your ITR in{' '}
                <span className="text-[#FB923C]">24 Hours</span> &amp;{' '}
                Maximize Your Tax Refund—
                <span className="text-[#4ADE80]">100% Error-Free.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-lg">
                Skip the confusing government portal errors. Get a dedicated Chartered Accountant (CA) to
                optimize your tax regime, claim every legal deduction, and file your ITR securely today.
              </p>

              {/* Trust bullets */}
              <ul className="space-y-3">
                {[
                  '✓ 100% Secure & Government Registered CA Network',
                  '✓ Zero Document Hassle – Just upload Form 16',
                  '✓ 24-Hour Filing Turnaround, Guaranteed',
                  '✓ 1-Year Income Tax Notice Protection Included',
                ].map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm sm:text-base text-slate-200 font-medium">
                    <span className="text-[#4ADE80] shrink-0 font-black">{bullet.slice(0, 1)}</span>
                    <span>{bullet.slice(2)}</span>
                  </li>
                ))}
              </ul>

              {/* Social proof mini bar */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm font-bold text-slate-200 ml-1">4.9/5</span>
                </div>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-sm text-slate-300 font-medium">1,200+ Indian Taxpayers Served</span>
              </div>
            </div>

            {/* RIGHT — Lead Capture Card */}
            <div
              ref={formRef}
              id="lead-form"
            >
              <div
                className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] p-6 sm:p-8 space-y-5"
              >
                {/* Card header */}
                <div className="text-center space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-[#F8F6F0] leading-tight">
                    Get Expert CA Assistance Now
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">⏱ Takes less than 60 seconds</p>
                </div>

                {/* Scarcity pulse */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600/30 rounded-xl p-3 flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0 mt-1.5" />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-snug">
                    Limited CA slots available today — secure yours before July 31st deadline.
                  </span>
                </div>

                {submitted ? (
                  /* ── Success State ── */
                  <div className="text-center py-6 space-y-3">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
                    </div>
                    <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F8F6F0]">You're Booked! 🎉</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Your dedicated CA will contact you on WhatsApp within 60 minutes.
                      Redirecting you to complete your profile…
                    </p>
                  </div>
                ) : (
                  /* ── Form ── */
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="b-fullName"
                        className="block text-xs font-bold text-[#0F172A] dark:text-[#F8F6F0] uppercase tracking-wider mb-1.5"
                      >
                        Full Name <span className="text-[#EA580C]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="h-4 w-4" />
                        </span>
                        <input
                          ref={nameInputRef}
                          id="b-fullName"
                          type="text"
                          placeholder="e.g., Arjun Kumar"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                          }}
                          className={`w-full bg-[#F8FAFC] dark:bg-[#0F172A] border rounded-xl pl-10 pr-4 py-3 text-sm text-[#0F172A] dark:text-[#F8F6F0] placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.name
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-slate-200 dark:border-[#242220] focus:ring-[#EA580C]'
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label
                        htmlFor="b-phone"
                        className="block text-xs font-bold text-[#0F172A] dark:text-[#F8F6F0] uppercase tracking-wider mb-1.5"
                      >
                        Mobile Number <span className="text-[#EA580C]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-3 border-r border-slate-200 dark:border-[#242220] text-slate-500">
                          <Phone className="h-4 w-4" />
                          <span className="text-xs font-bold">+91</span>
                        </span>
                        <input
                          id="b-phone"
                          type="tel"
                          maxLength={10}
                          placeholder="98XXX XXXXX"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value.replace(/\D/g, ''));
                            if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                          }}
                          className={`w-full bg-[#F8FAFC] border rounded-xl pl-20 pr-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.phone
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-slate-200 focus:ring-[#EA580C]'
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="b-email"
                        className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5"
                      >
                        Email Address{' '}
                        <span className="text-xs text-slate-400 font-normal lowercase">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          id="b-email"
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                          }}
                          className={`w-full bg-[#F8FAFC] border rounded-xl pl-10 pr-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.email
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-slate-200 focus:ring-[#EA580C]'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      id="hero-form-submit"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white py-4 rounded-xl font-black text-sm sm:text-base transition-all shadow-[0_8px_30px_rgba(234,88,12,0.40)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.50)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Connecting with your CA…
                        </>
                      ) : (
                        <>
                          START MY FILING NOW
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    {/* Micro copy */}
                    <p className="text-center text-[11px] text-slate-400 font-medium leading-relaxed">
                      <Lock className="h-3 w-3 inline mr-1 mb-0.5" />
                      Your financial data is fully encrypted and 100% secure. No spam, ever.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TRUST ANCHOR RIBBON
      ══════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-[#171514] border-y border-slate-200 dark:border-[#242220] py-5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x sm:divide-slate-200 dark:divide-[#242220]">
            {[
              { icon: '⭐', title: '4.9/5 Star Rated', sub: 'by 1,200+ Indian Taxpayers' },
              { icon: '🛡️', title: 'ISO 27001 Certified', sub: 'Data Security Protocols' },
              { icon: '⚡', title: 'Active Support', sub: 'via Call & WhatsApp 7 Days' },
            ].map((anchor) => (
              <div
                key={anchor.title}
                className="flex items-center gap-3 sm:justify-center sm:px-8 py-1 group"
              >
                <span className="text-2xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{anchor.icon}</span>
                <div>
                  <div className="font-black text-[#0F172A] dark:text-[#F8F6F0] text-sm sm:text-base leading-tight">
                    {anchor.title}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">{anchor.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          VALUE STACK — Hormozi "Grand Slam Offer"
      ══════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[#F8FAFC] dark:bg-[#0F0E0E]">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Section header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#EA580C]/10 text-[#EA580C] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              <Award className="h-3.5 w-3.5" />
              What You Get — Grand Slam Offer
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              What You Get with Our Premium Assisted Filing
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Every item below is included in your single service fee — no hidden extras, no upsells.
            </p>
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {VALUE_STACK.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#171514] rounded-2xl border border-slate-200 dark:border-[#242220] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8F6F0] mb-2 leading-tight group-hover:text-[#EA580C] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          {/* Value callout bar */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
            <div className="text-center sm:text-left">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Value Included</p>
              <p className="text-white font-black text-2xl sm:text-3xl">
                CA Review + 30-Point Check + 1-Year Protection
              </p>
              <p className="text-slate-400 text-sm mt-1">Everything handled end-to-end by a dedicated CA.</p>
            </div>
            <button
              id="value-stack-cta"
              onClick={scrollToForm}
              className="shrink-0 bg-[#EA580C] hover:bg-[#C2410C] text-white px-8 py-4 rounded-xl font-black text-sm transition-all shadow-[0_8px_24px_rgba(234,88,12,0.4)] active:scale-95 whitespace-nowrap"
            >
              Claim My CA Slot →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PRICING PLANS — Grand Slam Offer / Choose Your Plan
      ══════════════════════════════════════════════════ */}
      <section id="pricing" className="py-14 sm:py-20 px-4 sm:px-6 bg-[#0F172A] relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#EA580C]/8 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#16A34A]/6 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 space-y-10">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#EA580C]/20 border border-[#EA580C]/30 text-[#FB923C] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              <BadgeCheck className="h-3.5 w-3.5" />
              Transparent Pricing — No Hidden Charges
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Choose Your Assisted Filing Plan
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Transparent pricing. No hidden charges. 100% CA-backed.
            </p>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl overflow-visible transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-white border-2 border-[#EA580C] shadow-[0_0_0_4px_rgba(234,88,12,0.15),0_24px_60px_rgba(234,88,12,0.25)] hover:shadow-[0_0_0_4px_rgba(234,88,12,0.2),0_32px_80px_rgba(234,88,12,0.35)] hover:-translate-y-1'
                    : 'bg-[#1E293B] border border-slate-700 shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1'
                }`}
              >
                {/* Most Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-[#EA580C] text-white text-[11px] font-black tracking-widest uppercase px-5 py-1.5 rounded-full shadow-[0_4px_16px_rgba(234,88,12,0.5)] whitespace-nowrap">
                      ⭐ {plan.badge}
                    </div>
                  </div>
                )}

                <div className="p-7 sm:p-8 flex flex-col gap-6 h-full">
                  {/* Plan header */}
                  <div className="space-y-1 pt-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      plan.highlighted ? 'text-[#EA580C]' : 'text-slate-400'
                    }`}>
                      {plan.tag}
                    </span>
                    <h3 className={`text-xl font-black leading-tight ${
                      plan.highlighted ? 'text-[#0F172A]' : 'text-white'
                    }`}>
                      {plan.title}
                    </h3>
                  </div>

                  {/* Pricing block */}
                  <div className={`rounded-2xl p-5 ${
                    plan.highlighted
                      ? 'bg-[#FFF7F4] border border-[#EA580C]/20'
                      : 'bg-[#0F172A] border border-slate-700'
                  }`}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className={`text-4xl font-black leading-none ${
                          plan.highlighted ? 'text-[#0F172A]' : 'text-white'
                        }`}>
                          {plan.price}
                        </div>
                        <div className={`text-sm mt-1 ${
                          plan.highlighted ? 'text-slate-500' : 'text-slate-500'
                        }`}>
                          <span className="line-through">{plan.originalPrice}</span>
                          <span className="ml-2 text-xs">per filing</span>
                        </div>
                      </div>
                      <span className={`text-xs font-black px-3 py-1.5 rounded-full ${
                        plan.highlighted
                          ? 'bg-[#EA580C] text-white'
                          : 'bg-[#16A34A]/20 text-[#4ADE80] border border-[#16A34A]/30'
                      }`}>
                        {plan.discount}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed mt-3 ${
                      plan.highlighted ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Feature checklist */}
                  <ul className="space-y-3.5 flex-1">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        <span className={`flex h-5 w-5 shrink-0 rounded-full items-center justify-center mt-0.5 ${
                          plan.highlighted
                            ? 'bg-[#EA580C]/10 text-[#EA580C]'
                            : 'bg-[#16A34A]/15 text-[#4ADE80]'
                        }`}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                        <span className={`text-sm leading-snug ${
                          fi === 0 && plan.id === 'premium'
                            ? plan.highlighted ? 'font-bold text-[#0F172A]' : 'font-bold text-white'
                            : plan.highlighted ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    id={`pricing-cta-${plan.id}`}
                    onClick={scrollToForm}
                    className={`w-full py-4 rounded-xl font-black text-sm transition-all active:scale-95 ${
                      plan.highlighted
                        ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-[0_8px_30px_rgba(234,88,12,0.45)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.55)]'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                    }`}
                  >
                    {plan.cta} →
                  </button>

                  {/* Trust footer */}
                  <p className={`text-center text-[11px] ${
                    plan.highlighted ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Lock className="h-3 w-3 inline mr-1 mb-0.5" />
                    No payment needed to get started
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reassurance strip */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-400 pt-2">
            {[
              '✓ 100% Secure & Encrypted',
              '✓ CA-Certified Network',
              '✓ July 31st Deadline Ready',
              '✓ No Credit Card to Start',
            ].map((item) => (
              <span key={item} className="font-medium">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COMPARISON MATRIX — Old Way vs Our Way
      ══════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              The Old Way vs. The Deccan Filings Way
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
              Stop wrestling with the government portal. Here's what changes when you file with us.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2D3748] shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
            {/* Table header */}
            <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-[#2D3748]">
              <div className="bg-slate-50 dark:bg-[#0F172A] px-5 py-5 sm:py-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                  <span className="font-black text-sm sm:text-lg text-slate-700 dark:text-slate-300">
                    The Confusing Old Way
                  </span>
                </div>
              </div>
              <div className="bg-[#16A34A]/10 dark:bg-[#16A34A]/15 px-5 py-5 sm:py-6 text-center border-l-4 border-l-[#16A34A] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#16A34A]" />
                  <span className="font-black text-sm sm:text-lg text-[#15803D] dark:text-[#4ADE80]">
                    The Deccan Filings Way
                  </span>
                </div>
              </div>
            </div>

            {/* Rows */}
            {COMPARISON.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-2 divide-x divide-slate-100 dark:divide-[#2D3748] border-t border-slate-100 dark:border-[#2D3748] ${
                  idx % 2 === 0 ? 'bg-white dark:bg-[#1E293B]' : 'bg-slate-50/30 dark:bg-[#1E293B]/60'
                } hover:bg-slate-50 dark:hover:bg-[#1E293B]/80 transition-colors`}
              >
                {/* Old Way */}
                <div className="px-5 py-4 sm:py-5 flex items-start gap-3 opacity-90">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400/80 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{row.old}</span>
                </div>
                {/* New Way */}
                <div className="px-5 py-4 sm:py-5 flex items-start gap-3 bg-[#16A34A]/[0.02] dark:bg-[#16A34A]/5 border-l-4 border-l-[#16A34A]/30">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8F6F0] leading-relaxed">{row.new}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              id="comparison-cta"
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-8 py-4 rounded-xl font-black text-sm sm:text-base transition-all shadow-[0_8px_24px_rgba(234,88,12,0.35)] active:scale-95"
            >
              Switch to the Better Way
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          RISK REVERSAL GUARANTEE — Sabri Suby Style
      ══════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[#F8FAFC] dark:bg-[#0F0E0E]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-8 sm:p-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.25)] relative overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#EA580C]/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#16A34A]/10 blur-2xl pointer-events-none" />

            {/* Seal */}
            <div className="relative z-10 space-y-5">
              <div className="w-20 h-20 rounded-full bg-[#16A34A] flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(22,163,74,0.4)]">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>

              <div>
                <p className="text-[#4ADE80] text-xs font-bold uppercase tracking-widest mb-2">
                  Iron-Clad Guarantee
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  MAX REFUND & 100% ACCURACY GUARANTEE
                </h2>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  <strong className="text-white">Our Iron-Clad Guarantee:</strong> We are committed to absolute precision. If we make an
                  operational filing error on your tax return, we will issue a{' '}
                  <strong className="text-[#4ADE80]">100% refund of your service fee immediately</strong>,
                  correct the return at zero additional cost, and personally manage any resulting notices —
                  free of charge.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We don't just file your taxes — we stake our reputation and our revenue on getting it
                  right the first time. That's how confident we are in our process.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { label: '100%', sub: 'Refund if we err' },
                  { label: '24hr', sub: 'Filing turnaround' },
                  { label: '1 Year', sub: 'Notice protection' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl py-3 px-2">
                    <div className="text-xl sm:text-2xl font-black text-[#FB923C]">{stat.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <button
                id="guarantee-cta"
                onClick={scrollToForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-10 py-4 rounded-xl font-black text-sm sm:text-base transition-all shadow-[0_8px_30px_rgba(234,88,12,0.5)] active:scale-95"
              >
                File Risk-Free Today
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white dark:bg-[#0F0E0E]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-amber-200 dark:border-amber-600/30">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              Real Reviews from Real Taxpayers
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              1,200+ Taxpayers. One Common Result: Relief.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-6 space-y-4 hover:border-[#EA580C]/30 hover:shadow-md transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{t.text}"</p>
                {/* Attribution */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-xs">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A]">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              id="testimonials-cta"
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-4 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg"
            >
              Join 1,200+ Happy Taxpayers
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — 3-Step Process
      ══════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[#F8FAFC] dark:bg-[#0F0E0E]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-[#F8F6F0] leading-tight">
              How It Works — 3 Simple Steps
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">From form submit to ITR filed in as little as 24 hours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#EA580C]/20 via-[#EA580C]/60 to-[#EA580C]/20" />

            {[
              {
                step: '01',
                title: 'Submit Your Details',
                body: 'Fill the 60-second form above. That\'s it. No documents needed yet.',
                icon: <ClipboardList className="h-10 w-10 text-[#EA580C]" />,
              },
              {
                step: '02',
                title: 'CA Reviews & Optimizes',
                body: 'Your dedicated CA contacts you within 60 minutes, collects Form 16, and runs the 30-point deduction check.',
                icon: <UserCheck className="h-10 w-10 text-[#EA580C]" />,
              },
              {
                step: '03',
                title: 'ITR Filed & Verified',
                body: 'We file your ITR on the government portal, send you the acknowledgment, and activate your 1-year notice protection.',
                icon: <FileCheck className="h-10 w-10 text-[#16A34A]" />,
              },
            ].map((s, idx) => (
              <div key={idx} className="bg-white dark:bg-[#171514] rounded-2xl border border-slate-200 dark:border-[#242220] p-6 sm:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#EA580C] text-white text-xs font-black flex items-center justify-center shadow-md border-2 border-white dark:border-[#0F0E0E]">
                  {s.step}
                </div>
                <div className="mb-5 mt-3 flex justify-center transform group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <h3 className="font-black text-[#0F172A] dark:text-[#F8F6F0] text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              id="how-it-works-cta"
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-8 py-4 rounded-xl font-black text-sm sm:text-base transition-all shadow-[0_8px_24px_rgba(234,88,12,0.35)] active:scale-95"
            >
              Start My Filing in 60 Seconds
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FAQ — Accordion
      ══════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Everything you need to know before you file with us.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  openFaq === idx
                    ? 'border-[#EA580C]/40 shadow-[0_4px_20px_rgba(234,88,12,0.08)]'
                    : 'border-slate-200'
                }`}
              >
                <button
                  id={`faq-${idx}`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-[#171514] hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-colors gap-4"
                >
                  <span className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-[#F8F6F0] leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180 text-[#EA580C]' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === idx ? 'max-h-60' : 'max-h-0'
                  }`}
                >
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-[#242220]">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FINAL CTA — Above Footer
      ══════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#EA580C]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#16A34A]/8 blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#EA580C]/20 text-[#FB923C] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#EA580C]/30">
            <BadgeCheck className="h-3.5 w-3.5" />
            Limited Slots — July 31st Deadline
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            Don't Risk a ₹5,000 Late Fee.<br />
            File Your ITR Today — Risk Free.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Hundreds of CAs standing by. Slots are filling fast as the deadline approaches.
            Lock in your spot now and file with 100% accuracy, guaranteed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="final-cta-primary"
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-8 py-4 rounded-xl font-black text-sm sm:text-base transition-all shadow-[0_8px_30px_rgba(234,88,12,0.5)] active:scale-95"
            >
              Start My Filing Now
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              id="final-cta-call"
              href="tel:+919000930453"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-bold text-sm sm:text-base transition-all active:scale-95"
            >
              <Phone className="h-4 w-4" />
              Call a CA Now
            </a>
          </div>
          <p className="text-slate-500 text-xs">
            🔒 Encrypted & Secure · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER — Compliance + Legal
      ══════════════════════════════════════════════════ */}
      <footer className="bg-[#0A0F1A] text-slate-400 py-10 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Deccan Filings" className="h-8 w-auto object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-black text-white text-base">Deccan Filings</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 justify-center">
              {[
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Service', path: '/terms' },
                { label: 'Refund Policy', path: '/refund' },
                { label: 'Contact', path: '/contact' },
              ].map((l) => (
                <Link key={l.label} to={l.path} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <a href="tel:+919000930453" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5" />
                +91 90009 30453
              </a>
              <span className="text-slate-700">|</span>
              <a href="https://wa.me/919000930453" className="flex items-center gap-1.5 text-slate-400 hover:text-[#4ADE80] transition-colors">
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Legal disclaimer */}
          <div className="border-t border-slate-800 pt-6">
            <p className="text-[11px] leading-relaxed text-slate-600 text-center">
              <span className="font-semibold text-slate-500">Disclaimer: </span>
              Deccan Filings is an independent, private CA-assisted professional services platform operated by{' '}
              <strong className="text-slate-400">TOR BUSINESS SOLUTIONS PRIVATE LIMITED</strong>. We are{' '}
              <strong className="text-slate-400">not affiliated with, endorsed by, or an official portal of</strong> the Income Tax
              Department of India, the Ministry of Corporate Affairs (MCA), or any government authority. All third-party brand names
              and government portal names referenced are the property of their respective owners. Our professional service fees are
              entirely separate from any mandatory government filing fees. Deccan Filings does not guarantee specific government
              processing timelines, approval outcomes, or tax refund amounts, as these are determined solely by the relevant
              government authority.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4 text-center text-xs text-slate-600">
            © 2026 Deccan Filings. All rights reserved. A brand of TOR BUSINESS SOLUTIONS PRIVATE LIMITED.
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════
          MOBILE STICKY BOTTOM CTA BAR
      ══════════════════════════════════════════════════ */}
      <div
        className={`fixed bottom-0 left-0 w-full md:hidden z-40 transition-all duration-500 ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="bg-white/95 dark:bg-[#171514]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#242220] shadow-[0_-8px_30px_rgba(0,0,0,0.10)] p-3 flex items-center justify-between gap-3">
          <div className="text-left pl-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-[#EA580C] tracking-widest block leading-none">
              Expert CA Filing
            </span>
            <div className="text-sm font-black text-[#0F172A] dark:text-[#F8F6F0] truncate">File ITR in 24 Hours →</div>
          </div>
          <button
            id="sticky-bar-cta"
            onClick={scrollToForm}
            className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-5 py-3 rounded-xl font-black text-xs transition-all shadow-[0_4px_16px_rgba(234,88,12,0.4)] active:scale-95 shrink-0"
          >
            Start Now
          </button>
        </div>
      </div>
    </div>
  );
}
