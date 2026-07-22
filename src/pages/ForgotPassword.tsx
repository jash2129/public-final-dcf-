import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message || 'Reset link has been sent to your email.');
      } else {
        setErrorMessage(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link to="/" className="flex items-center gap-2 mb-12 group inline-flex">
            <div className="bg-brand p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <Building2 className="h-6 w-6 text-dark" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-dark">Deccan Filings</span>
          </Link>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-dark mb-2">
              Forgot Password
            </h1>
            <p className="text-dark-400">
              Enter the email address associated with your account, and we will send you a link to reset your password.
            </p>
          </div>

          <div className="mt-10">
            {successMessage ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-800 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  <h3 className="font-bold text-lg text-emerald-950">Email Sent!</h3>
                </div>
                <p className="text-sm text-emerald-800/95 leading-relaxed">
                  {successMessage}
                </p>
                <div className="pt-2">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-950 hover:underline"
                  >
                    Return to sign in <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-dark mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-dark focus:outline-none focus:ring-1 focus:ring-dark sm:text-sm transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-dark py-3.5 px-4 text-sm font-bold text-white shadow-lg hover:bg-dark-200 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 disabled:opacity-70 transition-all"
                  >
                    {isLoading ? 'Sending Link...' : (
                      <>Send Reset Link <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-8 text-center text-sm text-dark-400">
              Remember your password?{' '}
              <Link to="/login" className="font-bold text-dark underline decoration-brand decoration-2 hover:text-secondary transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Image/Graphic */}
      <div className="hidden lg:flex flex-1 relative bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-end p-16 w-full max-w-2xl mx-auto h-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Secure access to your compliance <br />
              <span className="text-brand">simplified.</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Need assistance? Our dedicated support team is always available to help recover your account securely.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
