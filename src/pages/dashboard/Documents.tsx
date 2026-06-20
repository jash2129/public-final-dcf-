import { Folder, FileText, UploadCloud, MoreVertical, Search, File, FileImage, FileArchive, X, Trash2, Download, Edit2 } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessOverlay from '../../components/ui/SuccessOverlay';
import Skeleton from '../../components/ui/Skeleton';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  folder: string;
  file_path?: string;
  order_id?: string;
  user_id?: number;
  created_at?: string;
}

interface Order {
  id: string;
  service: string;
  date: string;
  status: string;
  amount: string;
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf': return <FileText className="h-6 w-6 text-red-500" />;
    case 'image': 
    case 'jpg':
    case 'png': return <FileImage className="h-6 w-6 text-blue-500" />;
    case 'archive':
    case 'zip': return <FileArchive className="h-6 w-6 text-amber-500" />;
    default: return <File className="h-6 w-6 text-slate-500" />;
  }
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Order Selection State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // New Document Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDoc, setNewDoc] = useState({
    name: '',
    folder: 'Company Incorporation',
    order_id: ''
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchOrders();
  }, []);

  const filteredDocuments = React.useMemo(() => {
    if (!documents) return [];
    const term = searchTerm.toLowerCase().trim();
    
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(term);
      const matchesFolder = selectedFolder ? doc.folder === selectedFolder : true;
      
      return matchesSearch && matchesFolder;
    });
  }, [documents, searchTerm, selectedFolder]);

  const folders = useMemo(() => {
    const counts = documents.reduce((acc: any, doc) => {
      acc[doc.folder] = (acc[doc.folder] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Company Incorporation', files: counts['Company Incorporation'] || 0, size: '4.2 MB' },
      { name: 'GST Filings', files: counts['GST Filings'] || 0, size: '1.5 MB' },
      { name: 'Trademarks', files: counts['Trademarks'] || 0, size: '8.4 MB' },
      { name: 'Tax Returns', files: counts['Tax Returns'] || 0, size: '2.1 MB' },
      { name: 'Others', files: counts['Others'] || 0, size: '0.8 MB' },
    ];
  }, [documents]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }
    if (!newDoc.order_id) {
      alert('Please select an order to link this document to.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', newDoc.folder);
      formData.append('order_id', newDoc.order_id);

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      await fetchDocuments();
      setIsModalOpen(false);
      setSelectedFile(null);
      setNewDoc({ name: '', folder: 'Company Incorporation', order_id: '' });
      setShowSuccess(true);
    } catch (err) {
      setError('Failed to upload document');
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
      const isPDF = ext === 'pdf';
      const sizeKB = file.size / 1024;

      if (isImage) {
        if (sizeKB < 50 || sizeKB > 100) {
          alert('Images must be between 50 KB and 100 KB.');
          e.target.value = '';
          return;
        }
      } else if (isPDF) {
        if (sizeKB < 100 || sizeKB > 200) {
          alert('PDFs must be between 100 KB and 200 KB.');
          e.target.value = '';
          return;
        }
      } else if (file) {
        alert('Only Images (50-100KB) and PDFs (100-200KB) are allowed.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setNewDoc(prev => ({
        ...prev,
        name: prev.name || file.name
      }));
    }
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.file_path) {
      alert('No file available for download. This document has no attached file.');
      return;
    }
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/documents/${doc.id}/file`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) { alert('File not found.'); return; }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRename = async (file: Document) => {
    const newName = prompt('Enter new file name:', file.name);
    if (!newName || newName === file.name) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${file.id}/rename`, {
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
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Delete failed');
      await fetchDocuments();
    } catch (err) {
      alert('Failed to delete document');
    }
  };
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Document Vault</h1>
          <p className="text-slate-500 text-sm mt-1">Securely store and manage your business documents.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex bg-brand text-dark px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-hover transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 items-center gap-2"
        >
          <UploadCloud className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-brand text-dark p-4 rounded-2xl shadow-premium active:scale-95 transition-all md:hidden"
      >
        <UploadCloud className="h-6 w-6" />
      </button>

      {/* Folders Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-dark tracking-tight">Folders</h2>
          {selectedFolder && (
            <button 
              onClick={() => setSelectedFolder(null)}
              className="text-xs font-black text-brand-dark bg-brand/10 px-3 py-1 rounded-lg hover:bg-brand/20 transition-all"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <div key={i}><Skeleton className="h-40 w-full" /></div>)
          ) : (
            folders.map((folder, i) => (
              <motion.div 
                key={folder.name} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedFolder(selectedFolder === folder.name ? null : folder.name)}
                className={`p-6 rounded-4xl border transition-all cursor-pointer group shadow-soft ${
                  selectedFolder === folder.name 
                  ? 'bg-dark text-white border-dark shadow-premium' 
                  : 'bg-white border-slate-100 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${
                    selectedFolder === folder.name ? 'bg-brand text-dark' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Folder className="h-7 w-7" fill="currentColor" fillOpacity={0.2} />
                  </div>
                </div>
                <h3 className={`font-black text-lg mb-1 truncate ${selectedFolder === folder.name ? 'text-white' : 'text-dark'}`}>{folder.name}</h3>
                <div className={`flex items-center justify-between text-[11px] font-bold ${selectedFolder === folder.name ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="uppercase tracking-widest">{folder.files} files</span>
                  <span className="opacity-60">{folder.size}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Recent Files */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-dark">
            {selectedFolder ? `${selectedFolder} Files` : 'Recent Files'}
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
            />
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Folder</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Modified</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-48 rounded-lg" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded-lg" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16 rounded-lg" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded-lg" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-red-500 font-bold">{error}</td></tr>
              ) : filteredDocuments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">No documents found.</td></tr>
              ) : (
                filteredDocuments.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="text-sm font-bold text-dark">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{file.folder}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{file.size}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{file.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === file.id ? null : file.id);
                          }}
                          className="p-2 text-slate-400 hover:text-dark transition-colors rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === file.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 overflow-hidden"
                              >
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Download className="h-4 w-4" /> Download
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRename(file);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Edit2 className="h-4 w-4" /> Rename
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(file.id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">No documents found.</div>
          ) : (
            filteredDocuments.map((file) => (
              <div 
                key={file.id} 
                className="p-4 flex items-center gap-4 active:bg-slate-50 transition-colors"
                onClick={() => {
                  if (activeMenuId === file.id) setActiveMenuId(null);
                  else setActiveMenuId(file.id);
                }}
              >
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark truncate leading-tight">{file.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mt-1">
                    <span className="uppercase tracking-widest">{file.size}</span>
                    <span>•</span>
                    <span>{file.date}</span>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === file.id ? null : file.id);
                    }}
                    className="p-2 text-slate-400"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <AnimatePresence>
                    {activeMenuId === file.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-premium z-20 py-2 overflow-hidden"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 flex items-center gap-3 active:bg-slate-50"
                        >
                          <Download className="h-4 w-4" /> Download
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(file);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 flex items-center gap-3 active:bg-slate-50"
                        >
                          <Edit2 className="h-4 w-4" /> Rename
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 flex items-center gap-3 active:bg-slate-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-dark/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleUpload} className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-dark">Upload Document</h2>
                    <p className="text-slate-500 text-sm mt-1">Add a new file to your document vault.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Selection Area */}
                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">Select File <span className="text-red-500">*</span></label>
                    <div 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-brand hover:bg-brand/5 transition-all cursor-pointer group"
                    >
                      <input 
                        id="file-upload"
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx"
                      />
                      <div className="bg-brand-lightest w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-6 w-6 text-brand" />
                      </div>
                      {selectedFile ? (
                        <>
                          <p className="text-sm font-bold text-dark">{selectedFile.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-dark">Click to browse files</p>
                          <p className="text-xs text-slate-500 mt-1">Image (50-100KB) or PDF (100-200KB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-dark mb-2">File Name (Internal Display)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., GST_Return_Nov.pdf"
                      value={newDoc.name}
                      onChange={e => setNewDoc({...newDoc, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-dark mb-2">Folder</label>
                      <select 
                        value={newDoc.folder}
                        onChange={e => setNewDoc({...newDoc, folder: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all"
                      >
                        <option>Company Incorporation</option>
                        <option value="GST Filings">GST Filings</option>
                        <option value="Trademarks">Trademarks</option>
                        <option value="Tax Returns">Tax Returns</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-dark mb-2">Link to Order <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={newDoc.order_id}
                        onChange={e => setNewDoc({...newDoc, order_id: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all cursor-pointer"
                      >
                        <option value="">Select an order...</option>
                        {ordersLoading ? (
                          <option disabled>Loading orders...</option>
                        ) : orders.length === 0 ? (
                          <option disabled>No orders found</option>
                        ) : (
                          orders.map(order => (
                            <option key={order.id} value={order.id}>{order.id} - {order.service}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-dark text-white rounded-2xl font-bold hover:bg-dark-200 transition-all shadow-lg hover:shadow-xl"
                    >
                      Save Document
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SuccessOverlay 
        isVisible={showSuccess} 
        message="Document uploaded and linked successfully." 
        onComplete={() => setShowSuccess(false)} 
      />
    </div>
  );
}
