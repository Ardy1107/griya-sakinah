/**
 * Global Video Player Context
 * Allows video to continue playing in mini-player when navigating pages
 * With resizable popup support
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, Minimize2, Maximize2, Move } from 'lucide-react';

const VideoPlayerContext = createContext(null);

// Size presets for quick selection
const SIZE_PRESETS = {
    S: { width: 280, label: 'S' },
    M: { width: 400, label: 'M' },
    L: { width: 560, label: 'L' },
    XL: { width: 720, label: 'XL' },
};

export function useVideoPlayer() {
    const context = useContext(VideoPlayerContext);
    if (!context) {
        throw new Error('useVideoPlayer must be used within VideoPlayerProvider');
    }
    return context;
}

export function VideoPlayerProvider({ children }) {
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [playerSize, setPlayerSize] = useState(() => {
        const saved = localStorage.getItem('video_player_size');
        return saved ? parseInt(saved, 10) : 500;
    });
    const [isResizing, setIsResizing] = useState(false);
    const [inlineMode, setInlineMode] = useState(false); // When true, hide popup player
    const resizeRef = useRef(null);

    // Save size preference
    useEffect(() => {
        localStorage.setItem('video_player_size', playerSize.toString());
    }, [playerSize]);

    const playVideo = useCallback((video) => {
        setCurrentVideo(video);
        setIsVisible(true);
        setIsMinimized(false);
    }, []);

    const minimizePlayer = useCallback(() => {
        setIsMinimized(true);
    }, []);

    const maximizePlayer = useCallback(() => {
        setIsMinimized(false);
    }, []);

    const closePlayer = useCallback(() => {
        setIsVisible(false);
        setCurrentVideo(null);
    }, []);

    // Handle resize drag
    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsResizing(true);
        const startX = e.clientX || e.touches?.[0]?.clientX;
        const startWidth = playerSize;

        const handleMove = (moveEvent) => {
            const currentX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
            const diff = startX - currentX;
            const newWidth = Math.min(900, Math.max(250, startWidth + diff));
            setPlayerSize(newWidth);
        };

        const handleEnd = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);
    };

    return (
        <VideoPlayerContext.Provider value={{
            currentVideo,
            playVideo,
            minimizePlayer,
            closePlayer,
            isMinimized,
            isVisible,
            inlineMode,
            setInlineMode
        }}>
            {children}

            {/* Floating Mini Player - hide when inline mode is active */}
            {isVisible && currentVideo && isMinimized && !inlineMode && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '320px',
                    background: '#1e293b',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 9999,
                    border: '1px solid rgba(255,255,255,0.1)',
                    animation: 'slideIn 0.3s ease'
                }}>
                    {/* Video */}
                    <div style={{
                        position: 'relative',
                        paddingBottom: '56.25%',
                        background: '#000'
                    }}>
                        <iframe
                            src={`https://drive.google.com/file/d/${currentVideo.fileId}/preview`}
                            style={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            allow="autoplay; fullscreen"
                            title={currentVideo.title}
                        />
                    </div>

                    {/* Controls */}
                    <div style={{
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                margin: 0,
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#fff',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {currentVideo.title}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={maximizePlayer}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    display: 'flex'
                                }}
                                title="Maximize"
                            >
                                <Maximize2 size={16} />
                            </button>
                            <button
                                onClick={closePlayer}
                                style={{
                                    background: 'rgba(239,68,68,0.2)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    display: 'flex'
                                }}
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Resizable Player - hide when inline mode is active */}
            {isVisible && currentVideo && !isMinimized && !inlineMode && (
                <div
                    ref={resizeRef}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: `${playerSize}px`,
                        maxWidth: 'calc(100vw - 40px)',
                        background: '#1e293b',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        zIndex: 9999,
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: isResizing ? 'none' : 'width 0.2s ease'
                    }}
                >
                    {/* Header with Size Controls */}
                    <div style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px' }}>🎬</span>
                            <span style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>
                                Sedang Diputar
                            </span>
                        </div>

                        {/* Size Preset Buttons */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {Object.entries(SIZE_PRESETS).map(([key, { width, label }]) => (
                                <button
                                    key={key}
                                    onClick={() => setPlayerSize(width)}
                                    style={{
                                        background: playerSize === width
                                            ? 'linear-gradient(135deg, #10b981, #059669)'
                                            : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                    title={`Ukuran ${label}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Window Controls */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                onClick={minimizePlayer}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    display: 'flex'
                                }}
                                title="Minimize"
                            >
                                <Minimize2 size={14} />
                            </button>
                            <button
                                onClick={closePlayer}
                                style={{
                                    background: 'rgba(239,68,68,0.2)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    display: 'flex'
                                }}
                                title="Close"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Video */}
                    <div style={{
                        position: 'relative',
                        paddingBottom: '56.25%',
                        background: '#000'
                    }}>
                        <iframe
                            src={`https://drive.google.com/file/d/${currentVideo.fileId}/preview`}
                            style={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            allow="autoplay; fullscreen"
                            title={currentVideo.title}
                        />
                    </div>

                    {/* Info + Resize Handle */}
                    <div style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                margin: 0,
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#fff',
                                marginBottom: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {currentVideo.title}
                            </p>
                            <p style={{
                                margin: 0,
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.5)'
                            }}>
                                {currentVideo.duration} • {playerSize}px
                            </p>
                        </div>

                        {/* Resize Handle */}
                        <div
                            onMouseDown={handleResizeStart}
                            onTouchStart={handleResizeStart}
                            style={{
                                cursor: 'nwse-resize',
                                padding: '8px',
                                marginRight: '-8px',
                                marginBottom: '-4px',
                                color: 'rgba(255,255,255,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                userSelect: 'none'
                            }}
                            title="Drag untuk resize"
                        >
                            <Move size={14} />
                            <span style={{ fontSize: '10px' }}>Resize</span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
            `}</style>
        </VideoPlayerContext.Provider>
    );
}
