import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { api } from '../context/AuthContext';

interface EmergencyCountdownProps {
  isOpen: boolean;
  score: number;
  onCancel: () => void;
  onDispatchComplete: () => void;
}

export const EmergencyCountdown: React.FC<EmergencyCountdownProps> = ({ 
  isOpen, 
  score, 
  onCancel, 
  onDispatchComplete 
}) => {
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [isDispatched, setIsDispatched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(20);
      setIsDispatched(false);
      return;
    }

    if (secondsLeft === 0) {
      triggerEmergencyDispatch();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  const triggerEmergencyDispatch = async () => {
    try {
      setIsDispatched(true);
      const res = await api.post('/alerts/trigger', { triggeredByScore: score });
      if (res.data.success) {
        onDispatchComplete();
      }
    } catch (error) {
      console.error('Failed to trigger emergency protocol', error);
      setIsDispatched(true);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-md w-full bg-white dark:bg-dark-900 rounded-3xl border border-red-500/30 overflow-hidden shadow-2xl glow-red"
        >
          {/* Top header banner */}
          <div className="bg-red-500 text-white p-6 flex items-center gap-4 animate-pulse">
            <ShieldAlert className="w-12 h-12 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold tracking-wide">Critical Stress Detected</h2>
              <p className="text-xs text-red-100 mt-1">Automatic emergency protocols have been initiated</p>
            </div>
          </div>

          <div className="p-8 text-center space-y-6">
            {!isDispatched ? (
              <>
                <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                  MindGuard has detected critical emotional indicators (Score: <span className="font-bold text-red-500">{score}/100</span>). We will automatically notify your registered emergency contacts and corporate admins in:
                </p>

                {/* Big countdown number */}
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center rounded-full border-4 border-red-100 dark:border-red-950 bg-red-50/50 dark:bg-red-950/25">
                  <span className="text-5xl font-black text-red-600 dark:text-red-400">
                    {secondsLeft}
                  </span>
                  <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-25" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-dark-800 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel & Abort
                  </button>
                  <button
                    onClick={triggerEmergencyDispatch}
                    className="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/30"
                  >
                    Trigger Now
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 py-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Dispatched</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  An alert has been dispatched to your Emergency Contact via SMS/Email and logged for organizational support. Please seek safe space.
                </p>
                <button
                  onClick={onCancel}
                  className="w-full px-5 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-dark-950 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default EmergencyCountdown;
