import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Calendar, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  User,
  ExternalLink,
  MoreVertical,
  Bell,
  Plus,
  X,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessOverlay from '../../components/ui/SuccessOverlay';
import Skeleton from '../../components/ui/Skeleton';

interface ComplianceTask {
  id: number;
  title: string;
  dueDate: string;
  status: 'upcoming' | 'overdue' | 'completed';
  type: string;
  penalty: number | null;
  user_id: number;
  user_name: string;
  user_email: string;
}

interface ClientUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminCompliance() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [users, setUsers] = useState<ClientUser[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingReminders, setSendingReminders] = useState(false);
  
  // Modals & Feedback State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formFields, setFormFields] = useState({
    userId: '',
    title: '',
    dueDate: '',
    type: 'Taxation',
    penalty: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/compliance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch compliance tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Only list standard clients/users in user dropdown (exclude admins if needed, or include all)
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch user directory', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const handleSendReminders = async () => {
    setSendingReminders(true);
    // Mocking an API call to send reminders
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSendingReminders(false);
    setSuccessMessage('Email reminders have been sent to all users with pending or overdue tasks.');
    setShowSuccess(true);
  };

  const updateTaskStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/compliance/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        // Optimistically update list or refetch
        fetchTasks();
      } else {
        alert('Failed to update task status.');
      }
    } catch (err) {
      console.error('Failed updating task status:', err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this compliance task? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/compliance/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccessMessage('Compliance task has been deleted successfully.');
        setShowSuccess(true);
        fetchTasks();
      } else {
        alert('Failed to delete compliance task');
      }
    } catch (err) {
      console.error('Failed deleting task:', err);
    }
  };

  const handleAssignTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validations
    const errors: Record<string, string> = {};
    if (!formFields.userId) errors.userId = 'Please select a client';
    if (!formFields.title.trim()) errors.title = 'Filing task title is required';
    if (!formFields.dueDate) errors.dueDate = 'Due date is required';
    if (formFields.penalty && (isNaN(parseFloat(formFields.penalty)) || parseFloat(formFields.penalty) < 0)) {
      errors.penalty = 'Penalty must be a non-negative number';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formFields.title,
          dueDate: formFields.dueDate,
          type: formFields.type,
          penalty: formFields.penalty ? parseFloat(formFields.penalty) : null,
          userId: formFields.userId
        })
      });

      if (response.ok) {
        setSuccessMessage('Compliance task assigned to user successfully.');
        setShowSuccess(true);
        setIsAssignModalOpen(false);
        setFormFields({
          userId: '',
          title: '',
          dueDate: '',
          type: 'Taxation',
          penalty: ''
        });
        setValidationErrors({});
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to assign compliance task.');
      }
    } catch (err) {
      console.error('Failed assigning task:', err);
      alert('A network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'overdue': return 'bg-red-50 text-red-600 border-red-100';
      case 'upcoming': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'overdue': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'upcoming': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Platform Compliance Tracker</h1>
          <p className="text-slate-500">Monitor regulatory deadlines and filings across all client accounts.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleSendReminders}
            disabled={sendingReminders}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-dark rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Bell className={`h-4 w-4 ${sendingReminders ? 'animate-bounce' : ''}`} />
            {sendingReminders ? 'Sending...' : 'Send Reminders'}
          </button>
          
          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-dark rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Assign Compliance Task
          </button>

          <button 
            onClick={() => navigate('/tools/compliance-calendar')}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:bg-dark-200 transition-all cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-brand" />
            Tax Calendar View
          </button>
        </div>
      </div>

      {/* Search Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by task title, user name, or filing type..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tasks Grid/List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-14 w-14" variant="circle" />
                <div className="space-y-2 flex-1 max-w-sm">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
          ))
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5 flex-1">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  task.status === 'completed' ? 'bg-green-50' : 
                  task.status === 'overdue' ? 'bg-red-50' : 'bg-blue-50'
                }`}>
                  {getStatusIcon(task.status)}
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1 flex flex-wrap items-center gap-2">
                    {task.title}
                    {task.penalty ? (
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 bg-red-100 text-red-600 rounded-full border border-red-200">
                        ₹{task.penalty} Penalty
                      </span>
                    ) : null}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <User className="h-3.5 w-3.5" />
                      {task.user_name}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium border-l border-slate-200 pl-4">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      {task.type}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium border-l border-slate-200 pl-4">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {task.dueDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex flex-col items-start md:items-end">
                  <select 
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-colors ${getStatusStyle(task.status)}`}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                    <option value="completed">Completed</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Filing Status</p>
                </div>
                
                <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Delete Compliance Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-slate-50 rounded-full">
              <AlertCircle className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium font-sans">No compliance tasks found matching your search.</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-brand font-bold text-sm hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Success Banner Overlay */}
      <SuccessOverlay 
        isVisible={showSuccess} 
        message={successMessage} 
        onComplete={() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }} 
      />

      {/* Assign Task Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-dark/20 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-dark">Assign Compliance Task</h2>
                    <p className="text-slate-500 text-xs mt-1">Assign a statutory compliance checklist item to a client.</p>
                  </div>
                  <button 
                    onClick={() => setIsAssignModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleAssignTaskSubmit} className="space-y-5">
                  {/* Select Client */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Select Client</label>
                    <select
                      value={formFields.userId}
                      onChange={(e) => setFormFields({ ...formFields, userId: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all ${
                        validationErrors.userId ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                      }`}
                    >
                      <option value="">-- Choose a Client --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                    {validationErrors.userId && (
                      <p className="text-red-500 text-xs font-semibold">{validationErrors.userId}</p>
                    )}
                  </div>

                  {/* Task Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Task Title</label>
                    <input 
                      type="text"
                      placeholder="e.g. TDS Quarterly Return Filing"
                      value={formFields.title}
                      onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all ${
                        validationErrors.title ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                      }`}
                    />
                    {validationErrors.title && (
                      <p className="text-red-500 text-xs font-semibold">{validationErrors.title}</p>
                    )}
                  </div>

                  {/* Filing Category & Due Date in Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Filing Type</label>
                      <select
                        value={formFields.type}
                        onChange={(e) => setFormFields({ ...formFields, type: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all"
                      >
                        <option value="Taxation">Taxation</option>
                        <option value="Corporate Compliance">Corporate Compliance</option>
                        <option value="Audit & Finance">Audit & Finance</option>
                        <option value="Licenses & Registry">Licenses & Registry</option>
                      </select>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Due Date</label>
                      <input 
                        type="date"
                        value={formFields.dueDate}
                        onChange={(e) => setFormFields({ ...formFields, dueDate: e.target.value })}
                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all ${
                          validationErrors.dueDate ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                        }`}
                      />
                      {validationErrors.dueDate && (
                        <p className="text-red-500 text-xs font-semibold">{validationErrors.dueDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Penalty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Penalty Amount (₹) - Optional</label>
                    <input 
                      type="number"
                      placeholder="e.g. 500"
                      value={formFields.penalty}
                      onChange={(e) => setFormFields({ ...formFields, penalty: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand transition-all ${
                        validationErrors.penalty ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                      }`}
                    />
                    {validationErrors.penalty && (
                      <p className="text-red-500 text-xs font-semibold">{validationErrors.penalty}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAssignModalOpen(false)}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all cursor-pointer text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 bg-dark text-white rounded-xl font-bold hover:bg-dark-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {isSaving ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Assign Task'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
