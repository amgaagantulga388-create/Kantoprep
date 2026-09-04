'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Award, Printer, CheckCircle2 } from 'lucide-react';
import { StudentProfile, StudyGroup } from '@/types';

interface CasCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  hostedGroups: StudyGroup[];
}

export const CasCertificateModal: React.FC<CasCertificateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  hostedGroups,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center space-x-2 text-amber-600">
            <Award className="w-5 h-5" />
            <h2 className="text-base font-bold text-zinc-900">
              Official CAS / NHS Service Verification
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-zinc-50 border border-zinc-200 relative overflow-hidden shadow-xs">
          <div className="text-center pb-6 border-b border-zinc-200">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">
              Kanto Academic Peer Leadership Initiative
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 mt-1">
              Certificate of Community Peer Tutoring & Leadership
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Valid for IB Diploma CAS (Service strand) and National Honor Society (NHS) Service Portfolios
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-zinc-200 text-xs">
            <div>
              <span className="text-zinc-500 text-[11px] block">Student Name</span>
              <strong className="text-zinc-900 text-sm font-semibold">{currentUser.fullName}</strong>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">School Affiliation</span>
              <span className="text-zinc-700 font-medium">{currentUser.schoolName}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Verified Hours</span>
              <strong className="text-amber-600 text-sm font-bold">{currentUser.casHours} Hours</strong>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Verification Status</span>
              <span className="inline-flex items-center space-x-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified School Email</span>
              </span>
            </div>
          </div>

          <div className="py-6 border-b border-zinc-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Documented Peer Study Sessions Hosted
            </h3>
            <div className="space-y-2 text-xs">
              {hostedGroups.length > 0 ? (
                hostedGroups.map((g, idx) => (
                  <div
                    key={g.id || idx}
                    className="p-3 rounded-xl bg-white border border-zinc-200 flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">{g.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {g.subject} • {g.venueLabel} • {g.members.length} Attendees
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-amber-600">
                      +{(g.durationMinutes / 60).toFixed(1)} hrs
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-xs italic">
                  Host study sessions in KantoPrep to automatically accumulate verified CAS & NHS hours.
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-zinc-500 mb-6">Student Electronic Signature</p>
              <div className="border-b border-zinc-300 pb-1">
                <span className="font-mono text-xs text-emerald-700 italic">{currentUser.fullName}</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Verified via {currentUser.email}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-6">CAS Coordinator / Faculty Review</p>
              <div className="border-b border-zinc-300 pb-1">
                <span className="text-zinc-400 italic">Signature & Date</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Submit this printout to your school advisor</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
