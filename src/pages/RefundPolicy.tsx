import { RefreshCcw, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-dark p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <RefreshCcw className="h-16 w-16 text-emerald-400 mx-auto mb-6 relative z-10" />
          <h1 className="text-4xl font-bold text-white mb-4 relative z-10">Refund Policy</h1>
          <p className="text-slate-400 relative z-10">Last Updated: April 14, 2026</p>
        </div>
        
        <div className="p-12 prose prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-slate-600">
          <p>We strive to provide the best service possible. Our cancellation and refund policy is designed to be fair to both our clients and our professional team who dedicate time to your filings.</p>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" /> 1. When a Refund is Applicable
          </h2>
          <p>A full or partial refund of professional fees may be processed if:</p>
          <ul>
            <li>Service was not initiated by our team within 72 hours of complete document submission.</li>
            <li>We are unable to process your request due to internal error or capacity issues.</li>
            <li>Duplicate payment was made accidentally for the same service.</li>
          </ul>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <XCircle className="h-6 w-6 text-red-400" /> 2. When a Refund is NOT Applicable
          </h2>
          <p>Refunds will not be issued in the following scenarios:</p>
          <ul>
            <li>Government fees once paid are generally non-refundable.</li>
            <li>Work has already been initiated or filed with the government authorities.</li>
            <li>Rejection by government authorities due to issues beyond our control (e.g., duplicate names, inadequate qualification).</li>
            <li>Change of mind by the user after work has commenced.</li>
          </ul>

          <h2 className="flex items-center gap-3 mt-10 mb-6">
            <HelpCircle className="h-6 w-6 text-emerald-500" /> 3. Requesting a Refund
          </h2>
          <p>To request a refund, please email <strong>refunds@deccanfilings.com</strong> with your Order ID and the reason for the request. All requests are processed within 10-15 working days.</p>

          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400">Questions? Chat with our support team or email <strong>support@deccanfilings.com</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
