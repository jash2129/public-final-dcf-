import { FileCheck, AlertCircle, Scale, Gavel } from 'lucide-react';
import SEO from '../components/SEO';

export default function TermsOfService() {
  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Terms of Service | Deccan Filings" 
        description="Read the terms and conditions governing the use of Deccan Filings services for your business and legal compliance."
      />
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-dark p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 blur-3xl rounded-full -translate-y-1/2 -translate-x-1/2"></div>
          <Scale className="h-16 w-16 text-secondary mx-auto mb-6 relative z-10" />
          <h1 className="text-4xl font-bold text-white mb-4 relative z-10">Terms of Service</h1>
          <p className="text-slate-400 relative z-10">Last Updated: April 14, 2026</p>
        </div>
        
        <div className="p-12 prose prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-slate-600">
          <p>By accessing or using Deccan Filings, you agree to be bound by these Terms of Service. Deccan Filings is a brand wholly owned and operated by <strong>TOR BUSINESS SOLUTIONS PRIVATE LIMITED.</strong> Please read them carefully before using our platform.</p>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <FileCheck className="h-6 w-6 text-secondary" /> 1. Services Provided
          </h2>
          <p>Deccan Filings acts as a facilitator for various business, tax, and compliance filings. We provide expert assistance and a cloud-based platform to simplify the interaction with government departments. We are a private entity and NOT affiliated with any government agency.</p>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <AlertCircle className="h-6 w-6 text-secondary" /> 2. User Responsibilities
          </h2>
          <p>As a user, you are responsible for providing accurate, complete, and authentic information and documents. Deccan Filings is not liable for any penalties or delays resulting from inaccurate or fraudulent data provided by the user.</p>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <Gavel className="h-6 w-6 text-secondary" /> 3. Professional Advice
          </h2>
          <p>The information provided on this website is for general informational purposes and does not constitute legal or financial advice. While we strive for accuracy, business laws and government regulations change frequently.</p>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <AlertCircle className="h-6 w-6 text-secondary" /> 4. Limitation of Liability
          </h2>
          <p>Deccan Filings shall not be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our services, including but not limited to lost profits or government penalties due to delayed filings not caused by our gross negligence.</p>

          <div className="mt-16 pt-8 border-t border-slate-100 text-center space-y-4">
            <p className="text-sm text-slate-400">For clarifications regarding these terms, please contact <strong>legal@deccanfilings.com</strong></p>
            <div className="text-sm text-slate-500">
              <p className="font-bold text-dark">Registered Office:</p>
              <p><strong>TOR BUSINESS SOLUTIONS PRIVATE LIMITED</strong></p>
              <p>Third Floor, Union Bank Building, 53/3RT and 7-1-621/261,</p>
              <p>Thabga Terrain, SR Nagar Main Road,</p>
              <p>Ameerpet, Hyderabad, Telangana - 500038.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
