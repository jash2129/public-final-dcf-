import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const initialName = searchParams.get('name') || '';
  const initialEmail = searchParams.get('email') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [showCRMModal, setShowCRMModal] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [crmData, setCrmData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [crmLoading, setCrmLoading] = useState(false);
  const [crmError, setCrmError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const result = await response.json();
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential: tokenResponse.access_token }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.isNewUser) {
            setTempToken(result.token);
            setCrmData({
              name: result.user.name || '',
              email: result.user.email || '',
              phone: '',
            });
            setShowCRMModal(true);
            setIsLoading(false);
          } else {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            if (result.user.role === 'admin' || result.user.role === 'super_admin') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }
        } else {
          const result = await response.json();
          alert(result.error || 'Google login failed');
        }
      } catch (error) {
        console.error('Google login error:', error);
        alert('An error occurred during Google login');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Sign-In failed:', error);
      alert('Google Sign-In failed');
    }
  });

  const handleCRMSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmData.phone.trim()) {
      setCrmError('Phone number is required');
      return;
    }
    
    setCrmLoading(true);
    setCrmError('');
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({
          name: crmData.name,
          email: crmData.email,
          phone: crmData.phone,
        }),
      });
      
      if (response.ok) {
        localStorage.setItem('token', tempToken);
        const userRes = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${tempToken}`
          }
        });
        if (userRes.ok) {
          const finalUser = await userRes.json();
          localStorage.setItem('user', JSON.stringify(finalUser));
          if (finalUser.role === 'admin' || finalUser.role === 'super_admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          localStorage.setItem('user', JSON.stringify({
            name: crmData.name,
            email: crmData.email,
            phone: crmData.phone,
            role: 'user'
          }));
          navigate('/dashboard');
        }
      } else {
        const errorData = await response.json();
        setCrmError(errorData.error || 'Failed to save profile details');
      }
    } catch (err) {
      console.error(err);
      setCrmError('An error occurred. Please try again.');
    } finally {
      setCrmLoading(false);
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
            <h2 className="text-3xl font-bold tracking-tight text-dark mb-2">
              Create an account
            </h2>
            <p className="text-dark-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-dark underline decoration-brand decoration-2 hover:text-secondary transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-dark mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-dark focus:outline-none focus:ring-1 focus:ring-dark sm:text-sm transition-all bg-slate-50 focus:bg-white"
                  placeholder="John Doe"
                  defaultValue={initialName}
                />
              </div>

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
                  className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-dark focus:outline-none focus:ring-1 focus:ring-dark sm:text-sm transition-all bg-slate-50 focus:bg-white"
                  placeholder="john@example.com"
                  defaultValue={initialEmail}
                />
              </div>

              <div>
                <label htmlFor="whatsapp_number" className="block text-sm font-bold text-dark mb-2">
                  WhatsApp Number
                </label>
                <input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  type="tel"
                  inputMode="numeric"
                  required
                  pattern="^\+?[0-9]{10,15}$"
                  title="Please enter a valid WhatsApp number (10-15 digits)"
                  className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-dark focus:outline-none focus:ring-1 focus:ring-dark sm:text-sm transition-all bg-slate-50 focus:bg-white"
                  placeholder="e.g. 9876543210"
                  defaultValue={initialPhone}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-dark mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-dark focus:outline-none focus:ring-1 focus:ring-dark sm:text-sm transition-all bg-slate-50 focus:bg-white"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-dark py-3.5 px-4 text-sm font-bold text-white shadow-lg hover:bg-dark-200 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 disabled:opacity-70 transition-all"
                >
                  {isLoading ? 'Creating account...' : (
                    <>Sign up <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-400 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="inline-flex w-full justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-dark shadow-sm hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                  </svg>
                  Google
                </button>
              </div>
            </div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6 backdrop-blur-md">
              <Star className="h-4 w-4 text-brand fill-current" />
              Trusted by 100,000+ Businesses
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Manage your compliance <br />
              <span className="text-brand">all in one place.</span>
            </h3>
            
            <div className="space-y-4 mt-8">
              {[
                'Real-time application tracking',
                'Secure document vault',
                'Automated compliance reminders',
                'Direct chat with CA/CS experts'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {showCRMModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-dark/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-bl-full opacity-50 blur-xl pointer-events-none" />
            
            <h3 className="text-2xl font-black text-dark mb-2 tracking-tight">Complete Your Profile</h3>
            <p className="text-sm text-slate-500 mb-6 font-bold leading-relaxed">
              We need a few details to register your account and configure CRM integration.
            </p>

            {crmError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {crmError}
              </div>
            )}

            <form onSubmit={handleCRMSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={crmData.name}
                  onChange={(e) => setCrmData({ ...crmData, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all font-bold text-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={crmData.email}
                  onChange={(e) => setCrmData({ ...crmData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all font-bold text-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={crmData.phone}
                  onChange={(e) => setCrmData({ ...crmData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all font-bold text-dark"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCRMModal(false);
                    setIsLoading(false);
                  }}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-dark hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crmLoading}
                  className="flex-1 py-3 px-4 bg-dark text-white rounded-xl text-sm font-bold hover:bg-dark-200 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {crmLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save & Continue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
