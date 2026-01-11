/**
 * Video Library Service
 * Handles video categories, videos, and progress tracking
 */

import { supabase } from '../../../lib/supabase';

// ============ CATEGORIES ============

export async function getVideoCategories() {
    const { data, error } = await supabase
        .from('video_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getCategoryBySlug(slug) {
    const { data, error } = await supabase
        .from('video_categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error) throw error;
    return data;
}

// ============ VIDEOS ============

export async function getVideosByCategory(categorySlug) {
    // First get category ID
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];

    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getVideoById(videoId) {
    const { data, error } = await supabase
        .from('videos')
        .select(`
            *,
            video_categories (
                name,
                slug
            )
        `)
        .eq('id', videoId)
        .single();

    if (error) throw error;
    return data;
}

export async function incrementViewCount(videoId) {
    const { error } = await supabase.rpc('increment_video_view', { video_id: videoId });
    if (error) console.error('Failed to increment view count:', error);
}

export async function searchVideos(query) {
    const { data, error } = await supabase
        .from('videos')
        .select(`
            *,
            video_categories (
                name,
                slug
            )
        `)
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
}

// ============ PROGRESS TRACKING ============

export function getDeviceId() {
    let deviceId = localStorage.getItem('spiritual_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('spiritual_device_id', deviceId);
    }
    return deviceId;
}

export async function saveVideoProgress(videoId, positionSeconds, completed = false) {
    const deviceId = getDeviceId();

    const { data, error } = await supabase
        .from('video_progress')
        .upsert({
            video_id: videoId,
            device_id: deviceId,
            last_position_seconds: positionSeconds,
            completed,
            last_watched_at: new Date().toISOString()
        }, {
            onConflict: 'video_id,device_id'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getVideoProgress(videoId) {
    const deviceId = getDeviceId();

    const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('video_id', videoId)
        .eq('device_id', deviceId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function getAllProgress() {
    const deviceId = getDeviceId();

    const { data, error } = await supabase
        .from('video_progress')
        .select(`
            *,
            videos (
                id,
                title,
                duration_minutes,
                video_categories (
                    name,
                    slug
                )
            )
        `)
        .eq('device_id', deviceId)
        .order('last_watched_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getCategoryProgress(categorySlug) {
    const deviceId = getDeviceId();
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return { total: 0, completed: 0, percentage: 0 };

    // Get all videos in category
    const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id')
        .eq('category_id', category.id)
        .eq('is_active', true);

    if (videosError) throw videosError;

    const videoIds = videos.map(v => v.id);

    // Get progress for these videos
    const { data: progress, error: progressError } = await supabase
        .from('video_progress')
        .select('*')
        .eq('device_id', deviceId)
        .in('video_id', videoIds);

    if (progressError) throw progressError;

    const completed = progress?.filter(p => p.completed).length || 0;
    const total = videos.length;

    return {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
}

// ============ UTILITY ============

/**
 * Convert Google Drive URL to embed URL
 * Input: https://drive.google.com/file/d/FILE_ID/view
 * Output: https://drive.google.com/file/d/FILE_ID/preview
 */
export function getGDriveEmbedUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Extract file ID from Google Drive URL
 */
export function extractGDriveFileId(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}
