import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, ShieldCheck, ShieldOff, Search, RefreshCw, Crown, UserCheck, UserX, Key, X } from 'lucide-react';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
}

const RoleBadge = ({ role }: { role: string }) => {
  const config = {
    super_admin: { label: 'Super Admin', bg: 'bg-purple-100', text: 'text-purple-700', icon: Crown },
    admin: { label: 'Admin', bg: 'bg-brand-lightest', text: 'text-dark', icon: ShieldCheck },
    user: { label: 'User', bg: 'bg-slate-100', text: 'text-slate-600', icon: Shield },
  }[role] ?? { label: role, bg: 'bg-slate-100', text: 'text-slate-600', icon: Shield };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

export default function ManageAdmins() {
  const { id } = useParams<{ id: string }>();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRoleChange = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promote to Admin' : 'demote to User';
    if (!confirm(`Are you sure you want to ${action}?`)) return;

    setUpdatingId(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      await fetchUsers();
      showToast(`User successfully ${newRole === 'admin' ? 'promoted to Admin' : 'demoted to User'}.`, 'success');
    } catch (err) {
      showToast('Failed to update role. Please try again.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetPasswordUserId || !newPassword) return;
    if (newPassword.length < 6) return showToast('Password must be at least 6 characters.', 'error');

    setUpdatingId(resetPasswordUserId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${resetPasswordUserId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!response.ok) throw new Error('Failed to reset password');
      showToast('User password successfully updated.', 'success');
      setResetPasswordUserId(null);
      setNewPassword('');
    } catch (err) {
      showToast('Failed to reset password. Please try again.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredUsers = users.filter((u) => {
    if (id && u.id.toString() !== id) return false;
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    regularUsers: users.filter((u) => u.role === 'user').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Manage Admins</h1>
          <p className="text-slate-500 text-sm mt-1">Promote users to admin or revoke admin privileges.</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark text-white rounded-xl text-sm font-bold hover:bg-dark/90 transition-all shadow-md disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Regular Users', value: stats.regularUsers, icon: Shield, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
            />
          </div>
          <p className="text-sm text-slate-400 whitespace-nowrap">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                      <span className="text-sm">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500 text-sm">{error}</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuperAdmin = user.role === 'super_admin';
                  const isUpdating = updatingId === user.id;
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <motion.tr
                      key={user.id}
                      layout
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm ${
                              isSuperAdmin
                                ? 'bg-purple-600 text-white'
                                : user.role === 'admin'
                                ? 'bg-dark text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {initials}
                          </div>
                          <span className="text-sm font-semibold text-dark">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-500 font-bold px-3 py-1.5 bg-purple-50 rounded-lg">
                            <Crown className="h-3 w-3" /> Protected
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                             <button
                              onClick={() => setResetPasswordUserId(user.id)}
                              className="p-1.5 text-slate-400 hover:text-dark hover:bg-slate-100 rounded-lg transition-colors"
                              title="Reset Password"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRoleChange(user.id, user.role)}
                              disabled={isUpdating}
                              title={user.role === 'admin' ? 'Revoke Admin' : 'Promote to Admin'}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                                user.role === 'admin'
                                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                            >
                              {isUpdating && updatingId === user.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : user.role === 'admin' ? (
                                <UserX className="h-3.5 w-3.5" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                              {isUpdating && updatingId === user.id
                                ? 'Updating...'
                                : user.role === 'admin'
                                ? 'Revoke'
                                : 'Make Admin'}
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length > 0 && (
          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
            <ShieldOff className="h-3.5 w-3.5" />
            <span>Super Admin accounts cannot be modified from this panel.</span>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetPasswordUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetPasswordUserId(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-lightest p-2 rounded-xl">
                      <Key className="h-5 w-5 text-dark" />
                    </div>
                    <h3 className="text-xl font-bold text-dark">Reset Password</h3>
                  </div>
                  <button onClick={() => setResetPasswordUserId(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-6">Enter a new secure password for this user. They will need this to log in starting now.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">New Password</label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setResetPasswordUserId(null)}
                      className="flex-1 py-3 px-4 border border-slate-200 text-dark font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handlePasswordReset}
                      disabled={!newPassword || newPassword.length < 6 || updatingId !== null}
                      className="flex-1 py-3 px-4 bg-dark text-white font-bold rounded-xl text-sm shadow-lg hover:bg-dark/90 transition-all disabled:opacity-50"
                    >
                      {updatingId ? 'Updating...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-8 right-8 z-50 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-dark text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <ShieldCheck className="h-5 w-5 text-brand flex-shrink-0" />
            ) : (
              <ShieldOff className="h-5 w-5 flex-shrink-0" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
