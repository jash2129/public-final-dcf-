import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-dark p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <Shield className="h-16 w-16 text-brand mx-auto mb-6 relative z-10" />
          <h1 className="text-4xl font-bold text-white mb-4 relative z-10">Privacy Policy</h1>
          <p className="text-slate-400 relative z-10">Last Updated: April 14, 2026</p>
        </div>
        
        <div className="p-12 prose prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600">
          <p>Trust is the foundation of our relationship with our clients. This Privacy Policy describes how Deccan Filings collects, uses, and protects your personal information when you use our website and services.</p>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <Eye className="h-6 w-6 text-brand" /> 1. Information We Collect
          </h2>
          <p>We collect information that you provide directly to us when you register for an account, request a service, or communicate with us. This may include:</p>
          <ul>
            <li>Name, email address, and phone number</li>
            <li>Business details (Company name, Address, GSTIN)</li>
            <li>Documents required for compliance (Aadhaar, PAN, etc.)</li>
            <li>Payment information (processed securely via our payment partners)</li>
          </ul>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <Lock className="h-6 w-6 text-brand" /> 2. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your service requests and filings with government authorities</li>
            <li>Provide customer support and technical assistance</li>
            <li>Send important updates regarding your filings and compliance deadlines</li>
            <li>Improve our platform and user experience</li>
          </ul>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <Shield className="h-6 w-6 text-brand" /> 3. Data Security
          </h2>
          <p>We implement bank-grade security measures to protect your data. All document transfers are encrypted, and your sensitive personal information is stored securely. We never sell your personal data to third parties.</p>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <FileText className="h-6 w-6 text-brand" /> 4. Your Rights
          </h2>
          <p>You have the right to access, correct, or delete your personal information stored on our platform. You can manage your profile settings or contact our support team for any data-related requests.</p>

          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400">If you have any questions about this Privacy Policy, please contact us at <strong>privacy@deccanfilings.com</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
