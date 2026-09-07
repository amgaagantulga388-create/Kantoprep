'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormulaBookletInfo } from '@/types';
import { X, ExternalLink, Copy, Check, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface FormulaBookletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  booklet: FormulaBookletInfo;
}

export const FormulaBookletDrawer: React.FC<FormulaBookletDrawerProps> = ({
  isOpen,
  onClose,
  subjectName,
  booklet,
}) => {
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(booklet.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

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
            className="relative z-10 w-full max-w-xl h-full bg-[#141310] shadow-2xl flex flex-col border-l border-[#F5B942]/20"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#F5B942]/15 flex items-center justify-between bg-[#161513]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/20 flex items-center justify-center text-[#F5B942]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white line-clamp-1">
                      {booklet.title}
                    </h2>
                    {booklet.edition && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5B942]/15 text-[#F5B942] border border-[#F5B942]/30 shrink-0">
                        {booklet.edition}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A8A39D] mt-0.5">{subjectName} Reference Guide</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-5 py-3 bg-[#161513] border-b border-[#F5B942]/15 flex items-center justify-between gap-3">
              <a
                href={booklet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold shadow-md shadow-[#F5B942]/20 transition-all active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Booklet in New Tab</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#1C1A17] hover:bg-[#25221E] text-[#EDEDEB] hover:text-[#F5B942] border border-[#F5B942]/20 text-xs font-medium transition-colors cursor-pointer"
                title="Copy reference booklet URL"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#F5B942]" />
                    <span className="text-[#F5B942] font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#A8A39D]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Body / Viewer */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {booklet.description && (
                <div className="p-3.5 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/20 text-xs text-[#EDEDEB] flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-[#F5B942] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold text-white mb-0.5">Exam Reference Note</p>
                    <p className="text-[#A8A39D]">{booklet.description}</p>
                  </div>
                </div>
              )}

              {/* Document Frame */}
              <div className="relative w-full h-[550px] rounded-2xl border border-[#F5B942]/20 overflow-hidden bg-black shadow-inner">
                <iframe
                  src={booklet.url}
                  title={booklet.title}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#1C1A17] border border-[#F5B942]/15 text-xs text-[#A8A39D] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#A8A39D] shrink-0" />
                  <span>Viewing embedded reference sheet. If blocked by browser sandbox:</span>
                </div>
                <a
                  href={booklet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5B942] hover:text-[#E5A832] font-semibold underline shrink-0 ml-2"
                >
                  Open directly ↗
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#F5B942]/15 bg-[#161513] flex items-center justify-between text-xs text-[#A8A39D]">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#1C1A17] border border-[#F5B942]/20 text-[#EDEDEB] font-mono text-[10px]">Esc</kbd> anytime to close</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 hover:bg-[#25221E] text-[#EDEDEB] hover:text-[#F5B942] font-medium transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
