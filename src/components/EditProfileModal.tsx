'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import { StudentProfile } from '@/types';
import { PRESET_AVATARS } from '@/lib/constants';

interface EditProfileModalProps {
  isOpen: boolean;
  currentUser: StudentProfile;
  onUpdateUser: (updated: StudentProfile) => void;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  const [nickname, setNickname] = useState(currentUser.fullName);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(
    currentUser.avatarUrl || PRESET_AVATARS[0].url
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nickname.trim();
    if (!cleanName) {
      setError('Nickname or real name is mandatory.');
      return;
    }

    const updated: StudentProfile = {
      ...currentUser,
      fullName: cleanName,
      avatarUrl: selectedAvatarUrl,
    };

    onUpdateUser(updated);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#161513] rounded-3xl p-6 shadow-2xl border border-[#F5B942]/20 z-10 overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F5B942]/15">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#F5B942]" />
              <h3 id="edit-profile-title" className="text-base font-bold text-white">
                Edit Profile &amp; Avatar
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center justify-center pt-1 pb-2">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-[#F5B942]/30 shadow-md bg-[#1C1A17] p-0.5 mb-2">
                <Image
                  src={selectedAvatarUrl}
                  alt="Selected Avatar"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-full"
                  unoptimized={selectedAvatarUrl.startsWith('data:')}
                />
              </div>
              <p className="text-[11px] text-[#A8A39D] font-medium">
                Select your avatar (no real photo needed)
              </p>
            </div>

            {/* Avatar Preset Grid */}
            <div>
              <label className="block text-xs font-semibold text-[#EDEDEB] mb-1.5">
                Choose an Avatar
              </label>
              <div className="grid grid-cols-5 gap-2 p-2.5 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/20">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = selectedAvatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedAvatarUrl(preset.url)}
                      title={preset.name}
                      className={`relative rounded-xl p-1 transition-all cursor-pointer aspect-square flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-[#F5B942] scale-105 bg-[#F5B942]/15 shadow-sm'
                          : 'hover:scale-105 hover:bg-white/5'
                      }`}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                        unoptimized
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#F5B942] text-[#0E0D0B] flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nickname / Real Name Input */}
            <div>
              <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">
                Nickname or Real Name <span className="text-[#F5B942]">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Kai, Maya T, or your real name"
                required
                className="w-full px-3 py-2 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942]"
              />
              <p className="text-[10px] text-[#7A756D] mt-1">
                This is how other students will see you in study pods.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-medium">{error}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl border border-[#F5B942]/20 hover:bg-[#1C1A17] text-xs font-semibold text-[#EDEDEB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!nickname.trim()}
                className="w-2/3 py-2.5 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] disabled:opacity-40 text-[#0E0D0B] text-xs font-bold shadow-md shadow-[#F5B942]/20 active:scale-95 transition-all cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
