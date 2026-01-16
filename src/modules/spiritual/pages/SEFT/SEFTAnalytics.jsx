/**
 * SEFT Analytics Dashboard
 * Advanced analytics for SEFT Release tracking with AI-powered emotion analysis
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BarChart3, Target, TrendingUp, RefreshCw,
    Brain, Settings, X, ChevronRight, Sparkles, AlertTriangle,
    Calendar, Activity, Flame, Send, Loader
} from 'lucide-react';
import { getDeviceId } from '../../services/spiritualService';
import {
    getAnalyticsSummary,
    getTopWounds,
    getRecurringWounds,
    getEmotionTimeline,
    getActivityHeatmap,
    getRecommendedToday,
    getEffectivenessScore,
    getUserSettings,
    upsertUserSettings,
    getAvailableCategories
} from '../../services/seftAnalyticsService';
import { analyzeEmotionFromText, getCategoryColor } from '../../services/seftAIService';
import './SEFTAnalytics.css';

export default function SEFTAnalytics() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(14);
    const [deviceId, setDeviceId] = useState(null);

    // Data states
    const [summary, setSummary] = useState(null);
    const [topWounds, setTopWounds] = useState([]);
    const [recurring, setRecurring] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [heatmap, setHeatmap] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [effectiveness, setEffectiveness] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // AI Analyzer states
    const [userText, setUserText] = useState('');
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Settings modal
    const [showSettings, setShowSettings] = useState(false);
    const [userSettings, setUserSettings] = useState({ target_daily_sessions: 2, program_days: 14 });

    useEffect(() => {
        const id = getDeviceId();
        setDeviceId(id);
        loadData(id, period);
    }, []);

    useEffect(() => {
        if (deviceId) {
            loadData(deviceId, period);
        }
    }, [period, deviceId]);

    const loadData = async (id, days) => {
        setLoading(true);
        try {
            const [
                summaryData,
                topWoundsData,
                recurringData,
                timelineData,
                heatmapData,
                recommendedData,
                effectivenessData,
                settingsData,
                categoriesData
            ] = await Promise.all([
                getAnalyticsSummary(id, days),
                getTopWounds(id, days, 8),
                getRecurringWounds(id, days),
                getEmotionTimeline(id, days),
                getActivityHeatmap(id, days),
                getRecommendedToday(id),
                getEffectivenessScore(id, days),
                getUserSettings(id),
                getAvailableCategories(id)
            ]);

            setSummary(summaryData);
            setTopWounds(topWoundsData);
            setRecurring(recurringData);
            setTimeline(timelineData);
            setHeatmap(heatmapData);
            setRecommended(recommendedData);
            setEffectiveness(effectivenessData);
            setUserSettings(settingsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeEmotion = async () => {
        if (!userText.trim() || userText.trim().length < 10) {
            alert('Mohon ceritakan lebih detail perasaan Anda (minimal 10 karakter)');
            return;
        }

        setAiLoading(true);
        try {
            const result = await analyzeEmotionFromText(userText);
            setAiResult(result);
        } catch (error) {
            console.error('AI analysis failed:', error);
            alert('Gagal menganalisis. Silakan coba lagi.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await upsertUserSettings(deviceId, userSettings);
            setShowSettings(false);
            loadData(deviceId, period);
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Gagal menyimpan pengaturan');
        }
    };

    const goToRelease = (woundName, category) => {
        // Navigate to SEFT Release with pre-selected wound
        navigate('/spiritual/seft/release', { state: { preselectedWound: woundName, category } });
    };

    // Get max count for bar width calculation
    const maxWoundCount = topWounds.length > 0 ? Math.max(...topWounds.map(w => w.count)) : 1;

    return (
        <div className="seft-analytics">
            {/* Back Button */}
            <Link to="/spiritual/seft" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke SEFT
            </Link>

            {/* Header */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <div>
                    <h1>
                        <BarChart3 size={28} />
                        SEFT Analytics
                    </h1>
                    <p className="subtitle">Analisis Pola Luka & AI Emotion Detector</p>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Period Selector */}
            <div className="seft-analytics-period-selector">
                {[7, 14, 30].map(days => (
                    <button
                        key={days}
                        className={`seft-analytics-period-btn ${period === days ? 'active' : ''}`}
                        onClick={() => setPeriod(days)}
                    >
                        {days} Hari
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="seft-analytics-loading">
                    <div className="seft-analytics-spinner" />
                    <span>Memuat analitik...</span>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="seft-analytics-summary-grid">
                        <div className="seft-analytics-summary-card">
                            <div className="seft-analytics-summary-value" style={{ color: '#3b82f6' }}>
                                {summary?.totalSessions || 0}
                            </div>
                            <div className="seft-analytics-summary-label">Total Sesi</div>
                            <div className="seft-analytics-summary-sublabel">dalam {period} hari</div>
                        </div>
                        <div className="seft-analytics-summary-card">
                            <div className="seft-analytics-summary-value" style={{ color: '#10b981' }}>
                                {summary?.uniqueWounds || 0}
                            </div>
                            <div className="seft-analytics-summary-label">Luka Unik</div>
                            <div className="seft-analytics-summary-sublabel">jenis berbeda</div>
                        </div>
                        <div className="seft-analytics-summary-card">
                            <div className="seft-analytics-summary-value" style={{ color: '#f59e0b' }}>
                                {summary?.recurringWounds || 0}
                            </div>
                            <div className="seft-analytics-summary-label">Berulang</div>
                            <div className="seft-analytics-summary-sublabel">muncul &gt;1x</div>
                        </div>
                        <div className="seft-analytics-summary-card">
                            <div className="seft-analytics-summary-value" style={{ color: '#22c55e' }}>
                                -{summary?.avgReduction || 0}
                            </div>
                            <div className="seft-analytics-summary-label">Efektivitas</div>
                            <div className="seft-analytics-summary-sublabel">rata-rata turun</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="seft-analytics-progress-container">
                        <div className="seft-analytics-progress-header">
                            <div className="seft-analytics-progress-title">
                                <Target size={18} style={{ color: '#10b981' }} />
                                Target Progress
                            </div>
                            <div className="seft-analytics-progress-value">
                                {summary?.progressPercent || 0}%
                            </div>
                        </div>
                        <div className="seft-analytics-progress-bar">
                            <div
                                className="seft-analytics-progress-fill"
                                style={{ width: `${summary?.progressPercent || 0}%` }}
                            />
                        </div>
                        <div className="seft-analytics-progress-info">
                            <span>{summary?.totalSessions || 0} sesi selesai</span>
                            <span>Target: {summary?.targetTotal || 0} sesi ({userSettings.target_daily_sessions}x/hari)</span>
                        </div>
                    </div>

                    {/* AI Emotion Analyzer */}
                    <div className="seft-analytics-ai-section">
                        <div className="seft-analytics-ai-header">
                            <Brain size={22} style={{ color: '#8b5cf6' }} />
                            <div className="seft-analytics-ai-title">AI Emotion Analyzer</div>
                        </div>
                        <p className="seft-analytics-ai-subtitle">
                            Ceritakan perasaan Anda, AI akan menganalisis dan merekomendasikan luka yang perlu di-SEFT
                        </p>
                        <textarea
                            className="seft-analytics-ai-textarea"
                            placeholder="Contoh: Hari ini saya merasa sangat marah dengan bos saya karena tidak dihargai. Saya juga takut kena PHK..."
                            value={userText}
                            onChange={(e) => setUserText(e.target.value)}
                        />
                        <button
                            className="seft-analytics-ai-btn"
                            onClick={handleAnalyzeEmotion}
                            disabled={aiLoading || userText.trim().length < 10}
                        >
                            {aiLoading ? (
                                <>
                                    <Loader size={18} className="seft-analytics-spinner" />
                                    Menganalisis...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Analisis dengan AI
                                </>
                            )}
                        </button>

                        {/* AI Result */}
                        {aiResult && (
                            <div className="seft-analytics-ai-result">
                                <div className="seft-analytics-ai-section-title">🎯 Emosi Terdeteksi:</div>
                                <div className="seft-analytics-ai-emotions">
                                    {aiResult.detectedEmotions?.map((emotion, idx) => (
                                        <span
                                            key={idx}
                                            className="seft-analytics-ai-emotion-tag"
                                            style={{ background: getCategoryColor(emotion) }}
                                        >
                                            {emotion}
                                        </span>
                                    ))}
                                </div>

                                <div className="seft-analytics-ai-section-title">🔍 Akar Masalah:</div>
                                <p className="seft-analytics-ai-insight">{aiResult.rootCause}</p>

                                <div className="seft-analytics-ai-section-title">💡 Insight:</div>
                                <p className="seft-analytics-ai-insight">{aiResult.insights}</p>

                                <div className="seft-analytics-ai-section-title">📝 Setup SEFT (4 Pilar - Versi Pendek):</div>
                                <div className="seft-analytics-ai-setup">
                                    "{aiResult.setupPendek || aiResult.setupSuggestion}"
                                </div>

                                <div className="seft-analytics-ai-section-title">📜 Setup SEFT (4 Pilar - Versi Lengkap):</div>
                                <div className="seft-analytics-ai-setup" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                                    "{aiResult.setupPanjang || aiResult.setupSuggestion}"
                                </div>

                                {aiResult.affirmation && (
                                    <div className="seft-analytics-ai-affirmation">
                                        ✨ {aiResult.affirmation}
                                    </div>
                                )}

                                <div className="seft-analytics-suggested-wounds">
                                    <div className="seft-analytics-ai-section-title">🩹 Luka yang Perlu Di-Release:</div>
                                    {aiResult.suggestedWounds?.map((wound, idx) => (
                                        <div
                                            key={idx}
                                            className="seft-analytics-wound-card"
                                            onClick={() => goToRelease(wound.name, wound.category)}
                                        >
                                            <div className="seft-analytics-wound-info">
                                                <div
                                                    className="seft-analytics-wound-priority"
                                                    style={{ background: getCategoryColor(wound.category) }}
                                                >
                                                    {wound.priority}
                                                </div>
                                                <div>
                                                    <div className="seft-analytics-wound-name">{wound.name}</div>
                                                    <div className="seft-analytics-wound-category">{wound.reason}</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recommended Today */}
                    {recommended.length > 0 && (
                        <div className="seft-analytics-recommended-section">
                            <div className="seft-analytics-chart-header">
                                <div className="seft-analytics-chart-title">
                                    <Sparkles size={18} style={{ color: '#10b981' }} />
                                    Rekomendasi Hari Ini
                                </div>
                            </div>
                            {recommended.map((rec, idx) => (
                                <Link
                                    key={idx}
                                    to="/spiritual/seft/release"
                                    state={{ preselectedWound: rec.name, category: rec.kategori }}
                                    className="seft-analytics-recommended-item"
                                >
                                    <div className="seft-analytics-recommended-info">
                                        <h4>{rec.name}</h4>
                                        <p className="seft-analytics-recommended-reason">{rec.reason}</p>
                                    </div>
                                    {rec.priority === 'high' && (
                                        <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                                    )}
                                    <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="seft-analytics-filter">
                            <button
                                className={`seft-analytics-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                Semua
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`seft-analytics-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Top Wounds Chart */}
                    <div className="seft-analytics-chart-section">
                        <div className="seft-analytics-chart-header">
                            <div className="seft-analytics-chart-title">
                                <Flame size={18} style={{ color: '#ef4444' }} />
                                Top Luka yang Sering Di-Release
                            </div>
                        </div>
                        {topWounds.length > 0 ? (
                            topWounds
                                .filter(w => selectedCategory === 'all' || w.kategori === selectedCategory)
                                .map((wound, idx) => (
                                    <div key={idx} className="seft-analytics-bar-item">
                                        <div className="seft-analytics-bar-label">
                                            <span className="seft-analytics-bar-name">{wound.name}</span>
                                            <span className="seft-analytics-bar-count">
                                                {wound.count}x (avg -{wound.avgReduction})
                                            </span>
                                        </div>
                                        <div className="seft-analytics-bar-track">
                                            <div
                                                className="seft-analytics-bar-fill"
                                                style={{
                                                    width: `${(wound.count / maxWoundCount) * 100}%`,
                                                    background: getCategoryColor(wound.kategori)
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="seft-analytics-empty">
                                <div className="seft-analytics-empty-icon">📊</div>
                                <p className="seft-analytics-empty-text">
                                    Belum ada data sesi SEFT.<br />
                                    Mulai release luka untuk melihat analitik.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Recurring Wounds */}
                    {recurring.length > 0 && (
                        <div className="seft-analytics-chart-section">
                            <div className="seft-analytics-chart-header">
                                <div className="seft-analytics-chart-title">
                                    <RefreshCw size={18} style={{ color: '#f59e0b' }} />
                                    Pola Kekambuhan
                                </div>
                            </div>
                            {recurring.slice(0, 5).map((wound, idx) => (
                                <div
                                    key={idx}
                                    className="seft-analytics-recurring-item"
                                    style={{ borderLeftColor: getCategoryColor(wound.kategori) }}
                                >
                                    <div className="seft-analytics-recurring-info">
                                        <div className="seft-analytics-recurring-name">{wound.name}</div>
                                        <div className="seft-analytics-recurring-stats">
                                            Muncul {wound.recurrenceCount}x •
                                            Interval rata-rata {wound.avgIntervalDays} hari •
                                            Terakhir {wound.daysSinceLast} hari lalu
                                        </div>
                                    </div>
                                    {wound.needsAttention && (
                                        <div className="seft-analytics-recurring-alert">
                                            ⚠️ Perlu Perhatian
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Timeline Chart */}
                    {timeline.length > 0 && (
                        <div className="seft-analytics-chart-section seft-analytics-timeline">
                            <div className="seft-analytics-chart-header">
                                <div className="seft-analytics-chart-title">
                                    <TrendingUp size={18} style={{ color: '#3b82f6' }} />
                                    Timeline Intensitas Emosi
                                </div>
                            </div>
                            <div className="seft-analytics-timeline-chart">
                                {timeline.map((day, idx) => {
                                    const height = (day.avgBefore / 10) * 100;
                                    return (
                                        <div
                                            key={idx}
                                            className="seft-analytics-timeline-bar"
                                            style={{ height: `${Math.max(height, 10)}%` }}
                                            data-value={day.avgBefore}
                                            title={`${day.date}: Before ${day.avgBefore} → After ${day.avgAfter}`}
                                        />
                                    );
                                })}
                            </div>
                            <div className="seft-analytics-timeline-labels">
                                <span className="seft-analytics-timeline-label">
                                    {timeline[0]?.date?.split('-').slice(1).join('/')}
                                </span>
                                <span className="seft-analytics-timeline-label">
                                    {timeline[timeline.length - 1]?.date?.split('-').slice(1).join('/')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Activity Heatmap */}
                    {heatmap.length > 0 && (
                        <div className="seft-analytics-chart-section">
                            <div className="seft-analytics-chart-header">
                                <div className="seft-analytics-chart-title">
                                    <Activity size={18} style={{ color: '#22c55e' }} />
                                    Heatmap Aktivitas
                                </div>
                            </div>
                            <div className="seft-analytics-heatmap-labels">
                                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                    <span key={day} className="seft-analytics-heatmap-label">{day}</span>
                                ))}
                            </div>
                            <div style={{ marginTop: '8px' }}>
                                {[0, 1, 2, 3].map(week => (
                                    <div key={week} className="seft-analytics-heatmap">
                                        {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                            const cell = heatmap.find(h => h.week === week && h.day === day);
                                            const level = cell?.count >= 4 ? 4 : cell?.count >= 3 ? 3 : cell?.count >= 2 ? 2 : cell?.count >= 1 ? 1 : 0;
                                            return (
                                                <div
                                                    key={`${week}-${day}`}
                                                    className={`seft-analytics-heatmap-cell level-${level}`}
                                                    title={cell ? `${cell.count} sesi` : '0 sesi'}
                                                >
                                                    {cell?.count || ''}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Effectiveness by Category */}
                    {effectiveness?.byCategory?.length > 0 && (
                        <div className="seft-analytics-chart-section">
                            <div className="seft-analytics-chart-header">
                                <div className="seft-analytics-chart-title">
                                    <Target size={18} style={{ color: '#8b5cf6' }} />
                                    Efektivitas per Kategori
                                </div>
                            </div>
                            {effectiveness.byCategory.map((cat, idx) => (
                                <div key={idx} className="seft-analytics-bar-item">
                                    <div className="seft-analytics-bar-label">
                                        <span className="seft-analytics-bar-name">{cat.kategori}</span>
                                        <span className="seft-analytics-bar-count">
                                            -{cat.avgReduction} rata-rata ({cat.sessions} sesi)
                                        </span>
                                    </div>
                                    <div className="seft-analytics-bar-track">
                                        <div
                                            className="seft-analytics-bar-fill"
                                            style={{
                                                width: `${(cat.avgReduction / 10) * 100}%`,
                                                background: getCategoryColor(cat.kategori)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="seft-analytics-modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="seft-analytics-modal" onClick={e => e.stopPropagation()}>
                        <div className="seft-analytics-modal-header">
                            <h3 className="seft-analytics-modal-title">⚙️ Pengaturan Target</h3>
                            <button className="seft-analytics-modal-close" onClick={() => setShowSettings(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="seft-analytics-form-group">
                            <label className="seft-analytics-form-label">Target Sesi per Hari</label>
                            <input
                                type="number"
                                className="seft-analytics-form-input"
                                value={userSettings.target_daily_sessions}
                                onChange={(e) => setUserSettings({
                                    ...userSettings,
                                    target_daily_sessions: parseInt(e.target.value) || 1
                                })}
                                min="1"
                                max="10"
                            />
                        </div>

                        <div className="seft-analytics-form-group">
                            <label className="seft-analytics-form-label">Program (Hari)</label>
                            <select
                                className="seft-analytics-form-input"
                                value={userSettings.program_days}
                                onChange={(e) => setUserSettings({
                                    ...userSettings,
                                    program_days: parseInt(e.target.value)
                                })}
                            >
                                <option value={7}>7 Hari - Quick Start</option>
                                <option value={14}>14 Hari - Recommended</option>
                                <option value={30}>30 Hari - Deep Healing</option>
                            </select>
                        </div>

                        <button className="seft-analytics-modal-btn" onClick={handleSaveSettings}>
                            💾 Simpan Pengaturan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
