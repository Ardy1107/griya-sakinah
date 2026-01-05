// Loading Skeleton Components
export function Skeleton({ width, height, className = '', variant = 'rect' }) {
    const style = {
        width: width || '100%',
        height: height || '1rem',
        borderRadius: variant === 'circle' ? '50%' : 'var(--radius-sm)'
    }

    return <div className={`skeleton ${className}`} style={style} />
}

export function CardSkeleton() {
    return (
        <div className="card skeleton-card">
            <div className="skeleton-header">
                <Skeleton width="40px" height="40px" variant="circle" />
                <div className="skeleton-text">
                    <Skeleton width="60%" height="1rem" />
                    <Skeleton width="40%" height="0.75rem" />
                </div>
            </div>
            <Skeleton height="2rem" className="mt-2" />
        </div>
    )
}

export function StatCardSkeleton() {
    return (
        <div className="stat-card">
            <Skeleton width="48px" height="48px" className="skeleton-icon" />
            <div className="stat-content">
                <Skeleton width="80px" height="0.75rem" />
                <Skeleton width="120px" height="1.5rem" className="mt-1" />
            </div>
        </div>
    )
}

export function GridSkeleton({ count = 10 }) {
    return (
        <div className="status-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="status-card skeleton-status">
                    <Skeleton width="60%" height="1.25rem" />
                    <Skeleton width="80%" height="0.75rem" className="mt-1" />
                    <Skeleton width="50px" height="1.25rem" className="mt-2" />
                </div>
            ))}
        </div>
    )
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i}><Skeleton height="0.75rem" /></th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i}>
                            {Array.from({ length: cols }).map((_, j) => (
                                <td key={j}><Skeleton height="0.875rem" /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
