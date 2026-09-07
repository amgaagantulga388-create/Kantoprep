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
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl h-full bg-[#141310] shadow-2xl flex flex-col border-l border-[#F5B942]/20"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#F5B942]/15 flex items-center justify-between bg-[#161513]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/20 flex items-center justify-center text-[#F5B942]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    TI-84 Plus Online Calculator
                  </h2>
                  <p className="text-xs text-[#A8A39D]">
                    Official simulator for IB & AP coursework
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={ti84Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1C1A17] border border-[#F5B942]/20 hover:bg-[#25221E] text-xs font-semibold text-[#EDEDEB] hover:text-[#F5B942] transition-colors"
                  title="Open TI-84 in a new tab"
                >
                  <span>Pop out</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#A8A39D]" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Tips Bar */}
            <div className="px-5 py-2.5 bg-[#F5B942]/10 border-b border-[#F5B942]/20 flex items-center justify-between text-xs text-[#EDEDEB]">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B942] shrink-0" />
                <span>
                  Simulates the TI-84 Plus CE calculator approved for IB Diploma and AP exams.
                </span>
              </div>
              <a
                href={ti84Url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5B942] hover:text-[#E5A832] font-bold underline shrink-0 ml-2"
              >
                ti84calc.com ↗
              </a>
            </div>

            {/* Calculator Frame */}
            <div className="flex-1 w-full bg-[#0E0D0B] relative">
              <iframe
                src={ti84Url}
                title="TI-84 Plus Online Calculator"
                className="w-full h-full border-0"
                allow="clipboard-read; clipboard-write"
              />
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-[#F5B942]/15 bg-[#161513] flex items-center justify-between text-xs text-[#A8A39D]">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#1C1A17] border border-[#F5B942]/20 text-[#EDEDEB] font-mono text-[10px]">Esc</kbd> to minimize</span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1C1A17] border border-[#F5B942]/20 hover:bg-[#25221E] text-[#EDEDEB] hover:text-[#F5B942] font-medium transition-colors cursor-pointer"
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
