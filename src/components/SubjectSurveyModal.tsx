'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Curriculum, StudentProfile } from '@/types';
import { CURRICULUM_OPTIONS, SUBJECTS_BY_CURRICULUM } from '@/lib/constants';
import { saveBookmarkedSubjects, getBookmarkedSubjects } from '@/lib/bookmarks';

// Subject to Syllabus ID mapping for automatic bookmarking into Prep Library
const SUBJECT_TO_SYLLABUS_ID: Record<string, string> = {
  // IB
  'Mathematics: Analysis & Approaches': 'ib-math-aa',
  'Mathematics: Applications & Interpretation': 'ib-math-ai',
  Physics: 'ib-physics',
  Chemistry: 'ib-chemistry',
  Biology: 'ib-biology',
  Economics: 'ib-economics',
  'Business Management': 'ib-business-management',
  'Global Politics': 'ib-global-politics',
  'English A: Literature': 'ib-english-lit',
  History: 'ib-history',
  Psychology: 'ib-psychology',
  'Computer Science': 'ib-computer-science',
  'Theory of Knowledge (TOK)': 'ib-tok',
  'Extended Essay (EE) Lab': 'ib-ee-lab',
  // AP
  'AP Calculus BC': 'ap-calculus-bc',
  'AP Calculus AB': 'ap-calculus-ab',
  'AP Physics C: Mechanics': 'ap-physics-c-mechanics',
  'AP Physics 1': 'ap-physics-1',
  'AP Chemistry': 'ap-chemistry',
  'AP Biology': 'ap-biology',
  'AP English Language': 'ap-english-lang',
  'AP Microeconomics': 'ap-microeconomics',
  'AP Macroeconomics': 'ap-macroeconomics',
  'AP Computer Science A': 'ap-csa',
  'AP World History': 'ap-world-history',
  // IGCSE
  'IGCSE Extended Mathematics': 'igcse-extended-math',
  'IGCSE Additional Mathematics': 'igcse-add-math',
  'IGCSE Physics (0625)': 'igcse-physics',
  'IGCSE Chemistry (0620)': 'igcse-chemistry',
  'IGCSE Biology (0610)': 'igcse-biology',
  'IGCSE Economics': 'igcse-economics',
  'IGCSE English First Language': 'igcse-english-lang',
  // SAT / ACT
  'Digital SAT Math (Advanced & Desmos)': 'digital-sat-math',
  'Digital SAT Reading & Writing': 'digital-sat-reading-writing',
  'SAT Full-length Practice Review': 'digital-sat-math',
  'ACT Science & Reading Sprint': 'digital-sat-reading-writing',
};

// Normalize subject names for matching (handles variations like "Math Analysis & Approaches HL")
function findSyllabusIdForSubjectName(subjectName: string): string | null {
  if (SUBJECT_TO_SYLLABUS_ID[subjectName]) {
    return SUBJECT_TO_SYLLABUS_ID[subjectName];
  }
  const clean = subjectName.toLowerCase();
  for (const [name, id] of Object.entries(SUBJECT_TO_SYLLABUS_ID)) {
    const keyClean = name.toLowerCase();
    if (clean.includes(keyClean) || keyClean.includes(clean)) {
      return id;
    }
  }
  return null;
}

interface SubjectSurveyModalProps {
  isOpen: boolean;
  currentUser: StudentProfile;
  onUpdateUser: (updated: StudentProfile) => void;
  onClose: () => void;
}

