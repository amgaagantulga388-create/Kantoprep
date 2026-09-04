import { Curriculum, SchoolInfo, SessionFormat, VenueType } from '@/types';

export const ALLOWED_SCHOOLS: SchoolInfo[] = [
  {
    domain: 'students.aobajapan.jp',
    name: 'Aoba-Japan International School',
    shortName: 'A-JIS',
    campus: 'Hikarigaoka / Bunkyo',
    badgeColor: 'from-emerald-600 to-teal-600',
  },
  {
    domain: 'aobajapan.jp',
    name: 'Aoba-Japan International School',
    shortName: 'A-JIS',
    campus: 'Hikarigaoka / Bunkyo',
    badgeColor: 'from-emerald-600 to-teal-600',
  },
  {
    domain: 'bst.ac.jp',
    name: 'The British School in Tokyo',
    shortName: 'BST',
    campus: 'Shibuya / Toranomon',
    badgeColor: 'from-blue-500 to-sky-600',
  },
  {
    domain: 'asij.ac.jp',
    name: 'American School in Japan',
    shortName: 'ASIJ',
    campus: 'Chofu / Roppongi',
    badgeColor: 'from-amber-500 to-orange-500',
  },
  {
    domain: 'k-international.ed.jp',
    name: 'K. International School Tokyo',
    shortName: 'KIST',
    campus: 'Koto-ku',
    badgeColor: 'from-emerald-500 to-teal-600',
  },
  {
    domain: 'smis.ac.jp',
    name: "St. Mary's International School",
    shortName: 'SMIS',
    campus: 'Setagaya',
    badgeColor: 'from-red-500 to-rose-600',
  },
  {
    domain: 'seisen.com',
    name: 'Seisen International School',
    shortName: 'Seisen',
    campus: 'Yoga / Setagaya',
    badgeColor: 'from-sky-500 to-blue-600',
  },
  {
    domain: 'issh.ac.jp',
    name: 'Intl School of the Sacred Heart',
    shortName: 'ISSH',
    campus: 'Hiroo / Shibuya',
    badgeColor: 'from-teal-500 to-emerald-600',
  },
  {
    domain: 'yis.ac.jp',
    name: 'Yokohama International School',
    shortName: 'YIS',
    campus: 'Honmoku / Yokohama',
    badgeColor: 'from-cyan-500 to-blue-600',
  },
  {
    domain: 'saintmaur.ac.jp',
    name: 'Saint Maur International School',
    shortName: 'Saint Maur',
    campus: 'Yamate / Yokohama',
    badgeColor: 'from-emerald-600 to-green-700',
  },
  {
    domain: 'caj.ac.jp',
    name: 'Christian Academy in Japan',
    shortName: 'CAJ',
    campus: 'Higashikurume',
    badgeColor: 'from-lime-500 to-emerald-600',
  },
  {
    domain: 'demo.school.ac.jp',
    name: 'KantoPrep Pilot Campus',
    shortName: 'KantoPrep',
    campus: 'Tokyo Central',
    badgeColor: 'from-emerald-500 to-teal-600',
  },
];

export const CURRICULUM_OPTIONS: { id: Curriculum; label: string; description: string }[] = [
  { id: 'IB', label: 'IB Diploma', description: 'HL/SL subjects, IA reviews & TOK' },
  { id: 'AP', label: 'Advanced Placement', description: 'CollegeBoard AP exam preparation' },
  { id: 'IGCSE', label: 'Cambridge / Edexcel IGCSE', description: 'Year 10–11 syllabus & past papers' },
  { id: 'SAT_ACT', label: 'Digital SAT & ACT', description: 'Standardized test strategy & practice' },
];

export const SUBJECTS_BY_CURRICULUM: Record<Curriculum, string[]> = {
  IB: [
    'Math Analysis & Approaches HL',
    'Math Analysis & Approaches SL',
    'Math Applications & Interpretation HL',
    'Physics HL',
    'Physics SL',
    'Chemistry HL',
    'Biology HL',
    'Economics HL',
    'Economics SL',
    'History HL',
    'English A: Literature HL',
    'Psychology HL',
    'Theory of Knowledge (TOK)',
    'Extended Essay (EE) Lab',
  ],
  AP: [
    'AP Calculus BC',
    'AP Calculus AB',
    'AP Physics C: Mechanics',
    'AP Physics 1',
    'AP Chemistry',
    'AP Biology',
    'AP Microeconomics',
    'AP Macroeconomics',
    'AP Computer Science A',
    'AP World History',
    'AP English Language',
  ],
  IGCSE: [
    'IGCSE Additional Mathematics',
    'IGCSE Extended Mathematics',
    'IGCSE Physics (0625)',
    'IGCSE Chemistry (0620)',
    'IGCSE Biology (0610)',
    'IGCSE Economics',
    'IGCSE English First Language',
  ],
  SAT_ACT: [
    'Digital SAT Math (Advanced & Desmos)',
    'Digital SAT Reading & Writing',
    'SAT Full-length Practice Review',
    'ACT Science & Reading Sprint',
  ],
};

export const FORMAT_CONFIG: Record<SessionFormat, { label: string; badge: string; description: string; icon: string }> = {
  past_paper_sprint: {
    label: 'Past Paper Sprint',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Timed paper test followed by step-by-step markscheme review.',
    icon: 'FileSpreadsheet',
  },
  ia_workshop: {
    label: 'IA / Essay Workshop',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Constructive peer review on structure, calculations, and rubric.',
    icon: 'PenTool',
  },
  silent_pomodoro: {
    label: 'Silent Pomodoro',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'High-focus 25/5 study session with ambient timer accountability.',
    icon: 'Clock',
  },
  exam_cram: {
    label: 'Concept Cram & Q&A',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    description: 'Targeted drill on difficult syllabus chapters and formulas.',
    icon: 'Brain',
  },
};

export const VENUE_CONFIG: Record<VenueType, { label: string; isPhysical: boolean; address: string }> = {
  school_library: {
    label: 'School Campus Library',
    isPhysical: true,
    address: 'On-campus designated quiet study rooms during after-school hours',
  },
  hiroo_metropolitan_library: {
    label: 'Tokyo Metropolitan Central Library',
    isPhysical: true,
    address: '5-7-13 Minamiazabu, Minato-ku (Arisugawa-no-miya Park)',
  },
  minato_library: {
    label: 'Minato City Central Library',
    isPhysical: true,
    address: '3-2-25 Shibakoen, Minato-ku (near Tokyo Tower)',
  },
  virtual_zoom: {
    label: 'Secure Video Room (Zoom / Daily)',
    isPhysical: false,
    address: 'Verified members receive the encrypted access link at start time',
  },
  virtual_discord: {
    label: 'Tokyo Student Audio Room',
    isPhysical: false,
    address: 'Private study channel with voice & screen share',
  },
};
