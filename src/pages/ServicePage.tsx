import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { CheckCircle, ChevronRight, Star, Shield, Clock, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { serviceCategories, generateSlug } from '../data/services';

export default function ServicePage() {
  const { category, slug } = useParams();

  // Find the actual service name from our data
  let serviceName = 'Service Not Found';
  const categoryData = serviceCategories.find(c => c.slug === category);
  if (categoryData && slug) {
    const foundService = categoryData.services.find(s => generateSlug(s) === slug);
    if (foundService) {
      serviceName = foundService;
    } else {
      // Fallback if not found in data
      serviceName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  
  const financeContent: Record<string, any> = {
    'loans': {
      whatIs: `Loans are financial instruments that provide you with the necessary capital to meet your personal or business goals. Whether it's for expanding your business, buying a home, or meeting immediate personal needs, our expert team helps you navigate the complex lending landscape to find the best rates and terms.`,
      whoNeeds: [
        { title: 'Entrepreneurs', desc: 'Looking for working capital or expansion funds.' },
        { title: 'Home Buyers', desc: 'Individuals seeking affordable housing finance.' },
        { title: 'SMEs', desc: 'Small businesses requiring collateral-free business loans.' }
      ],
      documents: [
        'PAN Card & Aadhaar Card',
        'Last 3 Years Income Tax Returns (ITR)',
        '6 Months Bank Statements',
        'Salary Slips / Business Proof',
        'Residence & Identity Proof'
      ],
      process: [
        { title: 'Credit Analysis', desc: 'We analyze your credit profile and financial health.' },
        { title: 'Bank Selection', desc: 'Choosing the right lender based on your eligibility.' },
        { title: 'Documentation', desc: 'Compiling and verifying your loan file for submission.' },
        { title: 'Sanction & Disbursal', desc: 'Following up for quick approval and fund transfer.' }
      ],
      faqs: [
        { q: 'What is the difference between secured and unsecured loans?', a: 'Secured loans require collateral (like property or gold), while unsecured loans (like personal loans) are given based on your income and credit score.' },
        { q: 'How does my CIBIL score affect my loan application?', a: 'A higher CIBIL score (above 750) increases your chances of approval and helps you get lower interest rates.' }
      ]
    },
    'insurance': {
      whatIs: `Insurance is a critical risk management tool that provides financial protection against unforeseen events. From health and life to general business assets, our insurance services ensure that you and your business are shielded from significant financial losses due to accidents, illnesses, or other liabilities.`,
      whoNeeds: [
        { title: 'Families', desc: 'Seeking financial security for their loved ones.' },
        { title: 'Business Owners', desc: 'Protecting assets, employees, and operations.' },
        { title: 'Individuals', desc: 'Planning for health emergencies and long-term savings.' }
      ],
      documents: [
        'ID Proof (PAN / Aadhaar)',
        'Age Proof (Birth Certificate / 10th Marksheet)',
        'Address Proof (Utilities / Passport)',
        'Recent Passport Size Photographs',
        'Medical Reports (if applicable)'
      ],
      process: [
        { title: 'Need Assessment', desc: 'Identifying the right type and amount of coverage.' },
        { title: 'Policy Comparison', desc: 'Comparing premiums and benefits across top providers.' },
        { title: 'Application Filing', desc: 'Submitting the proposal and required documents.' },
        { title: 'Policy Issuance', desc: 'Coordinating with insurers for quick policy delivery.' }
      ],
      faqs: [
        { q: 'What is the importance of Health Insurance?', a: 'Health insurance covers medical expenses, protecting your savings from high hospital costs during emergencies.' },
        { q: 'What is Term Life Insurance?', a: 'Term insurance provides a large life cover at a low premium for a specific period, ensuring your family\'s financial future.' }
      ]
    },
    'mutual-fund': {
      whatIs: `Mutual Funds are professionally managed investment vehicles that pool money from multiple investors to invest in a diversified portfolio of stocks, bonds, or other securities. They offer an accessible way to build wealth over the long term, managed by expert fund managers.`,
      whoNeeds: [
        { title: 'Long-term Investors', desc: 'Individuals planning for retirement or child education.' },
        { title: 'Wealth Maximizers', desc: 'Investors seeking higher returns than traditional FDs.' },
        { title: 'Tax Savers', desc: 'Taking advantage of ELSS schemes for Section 80C benefits.' }
      ],
      documents: [
        'PAN Card & Aadhaar (KYC)',
        'Bank Account Details',
        'Cancelled Cheque',
        'FATCA Declaration (for NRI investors)',
        'Digital Signature / Photo'
      ],
      process: [
        { title: 'Risk Profiling', desc: 'Determining your risk appetite and investment horizon.' },
        { title: 'Fund Selection', desc: 'Choosing top-performing funds across equity and debt.' },
        { title: 'KYC Verification', desc: 'Completing the standard KYC process online.' },
        { title: 'Investment Setup', desc: 'Starting your SIP or lump sum investment instantly.' }
      ],
      faqs: [
        { q: 'What is an SIP?', a: 'A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly (monthly) in a mutual fund scheme.' },
        { q: 'Are Mutual Funds risky?', a: 'Mutual funds carry market risks, but diversification and long-term investing help in managing these risks effectively.' }
      ]
    }
  };

  const specificContent = category === 'finance' ? financeContent[slug || ''] : null;

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', city: '' });

  const formCompleteness = useMemo(() => {
    let completedCount = 0;
    if (formData.name.trim()) completedCount++;
    if (formData.phone.trim()) completedCount++;
    if (formData.email.trim()) completedCount++;
    if (formData.city.trim()) completedCount++;
    return (completedCount / 4) * 100;
  }, [formData]);

  const defaultDocs = useMemo(() => {
    return specificContent?.documents || [
      'PAN Card of Directors/Partners',
      'Aadhaar Card / Voter ID',
      'Passport size photographs',
      'Address Proof (Electricity Bill / Rent Agreement)',
      'Bank Statement'
    ];
  }, [specificContent, serviceName]);

  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  const checklistProgress = useMemo(() => {
    const total = defaultDocs.length;
    const checked = Object.values(checkedDocs).filter(Boolean).length;
    return total === 0 ? 0 : Math.round((checked / total) * 100);
  }, [checkedDocs, defaultDocs]);

  const toggleDoc = (idx: number) => {
    setCheckedDocs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="bg-white">
      <Helmet>
        <title>{serviceName} | Deccan Filings India</title>
        <meta name="description" content={`Register for ${serviceName} online in India. 100% online process with expert CA/CS assistance. Fast, reliable, and affordable compliance services.`} />
        <meta property="og:title" content={`${serviceName} Registration - Deccan Filings`} />
        <meta property="og:description" content={`Get your ${serviceName} handled by experts. 10,000+ businesses served across India.`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": serviceName,
            "description": `Register for ${serviceName} online in India with expert assistance.`,
            "provider": {
              "@type": "Organization",
              "name": "Deccan Filings",
              "url": "https://www.deccan-filings.com"
            },
            "areaServed": "IN",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Compliance Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": serviceName
                  }
                }
              ]
            },
            "mainEntity": (specificContent?.faqs || [
              { q: `How long does it take to complete the ${serviceName} process?`, a: `Typically, the entire process takes about 3-5 working days...` },
              { q: `Is the process for ${serviceName} completely online?`, a: `Yes, our platform offers a 100% online process...` }
            ]).map((faq: any) => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })}
        </script>
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm text-dark-400">
          <Link to="/" className="hover:text-secondary">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/services" className="hover:text-secondary">Services</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to={`/services#${category}`} className="hover:text-secondary capitalize">{categoryData?.title || category?.replace('-', ' ')}</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-dark font-medium truncate max-w-[200px] sm:max-w-none">{serviceName}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="pr-0 lg:pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lightest text-dark text-sm font-bold mb-6 border border-brand-light">
            <span className="flex h-2 w-2 rounded-full bg-brand"></span>
            Fast & Reliable Service
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-dark mb-6 leading-tight">
            {serviceName}
          </h1>
          <p className="text-xl text-dark-400 mb-8 leading-relaxed">
            Register for {serviceName} in 3-5 working days. 100% online process with expert CA/CS assistance.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-flex">
            <div className="flex items-center text-brand">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current text-brand-light" />
            </div>
            <span className="text-dark-400 font-medium">4.8 (2,500+ reviews)</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-dark-400 font-medium">10,000+ filed</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-brand text-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-hover transition-all shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1">
              Get Started Now
            </button>
            <button className="bg-white text-dark border-2 border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:border-dark hover:bg-slate-50 transition-all">
              Talk to Expert
            </button>
          </div>
        </div>

        {/* Lead Capture Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-lightest to-white rounded-3xl transform rotate-3 scale-105 -z-10 border border-slate-100"></div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 lg:p-10 relative z-10">
            <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-brand to-secondary rounded-b-md"></div>
            <h3 className="text-3xl font-bold mb-2 text-dark">Request a Callback</h3>
            <p className="text-dark-400 mb-8">Get free expert consultation for {serviceName}.</p>
            
            {/* Form Progress Indicator */}
            <div className="mb-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                <span>Form Progress</span>
                <span>{formCompleteness}% Completed</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${formCompleteness}%` }}></div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white outline-none transition-all" 
                  placeholder="John Doe" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white outline-none transition-all" 
                  placeholder="+91 98765 43210" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white outline-none transition-all" 
                  placeholder="john@example.com" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-2">City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white outline-none transition-all" 
                  placeholder="Mumbai" 
                  required 
                />
              </div>
              <button type="submit" className="w-full bg-dark text-white px-4 py-4 rounded-xl font-bold text-lg hover:bg-dark-200 transition-all mt-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Submit Details
              </button>
              <p className="text-xs text-center text-dark-400 mt-6">
                By submitting, you agree to our Terms & Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-brand-lightest border-y border-brand-light py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Shield className="h-10 w-10 text-dark mb-4" />
            <h4 className="font-bold text-lg mb-2 text-dark">Govt. Authorized</h4>
            <p className="text-dark-400 text-sm">We are an authorized partner for government filings.</p>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="h-10 w-10 text-dark mb-4" />
            <h4 className="font-bold text-lg mb-2 text-dark">Fastest Processing</h4>
            <p className="text-dark-400 text-sm">Get your documents processed in record time.</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-10 w-10 text-dark mb-4" />
            <h4 className="font-bold text-lg mb-2 text-dark">Expert CA/CS Team</h4>
            <p className="text-dark-400 text-sm">Dedicated professionals to handle your case.</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            
            {/* What is it */}
            <div>
              <h2 className="text-3xl font-bold text-dark mb-6">What is {serviceName}?</h2>
              <p className="text-lg text-dark-400 leading-relaxed">
                {specificContent?.whatIs || `${serviceName} is a crucial compliance requirement for businesses operating in India. It ensures that your business is legally recognized and adheres to the statutory guidelines set by the government.`}
              </p>
            </div>

            {/* Who Needs This - Bento Grid */}
            <div>
              <h2 className="text-3xl font-bold text-dark mb-6">Who Needs This?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(specificContent?.whoNeeds || [
                  { title: 'Startups', desc: 'Looking for formal recognition and funding.' },
                  { title: 'SMEs', desc: 'Expanding operations and scaling up.' },
                  { title: 'Professionals', desc: 'Individuals providing specialized services.' }
                ]).map((item: any, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-brand transition-colors">
                    <div className="h-10 w-10 bg-brand-lightest rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-5 w-5 text-brand" />
                    </div>
                    <h3 className="font-bold text-lg text-dark mb-2">{item.title}</h3>
                    <p className="text-dark-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Required */}
            <div>
              <h2 className="text-3xl font-bold text-dark mb-6">Documents Required</h2>
              
              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-dark">Document Readiness Status</span>
                  <span className="text-sm font-black text-secondary">{checklistProgress}% Prepared</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all duration-300" style={{ width: `${checklistProgress}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Tick the boxes below to check off the documents you already have ready.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {defaultDocs.map((doc: any, i: number) => {
                  const isChecked = !!checkedDocs[i];
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleDoc(i)}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-secondary/5 border-secondary/40 shadow-sm' 
                          : 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                        isChecked 
                          ? 'bg-secondary border-secondary text-white shadow-sm' 
                          : 'border-slate-300 bg-slate-50'
                      }`}>
                        {isChecked && (
                          <svg className="h-3.5 w-3.5 stroke-white stroke-[3] fill-none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-bold leading-tight transition-all ${isChecked ? 'text-dark/50 line-through' : 'text-dark-400'}`}>
                        {doc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Process Steps */}
            <div>
              <h2 className="text-3xl font-bold text-dark mb-8">Process Steps</h2>
              <div className="relative border-l-2 border-brand ml-4 space-y-10">
                {(specificContent?.process || [
                  { title: 'Submit Documents', desc: 'Upload required documents securely on our portal.' },
                  { title: 'Expert Verification', desc: 'Our CA team verifies the documents for accuracy.' },
                  { title: 'Application Filing', desc: 'We file the application with the respective government department.' },
                  { title: 'Approval & Delivery', desc: 'Receive the final certificate in your dashboard.' }
                ]).map((step: any, i: number) => (
                  <div key={i} className="relative pl-10">
                    <div className="absolute -left-[17px] top-0 h-8 w-8 rounded-full bg-brand text-dark font-bold flex items-center justify-center border-4 border-white shadow-sm">
                      {i + 1}
                    </div>
                    <h4 className="font-bold text-xl text-dark mb-2">{step.title}</h4>
                    <p className="text-dark-400">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="pt-8">
              <h2 className="text-3xl font-bold text-dark mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {(specificContent?.faqs || [
                  {
                    q: `How long does it take to complete the ${serviceName} process?`,
                    a: `Typically, the entire process takes about 3-5 working days, provided all required documents are submitted correctly and verified.`
                  },
                  {
                    q: `Is the process for ${serviceName} completely online?`,
                    a: `Yes, our platform offers a 100% online process. You can securely upload your documents and track the progress directly from your dashboard without visiting any office.`
                  },
                  {
                    q: `What are the prerequisites for ${serviceName}?`,
                    a: `The prerequisites generally include basic identity proofs (PAN, Aadhaar), address proofs, and relevant business documents. Our experts will provide a customized checklist once you start.`
                  },
                  {
                    q: `Do I need to visit any government office?`,
                    a: `No, our expert CA/CS team handles all the paperwork and liaisons with the respective government departments on your behalf.`
                  }
                ]).map((faq: any, i: number) => (
                  <details key={i} className="group bg-white border border-slate-200 rounded-xl [&_summary::-webkit-details-marker]:hidden shadow-sm hover:shadow-md transition-shadow">
                    <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-lg text-dark">
                      <span className="pr-6">{faq.q}</span>
                      <span className="transition-transform duration-300 group-open:-rotate-180 text-brand shrink-0">
                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-dark-400 leading-relaxed">
                      <p>{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
            
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-brand-lightest rounded-2xl p-8 border border-brand-light">
              <h3 className="text-2xl font-bold text-dark mb-4">Need Help?</h3>
              <p className="text-dark-400 mb-6">Our experts are available to guide you through the {serviceName} process.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Clock className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Response Time</p>
                    <p className="font-bold text-dark">Under 15 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Users className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Expert Support</p>
                    <p className="font-bold text-dark">Dedicated CA/CS</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-dark text-white px-4 py-3 rounded-md font-bold hover:bg-dark-200 transition-colors mt-8">
                Talk to Expert Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
