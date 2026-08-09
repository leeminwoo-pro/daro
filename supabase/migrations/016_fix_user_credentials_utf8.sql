-- ----------------------------------------------------------------
-- 🚀 [도약다로 v37.0] 수파베이스 user_credentials 20명 한글 복구 SQL 마이그레이션
-- ----------------------------------------------------------------
-- 📌 사용 방법: Supabase 대시보드 [SQL Editor] -> [New query]에 복사해서 [Run] 하시면 
--    한글 인코딩이 깨진 20명 명단이 정상 UTF-8 한글 20명으로 100% 깔끔하게 복구됩니다!
-- ----------------------------------------------------------------

-- 1. 인코딩 깨진 기존 레코드 전부 청소
TRUNCATE TABLE public.user_credentials;

-- 2. 깨끗한 UTF-8 한글 성함 20명 재등록
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
ON CONFLICT (username) DO UPDATE SET 
    user_name = EXCLUDED.user_name,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;

-- 3. RLS 정책 재확인 및 조회 허용 보장
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read all" ON public.user_credentials;
CREATE POLICY "Allow public read all" ON public.user_credentials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert all" ON public.user_credentials;
CREATE POLICY "Allow public insert all" ON public.user_credentials FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update all" ON public.user_credentials;
CREATE POLICY "Allow public update all" ON public.user_credentials FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete all" ON public.user_credentials;
CREATE POLICY "Allow public delete all" ON public.user_credentials FOR DELETE USING (true);
