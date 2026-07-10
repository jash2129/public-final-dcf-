import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, FileImage, FileArchive, File, Search, Download, User, RefreshCw, FolderOpen, SlidersHorizontal, Trash2, Edit2 } from 'lucide-react';

interface AdminDocument {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  folder: string;
  file_path?: string;
  order_id?: string;
  user_id: number;
  user_name: string;
  user_email: string;
}

const getFileIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png': return <FileImage className="h-5 w-5 text-blue-500" />;
    case 'archive':
    case 'zip': return <FileArchive className="h-5 w-5 text-amber-500" />;
    default: return <File className="h-5 w-5 text-slate-500" />;
  }
};

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/admin/list', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uniqueUsers = useMemo(() => {
    const users = [...new Set(documents.map(d => d.user_name))];
    return ['All', ...users];
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.order_id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUser = userFilter === 'All' || doc.user_name === userFilter;
      return matchesSearch && matchesUser;
    });
  }, [documents, searchTerm, userFilter]);

  const handleDownload = async (doc: AdminDocument) => {
    if (!doc.file_path) {
      alert('No file available. This document has metadata only.');
      return;
    }
    setDownloading(doc.id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/admin/${doc.id}/file`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('File not found on server');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed. The file may have been deleted.');
    } finally {
      setDownloading(null);
    }
  };

  const handleRename = async (doc: AdminDocument) => {
    const newName = prompt('Enter new file name:', doc.name);
    if (!newName || newName === doc.name) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/admin/${doc.id}/rename`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });
      if (!response.ok) throw new Error('Rename failed');
      await fetchDocuments();
    } catch (err) {
      alert('Failed to rename document');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document? (Admin action: this handles all user files)')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Delete failed');
      await fetchDocuments();
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const stats = {
    total: documents.length,
    withFile: documents.filter(d => d.file_path).length,
    linkedToOrder: documents.filter(d => d.order_id).length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">All Documents</h1>
          <p className="text-slate-500 text-sm mt-1">View and download documents uploaded by all clients.</p>
        </div>
        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark text-white rounded-xl text-sm font-bold hover:bg-dark/90 transition-all shadow-md disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Documents', value: stats.total, icon: FolderOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'With Real File', value: stats.withFile, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Linked to Orders', value: stats.linkedToOrder, icon: SlidersHorizontal, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(stat => (
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
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by filename, client, or order ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${
                userFilter !== 'All' ? 'bg-dark text-white border-dark' : 'border-slate-200 text-dark hover:bg-slate-50'
              }`}
            >
              <User className="h-4 w-4" />
              {userFilter === 'All' ? 'All Clients' : userFilter}
            </button>
            <AnimatePresence>
              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 overflow-hidden"
                  >
                    {uniqueUsers.map(u => (
                      <button
                        key={u}
                        onClick={() => { setUserFilter(u); setShowFilterMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          userFilter === u ? 'bg-brand text-dark font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <span className="text-sm text-slate-400 whitespace-nowrap">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">File</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Folder</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Linked Order</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    <span className="text-sm">Loading documents...</span>
                  </div>
                </td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-red-500 text-sm">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                  No documents found.
                </td></tr>
              ) : (
                filtered.map(doc => {
                  const initials = doc.user_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-xs">
                          {getFileIcon(doc.type)}
                          <span className="text-sm font-semibold text-dark truncate" title={doc.name}>{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 bg-dark text-white flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold">{initials}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-dark truncate">{doc.user_name}</p>
                            <p className="text-xs text-slate-400 truncate">{doc.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{doc.folder}</td>
                      <td className="px-6 py-4">
                        {doc.order_id ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            {doc.order_id}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{doc.size}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{doc.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRename(doc)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Rename document"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            disabled={!doc.file_path || downloading === doc.id}
                            title={doc.file_path ? 'Download file' : 'No file attached'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              doc.file_path
                                ? 'bg-dark text-white hover:bg-dark/90 shadow-sm hover:shadow-md'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            } disabled:opacity-60`}
                          >
                            {downloading === doc.id
                              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              : <Download className="h-3.5 w-3.5" />
                            }
                            {downloading === doc.id ? 'Loading...' : doc.file_path ? 'Download' : 'No File'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-16 text-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="text-sm">Loading documents...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No documents found.</div>
          ) : (
            filtered.map(doc => {
              const initials = doc.user_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div key={doc.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getFileIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark truncate" title={doc.name}>{doc.name}</p>
                      <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                        <span>{doc.folder}</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="h-6 w-6 bg-dark text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-dark truncate">{doc.user_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{doc.user_email}</p>
                    </div>
                    {doc.order_id && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 whitespace-nowrap">
                        Order #{doc.order_id}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-400">{doc.date}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRename(doc)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="Rename document"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={!doc.file_path || downloading === doc.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          doc.file_path
                            ? 'bg-dark text-white hover:bg-dark/90 shadow-sm'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        } disabled:opacity-60`}
                      >
                        {downloading === doc.id
                          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          : <Download className="h-3.5 w-3.5" />
                        }
                        {downloading === doc.id ? 'Loading...' : doc.file_path ? 'Download' : 'No File'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && (
          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            <span>Documents with "No File" are legacy metadata-only records uploaded before real file storage was enabled.</span>
          </div>
        )}
      </div>
    </div>
  );
}
