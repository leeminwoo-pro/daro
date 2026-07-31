-- 🧹 015_clean_up_user_credentials.sql
-- Supabase Cloud DB user_credentials 테이블에서 옛날 테스트 찌꺼기 인원 15명 삭제 및 실존 팀원 6명 전원 보장 마이그레이션

-- Step 1. 실존 팀원 6명('이민우', '박병주', '김진홍', '김일섭', '황지환', '전세계') 외 나머지 찌꺼기 인원 싹 삭제
DELETE FROM public.user_credentials
WHERE username NOT IN ('이민우', '박병주', '김진홍', '김일섭', '황지환', '전세계')
  AND (user_name IS NULL OR user_name NOT IN ('이민우', '박병주', '김진홍', '김일섭', '황지환', '전세계'));

-- Step 2. 실존 팀원 6명 최신 권한 업서트 보장
INSERT INTO public.user_credentials (username, user_name, role, encrypted_passcode, updated_at) VALUES
('이민우', '이민우', 'admin', '75992a5ac67ff644d3063976c2effd10b809d84d7285ffbe280d0d8fd19a9ef9', CURRENT_TIMESTAMP),
('박병주', '박병주', 'editor', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', CURRENT_TIMESTAMP),
('김진홍', '김진홍', 'editor', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', CURRENT_TIMESTAMP),
('김일섭', '김일섭', 'editor', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', CURRENT_TIMESTAMP),
('황지환', '황지환', 'editor', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', CURRENT_TIMESTAMP),
('전세계', '전세계', 'editor', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET
    role = EXCLUDED.role,
    user_name = EXCLUDED.user_name,
    updated_at = CURRENT_TIMESTAMP;
