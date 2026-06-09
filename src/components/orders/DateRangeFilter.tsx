import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateRangeFilterProps {
  onFilterChange: (startDate: string | null, endDate: string | null) => void;
}

type Preset = 'All Time' | 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'This Year' | 'Custom';

export default function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset>('All Time');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const presets: Preset[] = ['All Time', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Year', 'Custom'];

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    
    const today = new Date();
    let start: Date | null = null;
    let end: Date = new Date();

    switch (preset) {
      case 'Today':
        start = new Date(today.setHours(0, 0, 0, 0));
        break;
      case 'Yesterday':
        start = new Date(today.setDate(today.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'Last 7 Days':
        start = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'Last 30 Days':
        start = new Date(today.setDate(today.getDate() - 30));
        break;
      case 'This Year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'All Time':
        onFilterChange(null, null);
        setIsOpen(false);
        return;
      case 'Custom':
        return; // Logic handled by inputs
    }

    if (start) {
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      onFilterChange(startStr, endStr);
      setIsOpen(false);
    }
  };

  const handleCustomApply = () => {
    if (customRange.start && customRange.end) {
      onFilterChange(customRange.start, customRange.end);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${
          selectedPreset !== 'All Time'
            ? 'bg-dark text-white border-dark'
            : 'bg-white text-dark border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Calendar className="h-4 w-4" />
        <span>{selectedPreset === 'All Time' ? 'Filter by Date' : selectedPreset}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedPreset === preset
                        ? 'bg-brand/10 text-dark font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{preset}</span>
                    {selectedPreset === preset && <Check className="h-4 w-4 text-brand" />}
                  </button>
                ))}
              </div>

              {selectedPreset === 'Custom' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">From</label>
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">To</label>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand outline-none"
                    />
                  </div>
                  <button
                    onClick={handleCustomApply}
                    disabled={!customRange.start || !customRange.end}
                    className="w-full py-2 bg-dark text-white text-xs font-bold rounded-xl hover:bg-dark-200 transition-all disabled:opacity-50"
                  >
                    Apply Range
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
