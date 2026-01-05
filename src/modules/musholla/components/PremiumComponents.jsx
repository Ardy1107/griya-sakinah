import React from 'react';
import { Calendar, ChevronDown, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PREMIUM MONTH PICKER - Theme Aware
 * Beautiful pill-style month selector
 */
export function PremiumMonthPicker({
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
    darkMode = true,
    minYear = 2025
}) {
    const months = [
        { value: 0, label: 'Jan' },
        { value: 1, label: 'Feb' },
        { value: 2, label: 'Mar' },
        { value: 3, label: 'Apr' },
        { value: 4, label: 'Mei' },
        { value: 5, label: 'Jun' },
        { value: 6, label: 'Jul' },
        { value: 7, label: 'Agu' },
        { value: 8, label: 'Sep' },
        { value: 9, label: 'Okt' },
        { value: 10, label: 'Nov' },
        { value: 11, label: 'Des' }
    ];

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = minYear; y <= currentYear + 1; y++) {
        years.push(y);
    }

    // Theme colors
    const colors = {
        bg: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
        border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        text: darkMode ? '#ffffff' : '#1f2937',
        textMuted: darkMode ? 'rgba(255,255,255,0.5)' : '#6b7280',
        activeBg: 'linear-gradient(135deg, #059669, #10B981)',
        activeText: '#ffffff',
        hoverBg: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: colors.bg,
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
            backdropFilter: 'blur(10px)',
            flexWrap: 'wrap'
        }}>
            {/* Calendar Icon */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingRight: '12px',
                borderRight: `1px solid ${colors.border}`
            }}>
                <Calendar size={18} style={{ color: colors.textMuted }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textMuted }}>
                    Periode
                </span>
            </div>

            {/* All Button */}
            <button
                onClick={() => onMonthChange(-1)}
                style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: selectedMonth === -1 ? colors.activeBg : 'transparent',
                    color: selectedMonth === -1 ? colors.activeText : colors.textMuted,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedMonth === -1 ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
            >
                Semua
            </button>

            {/* Month Pills */}
            <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap'
            }}>
                {months.map(month => (
                    <button
                        key={month.value}
                        onClick={() => onMonthChange(month.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: selectedMonth === month.value ? colors.activeBg : 'transparent',
                            color: selectedMonth === month.value ? colors.activeText : colors.text,
                            fontSize: '13px',
                            fontWeight: selectedMonth === month.value ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: selectedMonth === month.value ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                            opacity: selectedMonth === month.value ? 1 : 0.7
                        }}
                        onMouseEnter={e => {
                            if (selectedMonth !== month.value) {
                                e.currentTarget.style.background = colors.hoverBg;
                                e.currentTarget.style.opacity = '1';
                            }
                        }}
                        onMouseLeave={e => {
                            if (selectedMonth !== month.value) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.opacity = '0.7';
                            }
                        }}
                    >
                        {month.label}
                    </button>
                ))}
            </div>

            {/* Year Selector */}
            <div style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                <button
                    onClick={() => onYearChange(selectedYear - 1)}
                    disabled={selectedYear <= minYear}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        border: 'none',
                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: colors.text,
                        cursor: selectedYear <= minYear ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: selectedYear <= minYear ? 0.3 : 0.7,
                        transition: 'all 0.2s'
                    }}
                >
                    <ChevronLeft size={16} />
                </button>
                <div style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: colors.text,
                    fontWeight: 700,
                    fontSize: '14px',
                    minWidth: '70px',
                    textAlign: 'center'
                }}>
                    {selectedYear}
                </div>
                <button
                    onClick={() => onYearChange(selectedYear + 1)}
                    disabled={selectedYear >= currentYear + 1}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        border: 'none',
                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: colors.text,
                        cursor: selectedYear >= currentYear + 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: selectedYear >= currentYear + 1 ? 0.3 : 0.7,
                        transition: 'all 0.2s'
                    }}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

/**
 * PREMIUM SEARCH BOX - Theme Aware
 */
