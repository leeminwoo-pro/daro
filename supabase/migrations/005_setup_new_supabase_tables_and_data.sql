-- ----------------------------------------------------------------
-- 🚀 [도약다로 v36.0] 새 Supabase 프로젝트 DB 통합 마스터 자동 세팅 SQL
-- ----------------------------------------------------------------
-- 📌 사용 방법: Supabase 대시보드 좌측 메뉴 [SQL Editor] ➔ [New query] 에 
--    이 전체 쿼리를 복사-붙여넣기 한 뒤 오른쪽 아래 [Run] (▶️ 실행) 버튼을 1회 눌러주세요!
-- ----------------------------------------------------------------

-- 1️⃣ 팀원 계정 및 권한 관리 테이블 (user_credentials)
CREATE TABLE IF NOT EXISTS public.user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE,
    user_name TEXT,
    role TEXT DEFAULT 'editor',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read all" ON public.user_credentials;
CREATE POLICY "Allow public read all" ON public.user_credentials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert all" ON public.user_credentials;
CREATE POLICY "Allow public insert all" ON public.user_credentials FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update all" ON public.user_credentials;
CREATE POLICY "Allow public update all" ON public.user_credentials FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete all" ON public.user_credentials;
CREATE POLICY "Allow public delete all" ON public.user_credentials FOR DELETE USING (true);


-- 2️⃣ 일정 및 목표 관리 테이블 (schedules) - ⭐ 핵심 일정 관리!
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    assignee TEXT,
    due_date TEXT,
    dueDate TEXT,
    priority TEXT DEFAULT 'medium',
    xp INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read schedules" ON public.schedules;
CREATE POLICY "Allow public read schedules" ON public.schedules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert schedules" ON public.schedules;
CREATE POLICY "Allow public insert schedules" ON public.schedules FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update schedules" ON public.schedules;
CREATE POLICY "Allow public update schedules" ON public.schedules FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete schedules" ON public.schedules;
CREATE POLICY "Allow public delete schedules" ON public.schedules FOR DELETE USING (true);


-- 3️⃣ 아이디어 보물상자 테이블 (ideas)
CREATE TABLE IF NOT EXISTS public.ideas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read ideas" ON public.ideas;
CREATE POLICY "Allow public read ideas" ON public.ideas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert ideas" ON public.ideas;
CREATE POLICY "Allow public insert ideas" ON public.ideas FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update ideas" ON public.ideas;
CREATE POLICY "Allow public update ideas" ON public.ideas FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete ideas" ON public.ideas;
CREATE POLICY "Allow public delete ideas" ON public.ideas FOR DELETE USING (true);


-- 4️⃣ 회의록 관리 테이블 (meetings)
CREATE TABLE IF NOT EXISTS public.meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    attendees TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read meetings" ON public.meetings;
CREATE POLICY "Allow public read meetings" ON public.meetings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert meetings" ON public.meetings;
CREATE POLICY "Allow public insert meetings" ON public.meetings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update meetings" ON public.meetings;
CREATE POLICY "Allow public update meetings" ON public.meetings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete meetings" ON public.meetings;
CREATE POLICY "Allow public delete meetings" ON public.meetings FOR DELETE USING (true);


-- 5️⃣ 출퇴근 기록 저장 테이블 (attendance_records)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    location_name TEXT DEFAULT '🏢 본사',
    tag_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read attendance" ON public.attendance_records;
CREATE POLICY "Allow public read attendance" ON public.attendance_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert attendance" ON public.attendance_records;
CREATE POLICY "Allow public insert attendance" ON public.attendance_records FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update attendance" ON public.attendance_records;
CREATE POLICY "Allow public update attendance" ON public.attendance_records FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete attendance" ON public.attendance_records;
CREATE POLICY "Allow public delete attendance" ON public.attendance_records FOR DELETE USING (true);


-- 6️⃣ NFC 스티커 및 장소 정보 테이블 (nfc_tags)
CREATE TABLE IF NOT EXISTS public.nfc_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_code TEXT UNIQUE NOT NULL,
    location_name TEXT NOT NULL,
    physical_uid TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read nfc_tags" ON public.nfc_tags;
CREATE POLICY "Allow public read nfc_tags" ON public.nfc_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert nfc_tags" ON public.nfc_tags;
CREATE POLICY "Allow public insert nfc_tags" ON public.nfc_tags FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update nfc_tags" ON public.nfc_tags;
CREATE POLICY "Allow public update nfc_tags" ON public.nfc_tags FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete nfc_tags" ON public.nfc_tags;
CREATE POLICY "Allow public delete nfc_tags" ON public.nfc_tags FOR DELETE USING (true);


-- ----------------------------------------------------------------
-- 👥 7️⃣ 기존 팀원 20명 명단 & NFC 장소 자동 이관 초기 데이터 삽입
-- ----------------------------------------------------------------

INSERT INTO public.user_credentials (username, user_name, role) VALUES
('이민우', '이민우', 'admin'),
('김철수', '김철수', 'editor'),
('이영희', '이영희', 'editor'),
('박민수', '박민수', 'editor'),
('최지은', '최지은', 'editor'),
('정태양', '정태양', 'editor'),
('한소희', '한소희', 'editor'),
('윤서준', '윤서준', 'editor'),
('장다은', '장다은', 'editor'),
('임현우', '임현우', 'editor'),
('송지원', '송지원', 'editor'),
('오세훈', '오세훈', 'editor'),
('권유리', '권유리', 'editor'),
('신동엽', '신동엽', 'editor'),
('유재석', '유재석', 'editor'),
('강호동', '강호동', 'editor'),
('이수근', '이수근', 'editor'),
('하동훈', '하동훈', 'editor'),
('김종국', '김종국', 'editor'),
('노홍철', '노홍철', 'editor')
ON CONFLICT (username) DO UPDATE SET role = EXCLUDED.role, user_name = EXCLUDED.user_name;

INSERT INTO public.nfc_tags (tag_code, location_name) VALUES
('BONSA', '🏢 본사'),
('ELEC', '⚡ 전자'),
('PYUNG', '🏭 평택')
ON CONFLICT (tag_code) DO UPDATE SET location_name = EXCLUDED.location_name;
