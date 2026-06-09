import { Link } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <Ghost className="h-32 w-32 text-slate-300 animate-bounce" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-dark/10">404</div>
          </div>
        </motion.div>
        
        <h1 className="text-4xl font-black text-dark mb-4">Lost in Compliance?</h1>
        <p className="text-slate-500 mb-10 text-lg">The page you're looking for was recently moved, filed away, or simply doesn't exist.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-dark text-white rounded-2xl font-bold hover:bg-dark/90 transition-all shadow-lg hover:shadow-xl"
          >
            <Home className="h-5 w-5" /> Back Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-dark border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" /> Go Back
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-400">Need help? <Link to="/contact" className="text-secondary hover:underline font-bold">Contact our expert team</Link></p>
        </div>
      </div>
    </div>
  );
}
