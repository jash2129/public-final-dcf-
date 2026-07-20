import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Exact 10 digit validation
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) {
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // Use the generic profile update endpoint
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // We only send the 10 digits; the backend will prefix +91 via formatPhoneWithCountryCode
        body: JSON.stringify({
          phone: phone,
          name: user.name,
          email: user.email
        }),
      });
      
      if (response.ok) {
        // Refresh the user profile to get the properly formatted phone
        const userRes = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
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
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Complete Profile | Deccan Filings</title>
      </Helmet>
      
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-bl-full opacity-50 blur-xl pointer-events-none" />
        
        <div className="flex justify-center mb-6">
          <div className="bg-brand p-2 rounded-xl">
            <Building2 className="h-8 w-8 text-dark" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-dark mb-2 tracking-tight text-center">Complete Your Profile</h1>
        <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed text-center">
          For security and communication purposes, a valid mobile number is required to access your dashboard.
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium mb-6 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Mobile Number
            </label>
            <div className="flex rounded-xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand focus-within:border-brand transition-all">
              <span className="inline-flex items-center px-4 rounded-l-xl border-r border-slate-200 bg-slate-100 text-slate-500 sm:text-sm font-bold select-none">
                +91
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setPhone(val);
                }}
                placeholder="Enter 10-digit mobile number"
                className="flex-1 block w-full min-w-0 px-4 py-3 sm:text-sm bg-slate-50 focus:bg-white focus:outline-none font-bold text-dark transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.length !== 10}
            className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-dark py-3.5 px-4 text-sm font-bold text-white shadow-lg hover:bg-dark-200 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 disabled:opacity-70 disabled:hover:translate-y-0 transition-all"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>Continue to Dashboard <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