export function PremiumSearchBox({
    value,
    onChange,
    placeholder = 'Cari...',
    darkMode = true
}) {
    const colors = {
        bg: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,1)',
        border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)',
        text: darkMode ? '#ffffff' : '#1f2937',
        textMuted: darkMode ? 'rgba(255,255,255,0.4)' : '#9ca3af',
        focusBorder: '#10B981'
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search
                size={18}
                style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.textMuted
                }}
            />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '14px 44px 14px 48px',
                    borderRadius: '14px',
                    border: `2px solid ${colors.border}`,
                    background: colors.bg,
                    color: colors.text,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s'
                }}
                onFocus={e => {
                    e.currentTarget.style.borderColor = colors.focusBorder;
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={e => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                }}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        border: 'none',
                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        color: colors.textMuted,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

/**
 * PREMIUM MODAL - Theme Aware
 */
export function PremiumModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'md',
    darkMode = true
}) {
    if (!isOpen) return null;

    const colors = {
        overlay: 'rgba(0,0,0,0.7)',
        bg: darkMode
            ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
        border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        text: darkMode ? '#ffffff' : '#1f2937',
        textMuted: darkMode ? 'rgba(255,255,255,0.5)' : '#6b7280',
        headerBorder: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
    };

    const maxWidths = {
        sm: '420px',
        md: '560px',
        lg: '720px',
        xl: '900px'
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: colors.overlay,
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                zIndex: 1000,
                animation: 'fadeIn 0.3s ease'
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: colors.bg,
                    borderRadius: '24px',
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                    width: '100%',
                    maxWidth: maxWidths[size],
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px 28px',
                    borderBottom: `1px solid ${colors.headerBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            color: colors.text,
                            marginBottom: subtitle ? '4px' : 0
                        }}>
                            {title}
                        </h2>
                        {subtitle && (
                            <p style={{ fontSize: '14px', color: colors.textMuted }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            border: 'none',
                            background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            color: colors.textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: '28px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {children}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}

/**
 * PREMIUM FORM INPUT - Theme Aware
 */
export function PremiumInput({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    required = false,
    darkMode = true,
    prefix,
    ...props
}) {
    const colors = {
        bg: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,1)',
        border: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        text: darkMode ? '#ffffff' : '#1f2937',
        textMuted: darkMode ? 'rgba(255,255,255,0.4)' : '#9ca3af',
        label: darkMode ? 'rgba(255,255,255,0.7)' : '#374151',
        focusBorder: '#10B981'
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            {label && (
                <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.label,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                {prefix && (
                    <span style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: colors.textMuted,
                        fontWeight: 600
                    }}>
                        {prefix}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: prefix ? '14px 18px 14px 48px' : '14px 18px',
                        borderRadius: '14px',
                        border: `2px solid ${colors.border}`,
                        background: colors.bg,
                        color: colors.text,
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.3s'
                    }}
                    onFocus={e => {
                        e.currentTarget.style.borderColor = colors.focusBorder;
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                    }}
                    onBlur={e => {
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                    {...props}
                />
            </div>
        </div>
    );
}

/**
 * PREMIUM SELECT - Theme Aware
 */
export function PremiumSelect({
    label,
    value,
    onChange,
    options = [],
    darkMode = true,
    required = false
}) {
    const colors = {
        bg: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,1)',
        border: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        text: darkMode ? '#ffffff' : '#1f2937',
        label: darkMode ? 'rgba(255,255,255,0.7)' : '#374151',
        focusBorder: '#10B981'
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            {label && (
                <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.label,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '14px 48px 14px 18px',
                        borderRadius: '14px',
                        border: `2px solid ${colors.border}`,
                        background: colors.bg,
                        color: colors.text,
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        transition: 'all 0.3s'
                    }}
                    onFocus={e => {
                        e.currentTarget.style.borderColor = colors.focusBorder;
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                    }}
                    onBlur={e => {
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value} style={{
                            background: darkMode ? '#1e293b' : '#ffffff',
                            color: darkMode ? '#ffffff' : '#1f2937'
                        }}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={18}
                    style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: colors.text,
                        pointerEvents: 'none'
                    }}
                />
            </div>
        </div>
    );
}

/**
 * PREMIUM BUTTON - Theme Aware
 */
export function PremiumButton({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    loading = false,
    fullWidth = false,
    darkMode = true
}) {
    const sizes = {
        sm: { padding: '10px 18px', fontSize: '13px' },
        md: { padding: '14px 24px', fontSize: '14px' },
        lg: { padding: '18px 32px', fontSize: '16px' }
    };

    const variants = {
        primary: {
            bg: 'linear-gradient(135deg, #059669, #10B981)',
            color: '#ffffff',
            shadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
        },
        secondary: {
            bg: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            color: darkMode ? '#ffffff' : '#1f2937',
            shadow: 'none'
        },
        danger: {
            bg: 'linear-gradient(135deg, #E11D48, #FB7185)',
            color: '#ffffff',
            shadow: '0 4px 16px rgba(225, 29, 72, 0.4)'
        },
        outline: {
            bg: 'transparent',
            color: darkMode ? '#10B981' : '#059669',
            shadow: 'none',
            border: `2px solid ${darkMode ? '#10B981' : '#059669'}`
        }
    };

    const v = variants[variant];
    const s = sizes[size];

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            style={{
                ...s,
                width: fullWidth ? '100%' : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '14px',
                border: v.border || 'none',
                background: v.bg,
                color: v.color,
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                boxShadow: v.shadow,
                transition: 'all 0.3s',
                fontFamily: 'inherit'
            }}
        >
            {loading ? (
                <>
                    <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    Loading...
                </>
            ) : children}
        </button>
    );
}
