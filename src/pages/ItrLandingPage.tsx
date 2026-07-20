import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, AlertCircle, Phone, ArrowRight, ShieldCheck, MessageSquare, Users, IndianRupee, User, Mail, Sparkles, Clock, Lock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { serviceCategories, generateSlug } from '../data/services';

export default function ItrLandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Scroll States
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Form Fields & Errors
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'premium'>('starter');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll Handlers
  useEffect(() => {
    const handleScroll = () => {
      // Header glassmorphism scroll check
      setIsScrolled(window.scrollY > 20);

      // Sticky mobile bottom CTA check (show when hero is scrolled out of viewport)
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowStickyBar(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const selectPlanAndFocus = (plan: 'starter' | 'premium') => {
    setSelectedPlan(plan);
    // Smooth scroll to the form section
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Delay focus slightly for a smooth scroll transition
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 600);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Enter a valid email address';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const formattedPhone = phone.trim().startsWith('+91')
      ? phone.trim()
      : phone.trim().startsWith('91') && phone.trim().length === 12
        ? `+${phone.trim()}`
        : `+91${phone.trim()}`;

    try {
      await fetch('https://hook.eu1.make.com/kn9e94j7t8gs8lghxaa311k7v8su7ayo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: formattedPhone,
          email: email.trim(),
          plan: selectedPlan,
        }),
      });
    } catch (error) {
      console.error('Failed to dispatch webhook:', error);
    }

    const searchParams = new URLSearchParams({
      plan: selectedPlan,
      name: name.trim(),
      phone: formattedPhone,
      email: email.trim(),
    });
    
    navigate(`/register?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] dark:bg-[#0F0E0E] text-[#1A1715] dark:text-[#F8F6F0] font-sans antialiased overflow-x-hidden">
      <Helmet>
        <title>Stop Overpaying on ITR for Your RSUs & ESOPs | Deccan Filings</title>
        <meta name="description" content="We pair tech professionals and high-earners with Senior CAs to guarantee maximum legal refunds and zero Sec 234F penalties. 100% Online." />
        <meta property="og:title" content="Deccan Filings ITR Strategy - RSU & ESOP Experts" />
        <meta property="og:description" content="Claim your free tax strategy review and lock in 50% off assisted tax filings today." />
      </Helmet>

      {/* Urgent Warning Eyebrow Banner */}
      <div className="bg-[#FF6F43] text-white py-2 px-4 text-center text-[11px] sm:text-sm font-bold tracking-wide relative z-50 leading-snug">
        ⚠️ URGENT: July 31st ITR Deadline is Approaching — File Now!
      </div>

      {/* Header Section */}
      <header
        className={`fixed top-8 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-[#171514]/90 backdrop-blur-xl border-b border-[#EAE6DF] dark:border-[#242220] py-2.5 shadow-sm'
            : 'bg-transparent py-3'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Deccan Filings"
              className="h-8 sm:h-11 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-block text-xs font-black text-[#8C8480] dark:text-[#9E9692] uppercase tracking-wider">
              Assisted filing starts @ <span className="text-[#FF6F43] font-black text-sm">₹999</span>
            </span>
            <button
              onClick={() => scrollToSection(pricingRef)}
              className="bg-[#FF6F43] hover:bg-[#E85A30] text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-[10px] font-bold text-xs sm:text-sm transition-all shadow-[0_8px_24px_rgba(255,111,67,0.30)] active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span className="sm:hidden">File ITR @ ₹999</span>
              <span className="hidden sm:inline">File My ITR — Starts @ ₹999</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden mesh-gradient-light dark:bg-[radial-gradient(at_10%_20%,rgba(255,111,67,0.08)_0px,transparent_50%),radial-gradient(at_90%_10%,rgba(46,21,15,0.4)_0px,transparent_50%),radial-gradient(at_50%_80%,rgba(255,111,67,0.05)_0px,transparent_50%)] text-center"
      >
        {/* Floating background blur elements */}
        <div className="absolute top-[25%] right-[15%] w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-[#FF6F43]/10 blur-3xl animate-pulse-glow pointer-events-none"></div>
        <div className="absolute bottom-[15%] left-[5%] w-40 sm:w-60 h-40 sm:h-60 rounded-full bg-[#FF6F43]/5 blur-3xl animate-float pointer-events-none"></div>

        <div className="max-w-4xl mx-auto w-full relative z-10 space-y-5 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black font-display tracking-tight leading-[1.15] sm:leading-[1.1] text-[#1A1715] dark:text-[#F8F6F0]">
            Stop Overpaying on ITR for Your <span className="text-[#FF6F43]">RSUs and ESOPs.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#8C8480] dark:text-[#9E9692] leading-relaxed max-w-2xl mx-auto">
            We pair tech professionals and high-earners with Senior CAs to guarantee maximum legal refunds and zero Sec 234F penalties. Takes 2 minutes. 100% Online.
          </p>

          {/* Trust Bar — 3 pills, wrap nicely on mobile */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-5 sm:mt-6 max-w-3xl mx-auto">
            {/* Google Rating */}
            <div className="flex items-center gap-2 bg-white/90 dark:bg-[#171514]/90 backdrop-blur-md border border-[#EAE6DF] dark:border-[#242220] px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF6F43]/30">
              <span className="flex h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-amber-500/10 text-amber-500 items-center justify-center shrink-0">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
              </span>
              <span className="text-[11px] sm:text-sm font-bold text-[#1A1715] dark:text-[#F8F6F0]">5.0 Google Rating</span>
            </div>

            {/* Filers Served */}
            <div className="flex items-center gap-2 bg-white/90 dark:bg-[#171514]/90 backdrop-blur-md border border-[#EAE6DF] dark:border-[#242220] px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF6F43]/30">
              <span className="flex h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-[#FF6F43]/10 text-[#FF6F43] items-center justify-center shrink-0">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <span className="text-[11px] sm:text-sm font-bold text-[#1A1715] dark:text-[#F8F6F0]">10,000+ Filers Served</span>
            </div>

            {/* Tax Saved */}
            <div className="flex items-center gap-2 bg-white/90 dark:bg-[#171514]/90 backdrop-blur-md border border-[#EAE6DF] dark:border-[#242220] px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF6F43]/30">
              <span className="flex h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-green-500/10 text-green-500 items-center justify-center shrink-0">
                <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <span className="text-[11px] sm:text-sm font-bold text-[#1A1715] dark:text-[#F8F6F0]">₹10 Cr+ Tax Saved</span>
            </div>
          </div>

          {/* Benefits bullets */}
          <div className="bg-white dark:bg-[#171514] border border-[#EAE6DF] dark:border-[#242220] rounded-[20px] p-5 sm:p-8 max-w-3xl mx-auto text-left shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4 sm:space-y-5 mt-6 sm:mt-8">
            <h2 className="text-sm sm:text-lg font-bold text-[#1A1715] dark:text-[#F8F6F0]">
              Why 10,000+ Corporate Employees Trust Us:
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-[#FF6F43] font-bold text-base sm:text-lg mt-0.5 leading-none shrink-0">✓</span>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#1A1715] dark:text-[#F8F6F0]">Maximum Refunds Guaranteed:</h3>
                  <p className="text-xs text-[#8C8480] dark:text-[#9E9692] leading-relaxed">We forensically align your Form 16, AIS, and TIS to ensure you don't leave a single rupee on the table.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6F43] font-bold text-base sm:text-lg mt-0.5 leading-none shrink-0">✓</span>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#1A1715] dark:text-[#F8F6F0]">Complex Stock Expertise:</h3>
                  <p className="text-xs text-[#8C8480] dark:text-[#9E9692] leading-relaxed">Multi-employer? Foreign Assets? RSUs? Your assigned Senior CA (10+ years exp) handles the heavy lifting.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6F43] font-bold text-base sm:text-lg mt-0.5 leading-none shrink-0">✓</span>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#1A1715] dark:text-[#F8F6F0]">100% Audit-Proof &amp; Secure:</h3>
                  <p className="text-xs text-[#8C8480] dark:text-[#9E9692] leading-relaxed">Zero physical office visits. Just upload your docs securely, and we handle the rest before the deadline.</p>
                </div>
              </li>
            </ul>
            <div className="mt-4 p-3 sm:p-4 bg-orange-50/50 dark:bg-[#1A1715]/50 border border-orange-100 dark:border-[#242220] rounded-xl">
              <p className="text-xs text-[#8C8480] dark:text-[#9E9692]">
                <strong>Official Resources:</strong> To learn more about ITR deadlines and statutory requirements, you can also check the official <a href="https://www.incometax.gov.in/" target="_blank" rel="noopener noreferrer" className="text-[#FF6F43] hover:underline font-bold">Income Tax e-Filing Portal</a>.
              </p>
            </div>
          </div>

          <div className="pt-3 sm:pt-4">
            <button
              onClick={() => scrollToSection(pricingRef)}
              className="w-full sm:w-auto bg-[#FF6F43] hover:bg-[#E85A30] text-white px-8 py-4 sm:py-3.5 rounded-[12px] font-bold text-sm transition-all shadow-[0_8px_24px_rgba(255,111,67,0.30)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              View Assisted Plans &amp; Offers
            </button>
          </div>
        </div>
      </section>

      {/* Pricing / Offers Section */}
      <section ref={pricingRef} id="offers" className="py-12 sm:py-20 px-4 sm:px-6 bg-[#FFF0EB]/30 dark:bg-[#171514]/30 border-y border-[#EAE6DF] dark:border-[#242220]">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black font-display text-[#1A1715] dark:text-[#F8F6F0] leading-tight">
              Our Assisted ITR Filing Plans &amp; Offers
            </h2>
            <p className="text-sm text-[#8C8480] dark:text-[#9E9692] max-w-2xl mx-auto">
              Select a plan below to lock in the 50% discount and pre-fill your strategy consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto items-stretch">
            {/* Card 1 — Starter Assisted Plan */}
            <div className="bg-white dark:bg-[#171514] border border-[#EAE6DF] dark:border-[#242220] rounded-[20px] p-5 sm:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative group transition-all duration-300 hover:shadow-lg">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1A1715] dark:text-[#F8F6F0]">Starter Assisted Plan</h3>
                    <p className="text-xs text-[#8C8480] dark:text-[#9E9692] mt-1">Salaried Employees</p>
                  </div>
                  <span className="bg-[#FFF0EB] dark:bg-[#2E150F] text-[#FF6F43] text-xs font-extrabold px-3 py-1 rounded-full border border-[#FF6F43]/10 shrink-0">
                    50% OFF
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-display text-[#1A1715] dark:text-[#F8F6F0]">₹999</span>
                  <span className="text-sm text-[#8C8480] dark:text-[#9E9692] line-through">₹1,999</span>
                </div>

                <p className="text-xs sm:text-sm text-[#8C8480] dark:text-[#9E9692] leading-relaxed">
                  Perfect for standard salaried professionals looking for error-free expert review and quick submission.
                </p>

                <div className="border-t border-[#EAE6DF] dark:border-[#242220] pt-4 sm:pt-6">
                  <ul className="space-y-3 sm:space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-[#FFF0EB] dark:bg-[#2E150F] p-0.5 rounded-full mt-0.5 text-[#FF6F43] shrink-0">
                        <span className="text-xs font-bold leading-none">✓</span>
                      </div>
                      <span className="text-xs font-semibold text-[#1A1715] dark:text-[#F8F6F0]">
                        Call Assistance: <span className="font-normal text-[#8C8480] dark:text-[#9E9692]">Assigned CA support during the filing window.</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#FFF0EB] dark:bg-[#2E150F] p-0.5 rounded-full mt-0.5 text-[#FF6F43] shrink-0">
                        <span className="text-xs font-bold leading-none">✓</span>
                      </div>
                      <span className="text-xs font-semibold text-[#1A1715] dark:text-[#F8F6F0]">
                        Form 16 Cross-Checking: <span className="font-normal text-[#8C8480] dark:text-[#9E9692]">Aligned with AIS, TIS, and Form 26AS.</span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-5 sm:pt-8">
                <button
                  type="button"
                  onClick={() => selectPlanAndFocus('starter')}
                  className="w-full bg-[#1A1715] dark:bg-[#F8F6F0] text-white dark:text-[#1A1715] hover:bg-[#FF6F43] dark:hover:bg-[#FF6F43] hover:text-white dark:hover:text-white py-3.5 rounded-[12px] font-bold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  Select &amp; Pre-fill Form
                </button>
              </div>
            </div>

            {/* Card 2 — Premium Tax Strategy Plan */}
            <div className="bg-white dark:bg-[#171514] border-2 border-[#FF6F43] rounded-[20px] p-5 sm:p-8 flex flex-col justify-between shadow-[0_12px_40px_rgba(255,111,67,0.12)] relative group transition-all duration-300 hover:shadow-xl">
              {/* Recommended Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF6F43] text-white text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                RECOMMENDED
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1A1715] dark:text-[#F8F6F0]">Premium Tax Strategy Plan</h3>
                    <p className="text-xs text-[#FF6F43] font-bold mt-1">High-Earner &amp; Stock Optimizations</p>
                  </div>
                  <span className="bg-[#FF6F43] text-white text-xs font-extrabold px-3 py-1 rounded-full shrink-0">
                    50% OFF
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-display text-[#1A1715] dark:text-[#F8F6F0]">₹2,499</span>
                  <span className="text-sm text-[#8C8480] dark:text-[#9E9692] line-through">₹4,999</span>
                </div>

                <p className="text-xs sm:text-sm text-[#8C8480] dark:text-[#9E9692] leading-relaxed">
                  Our elite tier built for comprehensive annual optimization, investment alignment, and high-impact tax savings.
                </p>

                <div className="border-t border-[#EAE6DF] dark:border-[#242220] pt-4 sm:pt-6">
                  <ul className="space-y-3 sm:space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-[#FFF0EB] dark:bg-[#2E150F] p-0.5 rounded-full mt-0.5 text-[#FF6F43] shrink-0">
                        <span className="text-xs font-bold leading-none">✓</span>
                      </div>
                      <span className="text-xs font-semibold text-[#1A1715] dark:text-[#F8F6F0]">
                        End-to-End Filing: <span className="font-normal text-[#8C8480] dark:text-[#9E9692]">Multi-employer, stocks, or capital gains — fully handled.</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#FFF0EB] dark:bg-[#2E150F] p-0.5 rounded-full mt-0.5 text-[#FF6F43] shrink-0">
                        <span className="text-xs font-bold leading-none">✓</span>
                      </div>
                      <span className="text-xs font-semibold text-[#1A1715] dark:text-[#F8F6F0]">
                        Investment Planning: <span className="font-normal text-[#8C8480] dark:text-[#9E9692]">Maximize tax exemptions under optimal regimes.</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#FFF0EB] dark:bg-[#2E150F] p-0.5 rounded-full mt-0.5 text-[#FF6F43] shrink-0">
                        <span className="text-xs font-bold leading-none">✓</span>
                      </div>
                      <span className="text-xs font-semibold text-[#1A1715] dark:text-[#F8F6F0]">
                        Proactive Tax Planning: <span className="font-normal text-[#8C8480] dark:text-[#9E9692]">Structure salary &amp; deductions for future assessment years.</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#FFF0EB] dark:bg-[#2E150F] p-0.5 rounded-full mt-0.5 text-[#FF6F43] shrink-0">
                        <span className="text-xs font-bold leading-none">✓</span>
                      </div>
                      <span className="text-xs font-semibold text-[#1A1715] dark:text-[#F8F6F0]">
                        1-on-1 Consultation: <span className="font-normal text-[#8C8480] dark:text-[#9E9692]">Dedicated sessions with a senior tax strategist.</span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-5 sm:pt-8">
                <button
                  type="button"
                  onClick={() => selectPlanAndFocus('premium')}
                  className="w-full bg-[#FF6F43] hover:bg-[#E85A30] text-white py-3.5 rounded-[12px] font-bold text-sm transition-all shadow-[0_8px_24px_rgba(255,111,67,0.30)] active:scale-95 cursor-pointer"
                >
                  Select &amp; Pre-fill Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Form Section (Below the Offer) */}
      <section ref={formCardRef} id="lead-form" className="py-10 sm:py-20 px-4 sm:px-6 bg-[#F8F6F0] dark:bg-[#0F0E0E]">
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-[#171514] border border-[#EAE6DF] dark:border-[#242220] rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-[#1A1715] dark:text-[#F8F6F0] leading-tight text-center lg:text-left mb-4">
                Secure Your Filing Slot & Lock In 50% Off
              </h3>

              {/* Plan Selector tabs inside form */}
              <div className="grid grid-cols-2 gap-2 bg-[#F8F6F0] dark:bg-[#221F1E] p-1.5 rounded-[12px] border border-[#EAE6DF] dark:border-[#242220] mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('starter')}
                  className={`py-2 px-3 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
                    selectedPlan === 'starter'
                      ? 'bg-[#FF6F43] text-white shadow-sm'
                      : 'text-[#8C8480] dark:text-[#9E9692] hover:text-[#1A1715] dark:hover:text-[#F8F6F0]'
                  }`}
                >
                  Starter (₹999)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('premium')}
                  className={`py-2 px-3 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
                    selectedPlan === 'premium'
                      ? 'bg-[#FF6F43] text-white shadow-sm'
                      : 'text-[#8C8480] dark:text-[#9E9692] hover:text-[#1A1715] dark:hover:text-[#F8F6F0]'
                  }`}
                >
                  Premium (₹2,499)
                </button>
              </div>
              {/* Scarcity / Trust indicator badge */}
              <div className="bg-[#FFF0EB] dark:bg-[#2E150F] rounded-[12px] p-3 border border-[#FF6F43]/15 flex items-start gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-[#FF6F43] animate-ping shrink-0 mt-1"></span>
                <span className="text-[11px] font-bold text-[#FF6F43] dark:text-[#FF6F43] leading-snug uppercase tracking-wide text-left">
                  File before July 31 to avoid the ₹5,000 Section 234F penalty.
                </span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Hidden plan tracker */}
              <input type="hidden" name="plan" value={selectedPlan} />

              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-[#1A1715] dark:text-[#F8F6F0] uppercase tracking-wider mb-2">
                  Full Name <span className="text-[#FF6F43]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    ref={nameInputRef}
                    id="fullName"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full bg-[#F8F6F0] dark:bg-[#221F1E] border ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#EAE6DF] dark:border-[#242220] focus:ring-[#FF6F43]'
                    } rounded-[12px] pl-11 pr-4 py-3 text-sm text-[#1A1715] dark:text-[#F8F6F0] placeholder-[#8C8480]/60 dark:placeholder-[#9E9692]/40 focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-xs font-bold text-[#1A1715] dark:text-[#F8F6F0] uppercase tracking-wider mb-2">
                  Phone Number (+91) <span className="text-[#FF6F43]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pr-2.5 border-r border-[#EAE6DF] dark:border-[#242220]">
                    <Phone className="h-4 w-4" />
                    <span className="text-xs font-bold text-[#8C8480] dark:text-[#9E9692]">+91</span>
                  </span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    maxLength={10}
                    placeholder="90009 30453"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className={`w-full bg-[#F8F6F0] dark:bg-[#221F1E] border ${
                      errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-[#EAE6DF] dark:border-[#242220] focus:ring-[#FF6F43]'
                    } rounded-[12px] pl-20 pr-4 py-3 text-sm text-[#1A1715] dark:text-[#F8F6F0] placeholder-[#8C8480]/60 dark:placeholder-[#9E9692]/40 focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="emailAddress" className="block text-xs font-bold text-[#1A1715] dark:text-[#F8F6F0] uppercase tracking-wider mb-2">
                  Email Address <span className="text-xs text-[#8C8480] font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="emailAddress"
                    type="email"
                    placeholder="e.g. rahul@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full bg-[#F8F6F0] dark:bg-[#221F1E] border ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#EAE6DF] dark:border-[#242220] focus:ring-[#FF6F43]'
                    } rounded-[12px] pl-11 pr-4 py-3 text-sm text-[#1A1715] dark:text-[#F8F6F0] placeholder-[#8C8480]/60 dark:placeholder-[#9E9692]/40 focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF6F43] hover:bg-[#E85A30] text-white py-4 rounded-[12px] font-black text-sm sm:text-base transition-all shadow-[0_8px_24px_rgba(255,111,67,0.30)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    'Connecting with CA...'
                  ) : (
                    <>
                      {selectedPlan === 'starter' 
                        ? 'Secure Starter Assisted (₹999) Now ➔' 
                        : 'Secure Premium Strategy (₹2,499) Now ➔'}
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="text-[11px] text-center text-[var(--ds-text-muted)] font-medium leading-relaxed max-w-xs mx-auto">
              By submitting, you agree to receive filing updates and offers via WhatsApp and email.
            </p>

            <p className="text-[11px] text-center text-[#8C8480] dark:text-[#9E9692] font-semibold">
              No credit card required to secure your spot.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-b from-dark via-dark-100 to-black text-slate-300 pt-16 pb-8 border-t border-brand/10 relative overflow-hidden">
        {/* Glowing bottom accent line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand/20 to-transparent"></div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 text-left">
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
          
          {/* ── Regulatory & Policy Disclaimer ── */}
          <div className="border-t border-slate-800/40 pt-6 pb-6">
            <p className="text-[11px] leading-relaxed text-slate-500 text-center md:text-left">
              <span className="font-semibold text-slate-400">Disclaimer: </span>
              Deccan Filings is an independent, private CA-assisted professional services platform operated by{' '}
              <strong className="text-slate-300">TOR BUSINESS SOLUTIONS PRIVATE LIMITED</strong>. We are{' '}
              <strong className="text-slate-300">not affiliated with, endorsed by, or an official portal of</strong> the Income Tax
              Department of India, the Ministry of Corporate Affairs (MCA), the Registrar of Companies (RoC), or any other
              government authority. All third-party brand names, trademarks, logos, and government portal names referenced on
              this website are the property of their respective owners and are used solely for identification and descriptive
              purposes. Our professional service and consultation fees are{' '}
              <strong className="text-slate-300">entirely separate</strong> from any mandatory government filing fees,
              statutory dues, or taxes payable to government departments, which remain the sole responsibility of the
              applicant. Deccan Filings does not guarantee specific government processing timelines, approval outcomes, tax
              refund amounts, or results, as these are determined solely by the relevant government authority.
            </p>
          </div>

          {/* ── Copyright & Links ── */}
          <div className="border-t border-slate-800/40 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
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

      {/* Mobile Sticky CTA Bar */}
      <div
        className={`fixed bottom-0 left-0 w-full md:hidden z-40 transition-all duration-500 transform ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="bg-white/95 dark:bg-[#171514]/95 backdrop-blur-md border-t border-[#EAE6DF] dark:border-[#242220] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] p-3 flex items-center justify-between gap-3">
          <div className="text-left pl-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-[#FF6F43] tracking-widest block leading-none">ITR assisted filing</span>
            <div className="text-sm font-black text-[#1A1715] dark:text-[#F8F6F0] truncate">50% Off — Only ₹999</div>
          </div>
          <button
            onClick={() => scrollToSection(pricingRef)}
            className="bg-[#FF6F43] hover:bg-[#E85A30] text-white px-4 py-3 rounded-[10px] font-bold text-xs transition-all shadow-[0_8px_24px_rgba(255,111,67,0.30)] active:scale-95 cursor-pointer shrink-0"
          >
            Choose Plan
          </button>
        </div>
      </div>
    </div>
  );
}
