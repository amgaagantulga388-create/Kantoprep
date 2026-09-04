export type Curriculum = 'IB' | 'AP' | 'IGCSE' | 'SAT_ACT';

export type SessionFormat = 
  | 'past_paper_sprint' 
  | 'ia_workshop' 
  | 'silent_pomodoro' 
  | 'exam_cram';

export type VenueType = 
  | 'hikarigaoka_library'
  | 'hiroo_metropolitan_library' 
  | 'minato_library' 
  | 'shibuya_central_library'
  | 'setagaya_central_library'
  | 'chiyoda_central_library'
  | 'yokohama_central_library'
  | 'school_library' 
  | 'virtual_zoom' 
  | 'virtual_discord';

export interface SchoolInfo {
  domain: string;
  name: string;
  shortName: string;
  campus: string;
  badgeColor: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  schoolDomain: string;
  schoolName: string;
  gradeLevel: number; // 9, 10, 11, 12
  curriculum: Curriculum;
  subjects: string[];
  casHours?: number;
  avatarUrl?: string;
  role?: 'student' | 'admin';
}

export type ResourceCategory = 'past_paper' | 'markscheme' | 'notes' | 'rubric' | 'other';

export interface ResourceMetadata {
  id: string;
  title: string;
  url: string;
  category: ResourceCategory;
  sharedBy: string;
  createdAt: string;
}

export interface PodTimer {
  endTime: number; // epoch ms
  durationMinutes: number;
  isRunning: boolean;
  startedBy: string;
}

export interface StudyGroup {
  id: string;
  title: string;
  description: string;
  curriculum: Curriculum;
  subject: string;
  format: SessionFormat;
  venueType: VenueType;
  venueLabel: string;
  meetingTime: string; // ISO date string or formatted label
  durationMinutes: number;
  maxMembers: number;
  host: StudentProfile;
  members: StudentProfile[];
  status: 'open' | 'full' | 'completed' | 'cancelled';
  tags: string[];
  resources?: ResourceMetadata[];
  activeTimer?: PodTimer | null;
  createdAt: string;
}

export type MessageType = 'text' | 'resource_link' | 'timer_event' | 'system';

export interface ChatMessage {
  id: string;
  groupId: string;
  sender: StudentProfile;
  content: string;
  createdAt: string;
  isSystem?: boolean;
  type?: MessageType;
  resource?: ResourceMetadata;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  targetUserId: string;
  groupId: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'action_taken';
  createdAt: string;
}

export interface FeedbackReport {
  id: string;
  category: 'venue_suggestion' | 'feature_request' | 'bug_report' | 'general';
  message: string;
  studentEmail?: string;
  createdAt: string;
}
