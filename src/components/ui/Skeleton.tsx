import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangle' | 'circle' | 'text';
}

export default function Skeleton({ className = '', variant = 'rectangle' }: SkeletonProps) {
  const baseClass = "bg-slate-200 relative overflow-hidden";
  const variantClass = variant === 'circle' ? 'rounded-full' : 
                      variant === 'text' ? 'rounded h-4 w-3/4' : 'rounded-2xl';

  return (
    <div className={`${baseClass} ${variantClass} ${className}`}>
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
