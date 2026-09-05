'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldCheck,
  MapPin,
  Users,
  GraduationCap,
} from 'lucide-react';
import { StudentProfile } from '@/types';
import { ALLOWED_SCHOOLS } from '@/lib/constants';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);

  const siteUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://kantoprep.vercel.app';

  const userSchool = currentUser
    ? ALLOWED_SCHOOLS.find((s) => s.domain === currentUser.schoolDomain)
    : null;

  const schoolName = userSchool ? userSchool.name : 'Tokyo International Schools';

  const inviteMessage = `Hey! Check out KantoPrep (${siteUrl}) — a free student-run peer study network for Tokyo international high schools (IB, AP, IGCSE, SAT). We organize quiet past paper sprints and study pods at public libraries like Hiroo and Mita. Only verified school emails can join!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(siteUrl)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm print:hidden"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden z-10 print:shadow-none print:border-none print:max-w-none print:w-full"
          >
            {/* Header (Screen only) */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Invite Classmates &amp; Library Flyer</h3>
                  <p className="text-[11px] text-zinc-500">Spread the word for your school study pods</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Flyer Preview */}
            <div className="p-5 sm:p-6 flex flex-col items-center text-center bg-gradient-to-b from-[#f7faf8] to-white">
              {/* Badge */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800 shadow-2xs mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Tokyo Peer Study Network</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                Never cram alone.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                  Find your orbit.
                </span>
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-sm">
                Syllabus-aligned study pods for IB, AP, IGCSE, and Digital SAT across Tokyo international schools.
              </p>

              {/* QR Code Container */}
              <div className="mt-5 p-3 rounded-2xl bg-white border-2 border-emerald-200/80 shadow-md">
                <img
                  src={qrImageUrl}
                  alt="Scan to join KantoPrep"
                  className="w-44 h-44 sm:w-48 sm:h-48 rounded-xl object-contain mx-auto"
                />
                <p className="mt-2 text-[11px] font-mono font-bold text-emerald-800 tracking-wider">
                  kantoprep.vercel.app
                </p>
              </div>

              {/* Key Highlights */}
              <div className="mt-5 grid grid-cols-3 gap-2 w-full max-w-sm text-left">
                <div className="p-2 rounded-xl bg-white border border-zinc-200 text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-zinc-800">School Inboxes</p>
                  <p className="text-[9px] text-zinc-400">Whitelisted</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-zinc-200 text-center">
                  <MapPin className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-zinc-800">Public Hubs</p>
                  <p className="text-[9px] text-zinc-400">Hiroo &amp; Mita</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-zinc-200 text-center">
                  <GraduationCap className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-zinc-800">100% Free</p>
                  <p className="text-[9px] text-zinc-400">Student-run</p>
                </div>
              </div>

              {/* Target School Tag */}
              <p className="mt-4 text-[11px] text-zinc-500 font-medium">
                Active at {schoolName} &amp; Tokyo partner schools
              </p>
            </div>

            {/* Actions Footer (Hidden when printing) */}
            <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:border-emerald-300 text-zinc-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Invite Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Copy Class Chat Invite</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Noticeboard Flyer (A4)</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
