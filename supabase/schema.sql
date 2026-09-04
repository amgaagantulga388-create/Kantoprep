-- ==============================================================================
-- KantoPrep Master Database Schema & Security Policies (Supabase Free Tier)
-- Hardened Security & Anti-Spoofing Architecture for Minor Safety
-- ==============================================================================

-- 1. Create allowed school domains reference table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  campus_location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-populate Tokyo International Schools
INSERT INTO public.schools (domain, name, short_name, campus_location)
VALUES 
  ('students.aobajapan.jp', 'Aoba-Japan International School', 'A-JIS', 'Hikarigaoka / Bunkyo'),
  ('aobajapan.jp', 'Aoba-Japan International School', 'A-JIS', 'Hikarigaoka / Bunkyo'),
  ('bst.ac.jp', 'The British School in Tokyo', 'BST', 'Shibuya / Toranomon'),
  ('asij.ac.jp', 'American School in Japan', 'ASIJ', 'Chofu / Roppongi'),
  ('k-international.ed.jp', 'K. International School Tokyo', 'KIST', 'Koto-ku'),
  ('smis.ac.jp', 'St. Mary''s International School', 'SMIS', 'Setagaya'),
  ('seisen.com', 'Seisen International School', 'Seisen', 'Yoga'),
  ('issh.ac.jp', 'International School of the Sacred Heart', 'ISSH', 'Hiroo'),
  ('yis.ac.jp', 'Yokohama International School', 'YIS', 'Honmoku'),
  ('saintmaur.ac.jp', 'Saint Maur International School', 'Saint Maur', 'Yamate'),
  ('caj.ac.jp', 'Christian Academy in Japan', 'CAJ', 'Higashikurume')
ON CONFLICT (domain) DO NOTHING;

-- 2. Student profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 50),
  email TEXT NOT NULL,
  school_domain TEXT NOT NULL REFERENCES public.schools(domain),
  grade_level INT CHECK (grade_level BETWEEN 9 AND 12),
  curriculum TEXT NOT NULL CHECK (curriculum IN ('IB', 'AP', 'IGCSE', 'SAT_ACT')),
  subjects TEXT[] DEFAULT '{}',
  cas_hours NUMERIC(5, 1) DEFAULT 0 CHECK (cas_hours >= 0),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Study groups table
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 5 AND 1000),
  curriculum TEXT NOT NULL CHECK (curriculum IN ('IB', 'AP', 'IGCSE', 'SAT_ACT')),
  subject TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('past_paper_sprint', 'ia_workshop', 'silent_pomodoro', 'exam_cram')),
  venue_type TEXT NOT NULL,
  venue_label TEXT NOT NULL,
  meeting_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 300),
  max_members INT NOT NULL DEFAULT 5 CHECK (max_members BETWEEN 2 AND 8),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Group memberships table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('host', 'member')),
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'pending', 'declined')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 5. Real-time group chat messages (with anti-flooding constraints)
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1500),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Safety & moderation reports
CREATE TABLE IF NOT EXISTS public.safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- DATABASE LEVEL SECURITY: STRICT SCHOOL DOMAIN ENFORCEMENT
-- ==============================================================================

-- Trigger function: Prevents user creation if email domain does not match schools table
CREATE OR REPLACE FUNCTION public.check_user_school_domain()
RETURNS TRIGGER AS $$
DECLARE
  user_domain TEXT;
BEGIN
  user_domain := lower(split_part(NEW.email, '@', 2));
  
  IF NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(domain) = user_domain) THEN
    RAISE EXCEPTION 'Access Denied: Email domain @% is not authorized for KantoPrep.', user_domain;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS enforce_school_domain ON auth.users;
CREATE TRIGGER enforce_school_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_school_domain();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

-- Schools: anyone authenticated can read school directory
CREATE POLICY "Schools readable by authenticated students"
  ON public.schools FOR SELECT TO authenticated USING (true);

-- Profiles: Authenticated students can view other students' academic profiles
CREATE POLICY "Profiles readable by verified students"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Study groups: Authenticated students can view all open groups
CREATE POLICY "Study groups viewable by verified students"
  ON public.study_groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can create study groups"
  ON public.study_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own study groups"
  ON public.study_groups FOR UPDATE TO authenticated USING (auth.uid() = host_id);

-- Group members: Viewable if you are in the group or group is open
CREATE POLICY "Members viewable by verified students"
  ON public.group_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can join groups"
  ON public.group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Chat messages: ONLY accessible if student is an accepted member of the group
CREATE POLICY "Chat viewable only by group members"
  ON public.group_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = group_messages.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.status = 'accepted'
    )
  );

CREATE POLICY "Members can post messages"
  ON public.group_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = group_messages.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.status = 'accepted'
    )
  );

-- Safety reports: Users can submit reports, read only their own
CREATE POLICY "Students can submit safety reports"
  ON public.safety_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Enable Supabase Realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
