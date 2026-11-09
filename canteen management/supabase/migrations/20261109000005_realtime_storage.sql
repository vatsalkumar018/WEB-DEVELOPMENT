-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - SUPABASE REALTIME & STORAGE CONFIGURATION
-- Migration: 20261109000005_realtime_storage.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. REALTIME REPLICATION CONFIGURATION
-- ----------------------------------------------------------------------------
-- Set replica identity to FULL so realtime listeners receive old & new payloads
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.tokens REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.canteen_settings REPLICA IDENTITY FULL;
ALTER TABLE public.order_status_history REPLICA IDENTITY FULL;
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tokens'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'canteen_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.canteen_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'order_status_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 2. STORAGE BUCKETS SETUP
-- ----------------------------------------------------------------------------
-- Buckets:
--   1. 'menu-images': Publicly readable for dish photos.
--   2. 'profile-avatars': Publicly readable / user-specific write.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('profile-avatars', 'profile-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 3. STORAGE RLS POLICIES
-- ----------------------------------------------------------------------------

-- A. Menu Images Bucket: Public Read
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
CREATE POLICY "Public can view menu images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-images');

-- Menu Images Bucket: Admin & Staff can upload/modify
DROP POLICY IF EXISTS "Staff and Admin can upload menu images" ON storage.objects;
CREATE POLICY "Staff and Admin can upload menu images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'menu-images' AND
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

DROP POLICY IF EXISTS "Staff and Admin can update menu images" ON storage.objects;
CREATE POLICY "Staff and Admin can update menu images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'menu-images' AND
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

DROP POLICY IF EXISTS "Staff and Admin can delete menu images" ON storage.objects;
CREATE POLICY "Staff and Admin can delete menu images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'menu-images' AND
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

-- B. Profile Avatars Bucket: Public Read
DROP POLICY IF EXISTS "Public can view profile avatars" ON storage.objects;
CREATE POLICY "Public can view profile avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-avatars');

-- Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
