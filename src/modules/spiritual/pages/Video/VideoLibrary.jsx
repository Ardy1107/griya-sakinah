/**
 * Video Library Component
 * Displays Spiritual Abundance and SEFT videos from Google Drive
 * With persistent mini-player support
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Play, Clock, CheckCircle,
    ChevronRight, Sparkles, Target, BookOpen, Minimize2
} from 'lucide-react';
import { useVideoPlayer } from '../../context/VideoPlayerContext';
import '../../spiritual.css';

// Video categories with Google Drive videos
const VIDEO_CATEGORIES = [
    {
        id: 'abundance',
        title: 'Spiritual Abundance (AFZ)',
        icon: '✨',
        description: 'Program Mentoring 38 Hari Financial & Spiritual Abundance',
        color: '#f59e0b',
        videoCount: 23
    },
    {
        id: 'seft',
        title: 'SEFT Therapy',
        icon: '🎯',
        description: 'Video Tutorial SEFT: Setup, Release, Amplify, Teknik Lanjutan',
        color: '#ef4444',
        videoCount: 4
    }
];

// Sample video data - Replace FILE_ID with actual Google Drive IDs
const VIDEOS = {
    abundance: [
        { id: 1, title: 'Hari 1: Pengantar Spiritual Abundance', duration: '45 menit', fileId: 'PLACEHOLDER_1' },
        { id: 2, title: 'Hari 2: Mindset Kelimpahan vs Kekurangan', duration: '38 menit', fileId: 'PLACEHOLDER_2' },
        { id: 3, title: 'Hari 3: Prinsip 1 - Gratitude (Syukur)', duration: '42 menit', fileId: 'PLACEHOLDER_3' },
        { id: 4, title: 'Hari 4: Prinsip 2 - Giving (Sedekah)', duration: '40 menit', fileId: 'PLACEHOLDER_4' },
        { id: 5, title: 'Hari 5: Prinsip 3 - Trust (Tawakkal)', duration: '35 menit', fileId: 'PLACEHOLDER_5' },
        { id: 6, title: 'Hari 6: Prinsip 4 - Action (Ikhtiar)', duration: '38 menit', fileId: 'PLACEHOLDER_6' },
        { id: 7, title: 'Hari 7: Prinsip 5 - Patience (Sabar)', duration: '36 menit', fileId: 'PLACEHOLDER_7' },
        { id: 8, title: 'Hari 8: Prinsip 6 - Belief (Keyakinan)', duration: '40 menit', fileId: 'PLACEHOLDER_8' },
        { id: 9, title: 'Hari 9: Prinsip 7 - Service (Berbagi)', duration: '42 menit', fileId: 'PLACEHOLDER_9' },
        { id: 10, title: 'Hari 10: Praktik Afirmasi Abundance', duration: '30 menit', fileId: 'PLACEHOLDER_10' },
    ],
    seft: [
        { id: 1, title: 'SEFT Sesi 1: Pengenalan & Dasar', duration: '60 menit', fileId: '14sFUoWZeyp-JYbLhlJeiLsgblQ9TE8FQ' },
        { id: 2, title: 'SEFT Sesi 2: Teknik Setup & Release', duration: '60 menit', fileId: '16_KVtx50lJg4z7XobYvh1aHhVD5hhIZX' },
        { id: 3, title: 'SEFT Sesi 3: Teknik Lanjutan', duration: '60 menit', fileId: '1OEaXmQSQMYy_a1USPwaXboiADGOY5a_d' },
        { id: 4, title: 'SEFT Sesi 4: Praktik & Studi Kasus', duration: '60 menit', fileId: '1hDEV3r1hwGb_LeZk2K6rylzo1_dA5jip' },
    ]
};

export default function VideoLibrary() {
    const navigate = useNavigate();
    const { category } = useParams();
    const { playVideo, minimizePlayer, currentVideo, isVisible } = useVideoPlayer();
    const [watchedVideos, setWatchedVideos] = useState(() => {
        const saved = localStorage.getItem('spiritual_watched_videos');
        return saved ? JSON.parse(saved) : [];
    });

    const markAsWatched = (videoId, categoryId) => {
        const key = `${categoryId}_${videoId}`;
        if (!watchedVideos.includes(key)) {
            const updated = [...watchedVideos, key];
            setWatchedVideos(updated);
            localStorage.setItem('spiritual_watched_videos', JSON.stringify(updated));
        }
    };

    const handlePlayVideo = (video) => {
        playVideo(video);
        markAsWatched(video.id, category);
    };

    const isWatched = (videoId, categoryId) => {
        return watchedVideos.includes(`${categoryId}_${videoId}`);
    };

    // If a specific category is selected
    if (category && VIDEOS[category]) {
        const categoryData = VIDEO_CATEGORIES.find(c => c.id === category);
        const videos = VIDEOS[category];

        return (
            <div className="spiritual-container">
                {/* Header */}
                <div className="spiritual-header" style={{ background: `linear-gradient(135deg, ${categoryData?.color || '#6366f1'} 0%, ${categoryData?.color || '#6366f1'}cc 100%)` }}>
                    <button onClick={() => navigate('/spiritual/videos')} className="back-button">
                        <ArrowLeft size={20} />
                        Kembali
                    </button>
                    <div className="header-content">
                        <span style={{ fontSize: '24px' }}>{categoryData?.icon}</span>
                        <h1>{categoryData?.title}</h1>
                        <p>{categoryData?.description}</p>
                    </div>
                </div>

                <div className="spiritual-content">
                    {/* Now Playing Indicator */}
                    {isVisible && currentVideo && (
                        <div style={{
                            padding: '12px 16px',
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(34,197,94,0.1))',
                            borderRadius: '12px',
                            border: '1px solid rgba(34,197,94,0.3)',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '8px', height: '8px',
                                    borderRadius: '50%',
                                    background: '#22c55e',
                                    animation: 'pulse 2s infinite'
                                }} />
                                <span style={{ fontSize: '13px', color: '#22c55e' }}>
                                    ▶ Sedang Diputar: <strong>{currentVideo.title}</strong>
                                </span>
                            </div>
                            <button
                                onClick={minimizePlayer}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    color: '#fff',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Minimize2 size={14} /> Mini
                            </button>
                        </div>
                    )}

                    {/* Video List */}
                    <div className="spiritual-card" style={{
                        background: 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#fff'
                        }}>
                            <BookOpen size={20} />
                            Daftar Video ({videos.length})
                        </h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {videos.map((video) => {
                                const isPlaying = currentVideo?.id === video.id && currentVideo?.fileId === video.fileId;
                                const watched = isWatched(video.id, category);

                                return (
                                    <button
                                        key={video.id}
                                        onClick={() => handlePlayVideo(video)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            padding: '14px',
                                            background: isPlaying
                                                ? `linear-gradient(135deg, ${categoryData?.color}30, ${categoryData?.color}15)`
                                                : 'rgba(255,255,255,0.03)',
                                            border: isPlaying
                                                ? `2px solid ${categoryData?.color}`
                                                : '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '14px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            width: '100%',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: watched
                                                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                : `linear-gradient(135deg, ${categoryData?.color}, ${categoryData?.color}cc)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            flexShrink: 0,
                                            boxShadow: `0 4px 12px ${watched ? 'rgba(34,197,94,0.3)' : categoryData?.color + '40'}`
                                        }}>
                                            {watched ? <CheckCircle size={20} /> : <Play size={20} />}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: '600',
                                                marginBottom: '4px',
                                                color: '#fff',
                                                fontSize: '14px'
                                            }}>
                                                {video.title}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'rgba(255,255,255,0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <Clock size={12} />
                                                {video.duration}
                                                {watched && (
                                                    <span style={{ color: '#22c55e' }}>• Ditonton</span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}</style>
            </div>
        );
    }

    // Category selection view
    return (
        <div className="spiritual-container">
            {/* Header */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <button onClick={() => navigate('/spiritual')} className="back-button">
                    <ArrowLeft size={20} />
                    Kembali
                </button>
                <div className="header-content">
                    <Play size={32} />
                    <h1>Video Library</h1>
                    <p>Koleksi Video Mentoring Spiritual Abundance & SEFT</p>
                </div>
            </div>

            <div className="spiritual-content">
                {/* Progress Summary */}
                <div className="spiritual-card" style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '8px' }}>📊 Progress Anda</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>
                                {watchedVideos.length}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Video Ditonton</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>
                                {VIDEOS.abundance.length + VIDEOS.seft.length}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Total Video</div>
                        </div>
                    </div>
                </div>

                {/* Category Cards */}
                <div style={{ display: 'grid', gap: '16px' }}>
                    {VIDEO_CATEGORIES.map((cat) => {
                        const videos = VIDEOS[cat.id] || [];
                        const watched = videos.filter(v => isWatched(v.id, cat.id)).length;
                        const progress = videos.length > 0 ? Math.round((watched / videos.length) * 100) : 0;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/spiritual/videos/${cat.id}`)}
                                className="spiritual-card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    border: 'none',
                                    width: '100%'
                                }}
                            >
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    background: `${cat.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px',
                                    flexShrink: 0
                                }}>
                                    {cat.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, marginBottom: '4px' }}>{cat.title}</h3>
                                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>
                                        {cat.description}
                                    </p>
                                    <div style={{
                                        height: '4px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${progress}%`,
                                            background: cat.color,
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                                        {watched}/{videos.length} video • {progress}%
                                    </div>
                                </div>
                                <ChevronRight size={24} style={{ opacity: 0.5 }} />
                            </button>
                        );
                    })}
                </div>

                {/* Info */}
                <div className="spiritual-card" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e' }}>
                    <h4 style={{ margin: 0, marginBottom: '8px' }}>💡 Tips</h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                        Untuk hasil terbaik, tonton video secara berurutan minimal 1 video per hari.
                        Catat insight dan praktikkan langsung setiap materi yang dipelajari.
                    </p>
                </div>
            </div>
        </div>
    );
}
