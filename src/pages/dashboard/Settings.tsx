import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, CreditCard, Save, CheckCircle, AlertCircle, Loader2, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessOverlay from '../../components/ui/SuccessOverlay';
import Skeleton from '../../components/ui/Skeleton';
import { useTheme } from '../../context/ThemeContext';

type Tab = 'profile' | 'security' | 'notifications' | 'billing' | 'appearance';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    company_name: '',
    address: '',
    gstin: '',
    avatar: '',
    notification_prefs: { email: true, sms: false }
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        } else {
          throw new Error(`Server Error (${response.status})`);
        }
      }

      const data = await response.json();
      
      let prefs = data.notification_prefs;
      if (typeof prefs === 'string') {
        try {
          prefs = JSON.parse(prefs);
        } catch (e) {
          prefs = { email: true, sms: false };
        }
      }

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        whatsapp_number: data.whatsapp_number || '',
        company_name: data.company_name || '',
        address: data.address || '',
        gstin: data.gstin || '',
        avatar: data.avatar || '',
        notification_prefs: prefs || { email: true, sms: false }
      });
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      showMessage('error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMessage(text);
      setShowSuccess(true);
    } else {
      setMessage({ type, text });
      setTimeout(() => setMessage(null), 5000);
    }
  };


  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Server Error (${response.status})` };
      }

      if (response.ok) {
        showMessage('success', 'Profile updated successfully');
        // Update local storage user data
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.name = formData.name;
          user.email = formData.email;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        showMessage('error', errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      showMessage('error', 'Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword.length < 6) {
      return showMessage('error', 'New password must be at least 6 characters long');
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      return showMessage('error', 'New passwords do not match');
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });

      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Server Error (${response.status})` };
      }

      if (response.ok) {
        showMessage('success', 'Password updated successfully');
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showMessage('error', errorData.error || 'Failed to update password');
      }
    } catch (error) {
      showMessage('error', 'Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (type: 'email' | 'sms') => {
    const newPrefs = { ...formData.notification_prefs, [type]: !formData.notification_prefs[type as keyof typeof formData.notification_prefs] };
    setFormData({ ...formData, notification_prefs: newPrefs });
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrefs)
      });
      if (!response.ok) {
        showMessage('error', 'Failed to update notification preferences');
      }
    } catch (error) {
      showMessage('error', 'Network error.');
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return showMessage('error', 'Please select an image file');
    }

    if (file.size > 1024 * 1024) {
      return showMessage('error', 'Image size must be less than 1MB');
    }

    setSaving(true);
    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
        showMessage('success', 'Avatar updated successfully');
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || 'Failed to upload avatar');
      }
    } catch (error) {
      showMessage('error', 'Error uploading avatar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        
        <div className="bg-white rounded-2xl border border-[var(--ds-border)] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          {/* Sidebar Skeleton */}
          <div className="w-full md:w-64 bg-[var(--ds-bg)] border-b md:border-b-0 md:border-r border-[var(--ds-border)] p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          
          {/* Content Skeleton */}
          <div className="flex-1 p-6 md:p-8">
            <Skeleton className="h-6 w-48 mb-8" />
            
            <div className="flex items-center gap-6 mb-8">
              <Skeleton variant="circle" className="h-20 w-20 shrink-0" />
              <div className="space-y-3 w-full max-w-xs">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing Details', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-[var(--ds-border)] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-[var(--ds-bg)] border-b md:border-b-0 md:border-r border-[var(--ds-border)] p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-white text-[var(--ds-text)] shadow-sm border border-[var(--ds-border)]' 
                    : 'text-[var(--ds-text-muted)] hover:bg-white hover:text-[var(--ds-text)]'
                }`}
              >
                <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-brand' : 'text-[var(--ds-text-muted)]'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold text-dark mb-6">Profile Information</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="h-20 w-20 bg-dark text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-md uppercase overflow-hidden border-2 border-brand-light">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                  )}
                </div>
                <div>
                  <input 
                    type="file" 
                    id="avatar-input" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                  />
                  <button 
                    type="button"
                    onClick={() => document.getElementById('avatar-input')?.click()}
                    className="bg-dark text-white px-5 py-2 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all shadow-lg active:scale-95 mb-2"
                  >
                    Change Photo
                  </button>
                  <p className="text-xs text-slate-500 font-medium">JPG, GIF or PNG. Max size of 1MB</p>

                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-dark mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 00000 00000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      placeholder="e.g. 9876543210"
                      pattern="^\+?[0-9]{10,15}$"
                      title="Please enter a valid WhatsApp number (10-15 digits)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">Company Name</label>
                    <input 
                      type="text" 
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => fetchProfile()} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-dark hover:bg-slate-50 transition-colors">
                    Reset
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-dark-200 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold text-dark mb-6">Security Settings</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="max-w-md space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-start">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-dark-200 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold text-dark mb-6">Notification Preferences</h2>
              <p className="text-slate-500 text-sm mb-8">Choose how you want to receive updates about your orders and compliance status.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-brand">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-dark">Email Notifications</p>
                      <p className="text-xs text-slate-500">Updates about orders, invoices and compliance</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNotificationToggle('email')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.notification_prefs.email ? 'bg-brand' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notification_prefs.email ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-400">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-dark">SMS Notifications</p>
                      <p className="text-xs text-slate-500">Critical alerts and filing reminders via mobile</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNotificationToggle('sms')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.notification_prefs.sms ? 'bg-brand' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notification_prefs.sms ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold text-dark mb-6">Billing & Tax Details</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">GSTIN (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      placeholder="Enter 15-digit GSTIN"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">Registered Address</label>
                    <textarea 
                      rows={4}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your full business address"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-dark-200 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Billing Details
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold text-dark mb-6">Appearance Settings</h2>
              <p className="text-slate-500 text-sm mb-8">Customize how Deccan Filings looks on your device.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Light Mode Option */}
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                    theme === 'light'
                      ? 'border-brand ring-2 ring-brand/10 bg-brand/5'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="h-24 w-full bg-slate-50 rounded-xl mb-4 border border-slate-200 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-8 bg-white border-r border-slate-200 flex flex-col p-1 gap-1">
                      <div className="h-2 w-full bg-slate-100 rounded-sm"></div>
                      <div className="h-2 w-full bg-slate-100 rounded-sm"></div>
                    </div>
                    <div className="flex-1 p-2 flex flex-col gap-1.5">
                      <div className="h-3 w-16 bg-slate-200 rounded-md"></div>
                      <div className="h-8 w-full bg-white rounded-lg border border-slate-200 p-1 flex flex-col gap-1">
                        <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                        <div className="h-1 w-2/3 bg-slate-100 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-brand' : 'text-slate-500'}`} />
                    <span className="font-bold text-sm text-dark">Light Mode</span>
                  </div>
                </button>

                {/* Dark Mode Option */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                    theme === 'dark'
                      ? 'border-brand ring-2 ring-brand/10 bg-[var(--ds-coral-soft)]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="h-24 w-full bg-[#121212] rounded-xl mb-4 border border-[#242220] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-8 bg-[#171514] border-r border-[#242220] flex flex-col p-1 gap-1">
                      <div className="h-2 w-full bg-[#242220] rounded-sm"></div>
                      <div className="h-2 w-full bg-[#242220] rounded-sm"></div>
                    </div>
                    <div className="flex-1 p-2 flex flex-col gap-1.5">
                      <div className="h-3 w-16 bg-[#242220] rounded-md"></div>
                      <div className="h-8 w-full bg-[#171514] rounded-lg border border-[#242220] p-1 flex flex-col gap-1">
                        <div className="h-1 w-full bg-[#242220] rounded-sm"></div>
                        <div className="h-1 w-2/3 bg-[#242220] rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-brand' : 'text-slate-500'}`} />
                    <span className="font-bold text-sm text-dark">Dark Mode</span>
                  </div>
                </button>

                {/* System Mode Option */}
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                    theme === 'system'
                      ? 'border-brand ring-2 ring-brand/10 bg-brand/5'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="h-24 w-full bg-slate-50 rounded-xl mb-4 border border-slate-200 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex">
                      <div className="flex-1 bg-slate-100 flex items-center justify-center border-r border-slate-200">
                        <Sun className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex-1 bg-[#121212] flex items-center justify-center">
                        <Moon className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className={`h-4 w-4 ${theme === 'system' ? 'text-brand' : 'text-slate-500'}`} />
                    <span className="font-bold text-sm text-dark">System Default</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <SuccessOverlay 
        isVisible={showSuccess} 
        message={successMessage} 
        onComplete={() => setShowSuccess(false)} 
      />
    </div>
  );
}
