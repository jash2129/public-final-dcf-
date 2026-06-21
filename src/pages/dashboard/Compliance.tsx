import { Calendar as CalendarIcon, AlertTriangle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


interface ComplianceTask {
  id: number;
  title: string;
  dueDate: string;
  status: string;
  type: string;
  penalty?: string;
}

const generateGoogleCalendarUrl = (task: ComplianceTask) => {
  let dateStr = '';
  if (task.dueDate.includes('-')) {
    const parts = task.dueDate.split('-');
    if (parts.length === 3) {
      dateStr = `${parts[0]}${parts[1]}${parts[2]}`;
    }
  } else {
    const [month, day, year] = task.dueDate.replace(',', '').split(' ');
    const monthMap: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const formattedMonth = monthMap[month] || '01';
    const formattedDay = (day || '01').padStart(2, '0');
    const formattedYear = year || '2026';
    dateStr = `${formattedYear}${formattedMonth}${formattedDay}`;
  }
  
  const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(task.title);
  const dates = encodeURIComponent(`${dateStr}/${dateStr}`);
  const details = encodeURIComponent(`Statutory compliance deadline for ${task.type}. Status: ${task.status}${task.penalty ? `. Potential Penalty: ${task.penalty}` : ''}`);
  
  return `${baseUrl}&text=${text}&dates=${dates}&details=${details}`;
};

export default function Compliance() {
  const navigate = useNavigate();
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTask[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/compliance', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setComplianceTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch compliance tasks:', err);
        setLoading(false);
      });
  }, []);
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Compliance Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">Never miss a deadline. Track all your statutory compliances.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/dashboard/tools/compliance-calendar?personalized=true')}
            className="bg-white border border-slate-200 text-dark px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <CalendarIcon className="h-4 w-4" />
            Interactive Calendar
          </button>
          <button 
            onClick={() => {
              if (complianceTasks.length > 0) {
                window.open(generateGoogleCalendarUrl(complianceTasks[0]), '_blank');
              } else {
                alert('No tasks to sync.');
              }
            }}
            className="bg-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-dark-200 transition-all flex items-center gap-2 shadow-sm"
          >
            <CalendarIcon className="h-4 w-4" />
            Sync to Google Calendar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 rounded-full blur-[50px] opacity-10"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-dark">Overdue</h3>
          </div>
          <p className="text-3xl font-bold text-dark">1</p>
          <p className="text-sm text-red-600 font-medium mt-1">Requires immediate action</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500 rounded-full blur-[50px] opacity-10"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-dark">Upcoming (30 Days)</h3>
          </div>
          <p className="text-3xl font-bold text-dark">3</p>
          <p className="text-sm text-slate-500 mt-1">Next due: Dec 11, 2023</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full blur-[50px] opacity-10"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-dark">Completed (YTD)</h3>
          </div>
          <p className="text-3xl font-bold text-dark">12</p>
          <p className="text-sm text-emerald-600 font-medium mt-1">100% compliance rate</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-dark">Compliance Tasks</h2>
          <select className="bg-slate-50 border border-slate-200 text-sm font-medium text-dark rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand">
            <option>All Statuses</option>
            <option>Overdue</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
        </div>
        
        <div className="divide-y divide-slate-100">
          {complianceTasks.map((task) => (
            <div key={task.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-full ${
                  task.status === 'overdue' ? 'bg-red-100 text-red-600' :
                  task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {task.status === 'overdue' ? <AlertTriangle className="h-5 w-5" /> :
                   task.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> :
                   <Clock className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-dark text-lg">{task.title}</h3>
                    {task.status === 'overdue' && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-md">OVERDUE</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span className="font-medium text-dark">Due: {task.dueDate}</span>
                    <span className="flex items-center gap-1.5 before:content-['•'] before:text-slate-300">{task.type}</span>
                    {task.penalty && (
                      <span className="flex items-center gap-1.5 before:content-['•'] before:text-slate-300 text-red-500 font-medium">
                        Penalty: {task.penalty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:ml-auto pl-14 sm:pl-0">
                {task.status !== 'completed' && (
                  <a 
                    href="tel:+919000243270"
                    className="bg-dark text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-dark-200 transition-colors inline-flex items-center justify-center cursor-pointer"
                  >
                    Take Action
                  </a>
                )}
                <button 
                  onClick={() => window.open(generateGoogleCalendarUrl(task), '_blank')}
                  className="p-2 text-slate-400 hover:text-brand transition-colors rounded-lg hover:bg-brand/5 group-hover:text-brand"
                  title="Add to Google Calendar"
                >
                  <CalendarIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-dark transition-colors rounded-lg hover:bg-slate-100">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