export const SubjectSurveyModal: React.FC<SubjectSurveyModalProps> = ({
  isOpen,
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum>(
    currentUser.curriculum || 'IB'
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentUser.subjects || []
  );
  const [gradeLevel, setGradeLevel] = useState<number>(currentUser.gradeLevel || 11);
  const [isSaved, setIsSaved] = useState(false);

  // Available subjects for the currently chosen curriculum
  const availableSubjects = useMemo(() => {
    return SUBJECTS_BY_CURRICULUM[selectedCurriculum] || [];
  }, [selectedCurriculum]);

  if (!isOpen) return null;

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subj)) {
        return prev.filter((s) => s !== subj);
      } else {
        return [...prev, subj];
      }
    });
  };

  const handleSelectAllInCurriculum = () => {
    setSelectedSubjects(availableSubjects);
  };

  const handleClearSelection = () => {
    setSelectedSubjects([]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update Student Profile in Auth State & LocalStorage
    const updatedProfile: StudentProfile = {
      ...currentUser,
      curriculum: selectedCurriculum,
      subjects: selectedSubjects,
      gradeLevel: gradeLevel,
    };
    onUpdateUser(updatedProfile);

    // 2. Automatically sync into Bookmarked Subjects ("My Subjects" in Prep Library)
    const syllabusIdsToBookmark: string[] = [];
    selectedSubjects.forEach((subj) => {
      const sid = findSyllabusIdForSubjectName(subj);
      if (sid && !syllabusIdsToBookmark.includes(sid)) {
        syllabusIdsToBookmark.push(sid);
      }
    });

    if (syllabusIdsToBookmark.length > 0) {
      const existing = getBookmarkedSubjects();
      const combined = Array.from(new Set([...existing, ...syllabusIdsToBookmark]));
      saveBookmarkedSubjects(combined);
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="relative w-full max-w-xl bg-[#161513] rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#F5B942]/20 z-10 overflow-hidden text-white my-auto max-h-[90vh] flex flex-col"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F5B942]/15 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/30 text-[#F5B942]">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-1.5">
                  <span>What are you studying?</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F5B942]/15 border border-[#F5B942]/30 text-[10px] font-bold text-[#F5B942] uppercase tracking-wider">
                    Personalize
                  </span>
                </h3>
                <p className="text-xs text-[#A8A39D] mt-0.5">
                  Select your current subjects. We&apos;ll pin them above everything else and add them to My Subjects.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body - Scrollable */}
          <form onSubmit={handleSave} className="overflow-y-auto pr-1 py-4 space-y-5 flex-1">
            {/* Step 1: Curriculum Selector */}
            <div>
              <label className="block text-xs font-bold text-[#EDEDEB] uppercase tracking-wider mb-2">
                1. Your Primary Curriculum
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CURRICULUM_OPTIONS.map((c) => {
                  const isSelected = selectedCurriculum === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCurriculum(c.id);
                        // Filter out subjects not belonging to new curriculum
                        const validForNew = SUBJECTS_BY_CURRICULUM[c.id] || [];
                        setSelectedSubjects((prev) =>
                          prev.filter((subj) => validForNew.includes(subj))
                        );
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#1C1A17] border-[#F5B942] ring-2 ring-[#F5B942]/30 shadow-sm'
                          : 'bg-[#141310] border-[#F5B942]/15 hover:border-[#F5B942]/35 text-[#A8A39D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-[#F5B942]' : 'text-white'
                          }`}
                        >
                          {c.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F5B942]" />}
                      </div>
                      <span className="text-[10px] text-[#7A756D] line-clamp-1">
                        {c.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Subject Picker Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#EDEDEB] uppercase tracking-wider">
                  2. Choose Your Subjects ({selectedSubjects.length} chosen)
                </label>
                <div className="flex items-center space-x-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAllInCurriculum}
                    className="text-[#F5B942] hover:underline cursor-pointer font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-[#7A756D]">•</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-[#A8A39D] hover:text-white cursor-pointer font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#A8A39D] mb-3">
                Tap each subject you are taking this semester. These will be prioritized in your study pod feed and automatically added to your Prep Library.
              </p>

              <div className="flex flex-wrap gap-2">
                {availableSubjects.map((subj) => {
                  const isChecked = selectedSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => toggleSubject(subj)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 flex items-center space-x-2 cursor-pointer border ${
                        isChecked
                          ? 'bg-[#F5B942] text-[#0E0D0B] font-bold border-[#F5B942] shadow-sm shadow-[#F5B942]/20'
                          : 'bg-[#1C1A17] text-[#EDEDEB] border-[#F5B942]/20 hover:border-[#F5B942]/40 hover:bg-[#221F1B]'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-[#0E0D0B] text-[#F5B942] border-[#0E0D0B]'
                            : 'border-[#7A756D]/50 bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span>{subj}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Grade Level */}
            <div>
              <label className="block text-xs font-bold text-[#EDEDEB] uppercase tracking-wider mb-2">
                3. High School Grade Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[9, 10, 11, 12].map((g) => {
                  const isCurrent = gradeLevel === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGradeLevel(g)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        isCurrent
                          ? 'bg-[#F5B942]/20 border-[#F5B942] text-[#F5B942]'
                          : 'bg-[#141310] border-[#F5B942]/15 text-[#A8A39D] hover:text-white'
                      }`}
                    >
                      Grade {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instant Confirmation / Impact preview */}
            <div className="p-3.5 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-[#A8A39D] flex items-center space-x-3">
              <Sparkles className="w-4 h-4 text-[#F5B942] shrink-0" />
              <span>
                <strong className="text-white font-semibold">Automatic Sync:</strong> Selected subjects will show a &ldquo;⭐ Your Subject&rdquo; badge on study pods and appear at the top of your Prep Library.
              </span>
            </div>

            {/* Save & Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaved}
                className="w-full py-3 px-4 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-sm font-bold shadow-lg shadow-[#F5B942]/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Subjects Saved &amp; Personalized!</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Personalize My Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
