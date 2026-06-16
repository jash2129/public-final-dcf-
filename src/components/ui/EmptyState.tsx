import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 ${className}`}
    >
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-brand/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative h-20 w-20 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
          <Icon className="h-10 w-10 text-slate-300 group-hover:text-brand transition-colors duration-300" />
        </div>
      </div>
      
      <h3 className="text-xl font-black text-dark tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}
