// Progress Bar Component
export default function ProgressBar({
    value,
    max = 100,
    label,
    showPercentage = true,
    variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger'
    size = 'md' // 'sm' | 'md' | 'lg'
}) {
    const percentage = Math.round((value / max) * 100)

    const getVariantColor = () => {
        if (percentage >= 80) return 'success'
        if (percentage >= 50) return 'primary'
        if (percentage >= 30) return 'warning'
        return 'danger'
    }

    const autoVariant = variant === 'auto' ? getVariantColor() : variant

    return (
        <div className={`progress-container progress-${size}`}>
            {label && (
                <div className="progress-label">
                    <span>{label}</span>
                    {showPercentage && <span className="progress-percentage">{percentage}%</span>}
                </div>
            )}
            <div className="progress-bar">
                <div
                    className={`progress-fill progress-${autoVariant}`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className="progress-shine" />
                </div>
            </div>
            <div className="progress-info">
                <span>{value} dari {max}</span>
            </div>
        </div>
    )
}
