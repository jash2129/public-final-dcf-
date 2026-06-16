import { motion } from 'framer-motion';
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangle' | 'circle' | 'text';
}

export default function Skeleton({ className = '', variant = 'rectangle', ...props }: SkeletonProps) {
  const baseClass = "bg-slate-200 relative overflow-hidden";
  const variantClass = variant === 'circle' ? 'rounded-full' : 
                      variant === 'text' ? 'rounded h-4 w-3/4' : 'rounded-2xl';

  return (
    <div className={`${baseClass} ${variantClass} ${className}`} {...props}>
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
    </div>
  );
}
