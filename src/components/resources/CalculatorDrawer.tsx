'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, ExternalLink, Minimize2, Sparkles } from 'lucide-react';

interface CalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorDrawer: React.FC<CalculatorDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const ti84Url = 'https://ti84calc.com/';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-zinc-200"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    TI-84 Plus Online Calculator
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Official simulator for IB & AP coursework
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={ti84Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition-colors"
                  title="Open TI-84 in a new tab"
                >
                  <span>Pop out</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Tips Bar */}
            <div className="px-5 py-2.5 bg-emerald-50/60 border-b border-emerald-100/80 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Simulates the TI-84 Plus CE calculator approved for IB Diploma and AP exams.
                </span>
              </div>
              <a
                href={ti84Url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-semibold underline shrink-0 ml-2"
              >
                ti84calc.com ↗
              </a>
            </div>

            {/* Calculator Frame */}
            <div className="flex-1 w-full bg-zinc-100 relative">
              <iframe
                src={ti84Url}
                title="TI-84 Plus Online Calculator"
                className="w-full h-full border-0"
                allow="clipboard-read; clipboard-write"
              />
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono text-[10px]">Esc</kbd> to minimize</span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Close Calculator</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
