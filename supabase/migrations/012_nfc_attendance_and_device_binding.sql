-- ====================================================================
-- 📜 도약다로 (Doyakdaro) Supabase Migration #012
-- 기능: NFC 사업장 마스터, 사용자 기기 보안 락, 근태 장소/수단 컬럼 확장
-- 작성일: 2026-07-31
-- ====================================================================

-- 1. 사업장별 NFC 태그 정보 마스터 테이블 (본사, 전자, 평택 등)
CREATE TABLE IF NOT EXISTS public.nfc_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_name TEXT NOT NULL, -- '본사', '전자', '평택' 등
  nfc_tag_id TEXT UNIQUE NOT NULL, -- NFC 고유 태그 ID / Payload
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 기본 사업장 데이터 등록 (선택적 기본값)
INSERT INTO public.nfc_locations (location_name, nfc_tag_id)
VALUES 
  ('본사', 'NFC_TAG_HQ_DEFAULT_001'),
  ('전자', 'NFC_TAG_ELECTRONICS_002'),
  ('평택', 'NFC_TAG_PYEONGTAEK_003')
ON CONFLICT (nfc_tag_id) DO NOTHING;


-- 2. 사용자 기기 보안 락 (최초 1회 기기 바인딩) 테이블
CREATE TABLE IF NOT EXISTS public.user_device_locks (
  user_name TEXT PRIMARY KEY,
  device_uuid TEXT NOT NULL, -- 최초 등록 기기 고유 식별자 (Fingerprint / UUID)
  bound_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved_by_admin BOOLEAN DEFAULT TRUE -- 최고관리자 재설정/승인 여부
);


-- 3. 근태 기록 테이블 컬럼 확장 (출근 장소, 출근 수단, 식사시간 차감, 연장근로 시간)
ALTER TABLE public.attendance_logs 
  ADD COLUMN IF NOT EXISTS location_name TEXT DEFAULT '본사',
  ADD COLUMN IF NOT EXISTS check_in_type TEXT DEFAULT 'NFC', -- 'NFC' 또는 'MANUAL_ADMIN'
  ADD COLUMN IF NOT EXISTS meal_deduction_hours NUMERIC DEFAULT 1.0, -- 식사시간 기본 1시간 차감
  ADD COLUMN IF NOT EXISTS overtime_hours NUMERIC DEFAULT 0.0, -- 연장근로 시간
  ADD COLUMN IF NOT EXISTS is_weekend BOOLEAN DEFAULT FALSE; -- 주말 근무 여부


-- 4. RLS (Row Level Security) 정책 설정 (모든 인증 사용자 읽기/쓰기 허용)
ALTER TABLE public.nfc_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_device_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to nfc_locations" ON public.nfc_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to user_device_locks" ON public.user_device_locks FOR ALL USING (true) WITH CHECK (true);
