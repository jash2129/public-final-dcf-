import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  History, 
  FileUp, 
  Edit3, 
  Trash2, 
  UserCog, 
  RefreshCw, 
  Search,
  Clock,
  User,
  MoreHorizontal
} from 'lucide-react';

interface ActivityLogItem {
  id: number;
  user_id: number;
  action: string;
  details: string;
  timestamp: string;
  user_name: string;
  user_email: string;
}

const ActionIcon = ({ action }: { action: string }) => {
  switch (action) {
    case 'UPLOAD':
      return <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileUp className="h-4 w-4" /></div>;
    case 'RENAME':
    case 'ADMIN_RENAME':
      return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit3 className="h-4 w-4" /></div>;
    case 'DELETE':
    case 'ADMIN_DELETE':
      return <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></div>;
    case 'ROLE_CHANGE':
      return <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><UserCog className="h-4 w-4" /></div>;
    default:
      return <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><History className="h-4 w-4" /></div>;
  }
};

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Global Activity Log</h1>
          <p className="text-slate-500 text-sm mt-1">Audit trail of all administrative and user actions.</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark text-white rounded-xl text-sm font-bold hover:bg-dark/90 transition-all shadow-md disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user, action, or details..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
            />
          </div>
          <p className="text-sm text-slate-400 whitespace-nowrap">
            Showing {filteredLogs.length} events
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">Loading audit trail...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No activity found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ActionIcon action={log.action} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-dark truncate">{log.details}</p>
                          <p className="text-xs text-slate-400">Action: {log.action}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {log.user_name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-dark truncate">{log.user_name || 'N/A'}</p>
                          <p className="text-xs text-slate-400 truncate">{log.user_email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        log.action.includes('DELETE') ? 'bg-red-50 text-red-700' :
                        log.action.includes('RENAME') ? 'bg-blue-50 text-blue-700' :
                        log.action === 'UPLOAD' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-dark whitespace-nowrap">{formatDate(log.timestamp)}</span>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px]">Logged</span>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
