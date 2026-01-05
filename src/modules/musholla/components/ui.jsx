import React from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * PREMIUM STAT CARD
 */
export function StatCard({
    label,
    value,
    icon: Icon,
    variant = 'default',
    subtitle,
    showDot = true,
    className = ''
}) {
    const variantClass = variant !== 'default' ? variant : '';

    return (
        <div className={`stat-card ${variantClass} ${className}`}>
            {Icon && (
                <div className="stat-icon">
                    <Icon size={24} color="white" />
                </div>
            )}
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            {(subtitle || showDot) && (
                <div className="stat-subtitle">
                    {showDot && <div className="stat-dot" style={{ background: 'currentColor' }} />}
                    <span>{subtitle || 'Live Update'}</span>
                </div>
            )}
        </div>
    );
}

/**
 * PREMIUM PROGRESS BAR
 */
export function ProgressBar({
    value = 0,
    max = 100,
    label,
    showPercentage = true,
    showValues = true
}) {
    const percentage = Math.min(100, Math.round((value / max) * 100));

    return (
        <div>
            {(label || showValues) && (
                <div className="flex justify-between items-center mb-md">
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {label || 'Pencapaian Target'}
                    </span>
                    {showPercentage && (
                        <span style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--islamic-green-light), var(--islamic-green-glow))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {percentage}%
                        </span>
                    )}
                </div>
            )}
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${percentage}%` }}>
                    <div className="progress-glow" />
                </div>
            </div>
        </div>
    );
}

/**
 * PREMIUM BUTTON
 */
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    ...props
}) {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

    return (
        <button
            className={`btn btn-${variant} ${sizeClass} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Loading...</span>
                </>
            ) : children}
        </button>
    );
}

/**
 * PREMIUM MODAL
 */
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${size === 'lg' ? 'modal-lg' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button
                        onClick={onClose}
                        className="btn btn-icon btn-glass"
                        style={{ width: 40, height: 40 }}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * PREMIUM INPUT
 */
export function Input({ label, hint, error, ...props }) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <input className="input" {...props} />
            {hint && <p className="form-hint">{hint}</p>}
            {error && <p className="form-hint" style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>
    );
}

/**
 * PREMIUM SELECT
 */
export function Select({ label, options = [], hint, ...props }) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <select className="select" {...props}>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {hint && <p className="form-hint">{hint}</p>}
        </div>
    );
}

/**
 * PREMIUM TEXTAREA
 */
export function Textarea({ label, hint, ...props }) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <textarea className="textarea" {...props} />
            {hint && <p className="form-hint">{hint}</p>}
        </div>
    );
}

/**
 * PREMIUM BADGE
 */
export function Badge({ children, variant = 'default', className = '' }) {
    const variantClass = variant !== 'default' ? `badge-${variant}` : '';
    return (
        <span className={`badge ${variantClass} ${className}`}>
            {children}
        </span>
    );
}

/**
 * PREMIUM CARD
 */
export function Card({
    children,
    title,
    icon: Icon,
    padding = true,
    className = '',
    style = {}
}) {
    return (
        <div className={`card ${className}`} style={{ padding: padding ? undefined : 0, ...style }}>
            {(title || Icon) && (
                <div className="card-header">
                    {Icon && (
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, var(--islamic-green), var(--islamic-green-light))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                        }}>
                            <Icon size={20} color="white" />
                        </div>
                    )}
                    {title && <h3 className="card-title">{title}</h3>}
                </div>
            )}
            {children}
        </div>
    );
}

/**
 * RANKING BADGE
 */
export function RankBadge({ rank }) {
    const getRankClass = () => {
        if (rank === 1) return 'rank-1';
        if (rank === 2) return 'rank-2';
        if (rank === 3) return 'rank-3';
        return 'rank-other';
    };

    return (
        <div className={`rank-badge ${getRankClass()}`}>
            {rank}
        </div>
    );
}

/**
 * EMPTY STATE
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action
}) {
    return (
        <div className="text-center" style={{ padding: '48px 24px' }}>
            {Icon && (
                <div style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 20px',
                    borderRadius: 24,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={36} style={{ color: 'var(--text-muted)' }} />
                </div>
            )}
            <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '8px'
            }}>
                {title}
            </h3>
            {description && (
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    maxWidth: '300px',
                    margin: '0 auto'
                }}>
                    {description}
                </p>
            )}
            {action && <div style={{ marginTop: '20px' }}>{action}</div>}
        </div>
    );
}

/**
 * LOADING SPINNER
 */
export function LoadingSpinner({ size = 40, color = 'var(--islamic-green)' }) {
    return (
        <div
            className="animate-spin"
            style={{
                width: size,
                height: size,
                border: `4px solid rgba(255,255,255,0.15)`,
                borderTopColor: color,
                borderRadius: '50%'
            }}
        />
    );
}

/**
 * DONOR LIST ITEM (for Top Donatur)
 */
export function DonorListItem({ rank, name, subtitle, amount }) {
    return (
        <div
            className="flex items-center gap-md"
            style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.3s ease'
            }}
        >
            <RankBadge rank={rank} />
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                    {name}
                </p>
                {subtitle && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {subtitle}
                    </p>
                )}
            </div>
            <p style={{
                fontWeight: 800,
                fontSize: '15px',
                background: 'linear-gradient(135deg, var(--islamic-green-light), var(--islamic-green-glow))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                {amount}
            </p>
        </div>
    );
}
