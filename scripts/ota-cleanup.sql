-- =====================================================
-- OTA CLEANUP - Delete old bundles to save storage
-- Run this in Internet Sakinah SQL Editor
-- =====================================================

-- OPTION 1: Keep only the last 5 versions
-- Run this manually when needed, or schedule as cron

-- First, get versions to delete (older than latest 5)
WITH versions_to_keep AS (
    SELECT id FROM app_versions
    ORDER BY created_at DESC
    LIMIT 5
)
DELETE FROM app_versions
WHERE id NOT IN (SELECT id FROM versions_to_keep)
AND bundle_url != ''; -- Don't delete if no bundle (initial version)

-- =====================================================
-- OPTION 2: Delete versions older than 30 days
-- =====================================================

DELETE FROM app_versions
WHERE created_at < NOW() - INTERVAL '30 days'
AND id NOT IN (
    SELECT id FROM app_versions
    ORDER BY created_at DESC
    LIMIT 1
);

-- =====================================================
-- AUTO-CLEANUP FUNCTION (for pg_cron if enabled)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_app_versions()
RETURNS void AS $$
BEGIN
    -- Keep only the latest 5 versions
    DELETE FROM app_versions
    WHERE id NOT IN (
        SELECT id FROM app_versions
        ORDER BY created_at DESC
        LIMIT 5
    )
    AND bundle_url != '';
    
    -- Log cleanup
    RAISE NOTICE 'OTA cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEDULE AUTO-CLEANUP (if pg_cron is enabled)
-- This runs every Sunday at 3 AM
-- =====================================================

-- SELECT cron.schedule('ota-cleanup', '0 3 * * 0', $$SELECT cleanup_old_app_versions();$$);

-- To check scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule:
-- SELECT cron.unschedule('ota-cleanup');

-- =====================================================
-- MANUAL CLEANUP COMMANDS
-- =====================================================

-- Check current versions:
-- SELECT id, version, created_at FROM app_versions ORDER BY created_at DESC;

-- Check storage usage:
-- Go to Supabase Dashboard > Storage > app-bundles

-- Delete specific old file from storage:
-- DELETE FROM storage.objects WHERE bucket_id = 'app-bundles' AND name = 'v1.0.0.zip';
