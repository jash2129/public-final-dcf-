import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare } from 'lucide-react';
import { footerNavigation } from '../../data/footerNavigation';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-dark via-dark-100 to-black text-slate-300 pt-16 pb-8 border-t border-brand/10 relative overflow-hidden">
      {/* Glowing bottom accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand/20 to-transparent"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Left Side: Brand (2 cols) */}
          <div className="lg:col-span-2 pr-0 lg:pr-8">
            <div className="inline-flex items-center mb-6">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img 
                  src="/logo.png" 
                  alt="Deccan Filings Footer Logo" 
                  loading="lazy"
                  width="160"
                  height="40"
                  className="h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
                />
              </picture>
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
          
          {/* Right Side: Navigation (4 cols) */}
          <nav aria-label="Footer Navigation" className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {footerNavigation.map((column, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-8">
                {column.groups.map(group => (
                  <div key={group.title}>
                    <h3 className="font-bold text-white mb-5 uppercase text-xs tracking-wider">{group.title}</h3>
                    <ul className="space-y-3">
                      {group.links.map(link => (
                        <li key={link.name}>
                          <Link 
                            to={link.path} 
                            className="text-sm text-slate-400 hover:text-white transition-colors relative py-0.5 inline-block after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </nav>

        </div>
        
        {/* ── Regulatory & Policy Disclaimer ── */}
        <section aria-labelledby="footer-disclaimer" className="border-t border-slate-800/40 pt-8 pb-8">
          <h2 id="footer-disclaimer" className="sr-only">Legal Disclaimer</h2>
          <div className="space-y-4 text-[11px] leading-relaxed text-slate-500 text-center md:text-left max-w-7xl">
            <p>
              Deccan Filings is an independent, private CA-assisted professional services platform operated by{' '}
              <strong className="text-slate-300 font-medium">TOR BUSINESS SOLUTIONS PRIVATE LIMITED</strong>. We are{' '}
              <strong className="text-slate-300 font-medium">not affiliated with, endorsed by, or an official portal of</strong> the Income Tax
              Department of India, the Ministry of Corporate Affairs (MCA), the Registrar of Companies (RoC), or any other{' '}
              <strong className="text-slate-300 font-medium">government authority</strong>.
            </p>
            <p>
              Our professional consultation fees are{' '}
              <strong className="text-slate-300 font-medium">entirely separate</strong> from any mandatory statutory government fees,
              dues, or taxes payable to government departments, which remain the applicant's sole responsibility. We do not guarantee
              specific government processing timelines, approval outcomes, or tax refund amounts.
            </p>
            <p>
              All third-party brand names, trademarks, logos, and government portal names referenced on this website are the property
              of their respective owners and are used solely for descriptive purposes.
            </p>
          </div>
        </section>

        {/* ── Copyright & Links ── */}
        <div className="border-t border-slate-800/40 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="text-center md:text-left">
            <p>© 2026 Deccan Filings. A brand owned and operated by <strong className="text-white font-medium">TOR BUSINESS SOLUTIONS PRIVATE LIMITED</strong>. All rights reserved.</p>
          </div>
          <div className="flex gap-4 items-center">
            <a href="https://www.youtube.com/@Deccanfilings" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://www.instagram.com/deccan_filings/?hl=en" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/135255953/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://twitter.com/deccan_filings" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590411898154" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
