'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, PlusSquare, X, Smartphone, Check, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY = 'kantoprep_pwa_banner_seen';

export const AddToHomeScreenBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user already dismissed or saw this prompt (strictly once)
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (hasSeen) return;

    // Check if the app is already installed / running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      // Already running as an installed PWA, don't prompt
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
    setIsIos(isIosDevice);

    // Listen for native Android/Chromium install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Delay display slightly so it doesn't pop up abruptly on the first frame
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    // Record that client has seen this, ensuring they are only informed once
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // In case localStorage is disabled/blocked in private mode
    }
    setIsVisible(false);
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 p-4 rounded-2xl bg-[#161513]/95 backdrop-blur-md border border-[#F5B942]/30 shadow-2xl text-white overflow-hidden"
        >
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-[#F5B942]/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5B942]/15 border border-[#F5B942]/30 flex items-center justify-center shrink-0 text-[#F5B942]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#F5B942]">
                  Quick Access & Alerts
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Add KantoPrep to Home Screen
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-[#A8A39D] hover:text-white hover:bg-[#25231F] transition-colors cursor-pointer"
              aria-label="Dismiss banner"
              title="Dismiss (won't show again)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2.5 text-xs text-[#A8A39D] leading-relaxed relative z-10">
            Put KantoPrep on your phone screen to access your study pods faster and receive chat alerts without opening a browser.
          </p>

          {/* Device Instructions */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#1C1A17] border border-[#F5B942]/15 text-[11px] text-[#EDEDEB] space-y-1.5 relative z-10">
            {isIos ? (
              <>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Share2 className="w-3.5 h-3.5 text-[#F5B942] shrink-0" />
                  <span>1. Tap the <strong>Share</strong> button at bottom of Safari</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <PlusSquare className="w-3.5 h-3.5 text-[#F5B942] shrink-0" />
                  <span>2. Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong></span>
                </div>
              </>
            ) : deferredPrompt ? (
              <div className="flex items-center justify-between">
                <span className="text-white">Ready for 1-tap installation:</span>
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Install App</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-white font-medium">
                  <span>1. Tap browser menu <strong>(⋮ or Share)</strong></span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <PlusSquare className="w-3.5 h-3.5 text-[#F5B942] shrink-0" />
                  <span>2. Choose <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>Install</strong></span>
                </div>
              </>
            )}
          </div>

          {/* Dismiss & Acknowledge */}
          <div className="mt-3.5 flex items-center justify-between text-xs relative z-10">
            <span className="text-[10px] text-[#7A756D]">
              We&apos;ll only show this recommendation once.
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25231F] hover:bg-[#322F2A] text-white font-semibold text-xs border border-[#F5B942]/20 hover:border-[#F5B942]/50 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#F5B942]" />
              <span>Got it</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
