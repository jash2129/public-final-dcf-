import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface SuccessOverlayProps {
  isVisible: boolean;
  message: string;
  onComplete: () => void;
}

export default function SuccessOverlay({ isVisible, message, onComplete }: SuccessOverlayProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center border border-slate-100"
          >
            <button 
              onClick={onComplete}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Close success overlay"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
            <div className="relative mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.1 }}
                className="h-24 w-24 bg-brand rounded-full flex items-center justify-center shadow-lg shadow-brand/20"
              >
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Check className="h-12 w-12 text-dark stroke-[3px]" />
                </motion.div>
              </motion.div>
              
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute inset-0 bg-brand rounded-full -z-10 blur-xl px-4"
              />
            </div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-black text-dark mb-2"
            >
              Success!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-500 font-medium text-center"
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
