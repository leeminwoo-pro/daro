-- ====================================================================
-- 📜 도약다로 (Doyakdaro) Supabase #013 올인원 마스터 SQL 스크립트
-- 설명: Supabase SQL Editor에 통째로 복사해서 [Run] 누르면 1초 만에 100% 한 방 완결되는 통합 쿼리!
-- 기능: 다중 사업장(본사/전자/평택) NFC, 최초 1회 기기 보안 락, 8h 기준/연장근로/식사차감 컬럼 자동 보완
-- 작성일: 2026-07-31
-- ====================================================================

-- 1. 팀원 출퇴근 기록표 (attendance_records) 테이블 생성 & 컬럼 자동 확장
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY DEFAULT 'att-' || extract(epoch from now())::text,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clock_out TIMESTAMPTZ,
    total_hours NUMERIC(5,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'WORKING',
    nfc_tagged BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기존 테이블이 있어도 신규 5대 근태 기능 컬럼 자동 추가
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS location_name TEXT DEFAULT '🏢 본사';
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS check_in_type TEXT DEFAULT 'NFC';
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS meal_deduction_hours NUMERIC DEFAULT 1.0;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS overtime_hours NUMERIC DEFAULT 0.0;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS is_weekend BOOLEAN DEFAULT false;


-- 2. 진품 NFC 스티커 및 사업장 관리 (nfc_tags & nfc_locations) 테이블
CREATE TABLE IF NOT EXISTS public.nfc_tags (
    tag_code TEXT PRIMARY KEY,
    tag_uid TEXT,
    location_name TEXT NOT NULL DEFAULT '🏢 본사',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nfc_tags ADD COLUMN IF NOT EXISTS tag_uid TEXT;

-- 호환성을 위한 nfc_locations 뷰/테이블
CREATE TABLE IF NOT EXISTS public.nfc_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_name TEXT NOT NULL,
  nfc_tag_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. 최초 1회 기기 바인딩 보안 락 (user_device_locks) 테이블
CREATE TABLE IF NOT EXISTS public.user_device_locks (
  user_name TEXT PRIMARY KEY,
  device_uuid TEXT NOT NULL,
  bound_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved_by_admin BOOLEAN DEFAULT TRUE
);


-- 4. 시스템 전역 기능 스위치 (system_settings) 테이블
CREATE TABLE IF NOT EXISTS public.system_settings (
    setting_key TEXT PRIMARY KEY,
    setting_val TEXT NOT NULL DEFAULT 'true',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. 기본 3대 사업장(본사, 전자, 평택) NFC 태그 샘플 데이터 등록 & 덮어쓰기
INSERT INTO public.nfc_tags (tag_code, tag_uid, location_name, is_active)
VALUES 
  ('DOYAK_NFC_HQ_2026', '04:A2:8F:B2:1C:60:80', '🏢 본사', true),
  ('DOYAK_NFC_ELECTRONICS_2026', '04:B3:9C:C3:2D:70:90', '⚡ 전자', true),
  ('DOYAK_NFC_PYEONGTAEK_2026', '04:C4:0D:D4:3E:80:A0', '🏭 평택', true)
ON CONFLICT (tag_code) DO UPDATE 
SET tag_uid = EXCLUDED.tag_uid, location_name = EXCLUDED.location_name;

INSERT INTO public.nfc_locations (location_name, nfc_tag_id)
VALUES 
  ('🏢 본사', 'DOYAK_NFC_HQ_2026'),
  ('⚡ 전자', 'DOYAK_NFC_ELECTRONICS_2026'),
  ('🏭 평택', 'DOYAK_NFC_PYEONGTAEK_2026')
ON CONFLICT (nfc_tag_id) DO NOTHING;

INSERT INTO public.system_settings (setting_key, setting_val)
VALUES ('nfc_attendance_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;


-- 6. RLS (Row Level Security) 접근 권한 100% 풀기
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_device_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to attendance_records" ON public.attendance_records;
CREATE POLICY "Allow all access to attendance_records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to nfc_tags" ON public.nfc_tags;
CREATE POLICY "Allow all access to nfc_tags" ON public.nfc_tags FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to nfc_locations" ON public.nfc_locations;
CREATE POLICY "Allow all access to nfc_locations" ON public.nfc_locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to user_device_locks" ON public.user_device_locks;
CREATE POLICY "Allow all access to user_device_locks" ON public.user_device_locks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to system_settings" ON public.system_settings;
CREATE POLICY "Allow all access to system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);


-- 7. Realtime 실시간 동기화 채널 등록
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'attendance_records') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'nfc_tags') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.nfc_tags;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_device_locks') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_device_locks;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'system_settings') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
    END IF;
END $$;
