// Trend Chart - Mini 3 month comparison
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, getMonthName } from '../utils/helpers'

export default function TrendChart({ payments, title = 'Trend Pemasukan 3 Bulan' }) {
    // Get last 3 months data
    const chartData = getLast3MonthsData(payments)

    // Calculate trend
    const trend = calculateTrend(chartData)

    return (
        <div className="card trend-card">
            <div className="card-header">
                <h3 className="card-title">
                    <TrendingUp size={18} />
                    {title}
                </h3>
                <TrendBadge trend={trend} />
            </div>

            <div className="trend-chart-container">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: 'var(--text-primary)'
                                }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                                formatter={(value) => [formatCurrency(value), 'Total']}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="trend-empty">
                        <p>Belum ada data untuk ditampilkan</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            {chartData.length > 0 && (
                <div className="trend-stats">
                    {chartData.map((item, idx) => (
                        <div key={idx} className="trend-stat">
                            <span className="trend-stat-month">{item.month}</span>
                            <span className="trend-stat-value">{formatCurrency(item.total)}</span>
                            <span className="trend-stat-count">{item.count} transaksi</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function TrendBadge({ trend }) {
    if (trend > 0) {
        return (
            <span className="trend-badge trend-up">
                <TrendingUp size={14} />
                +{trend}%
            </span>
        )
    } else if (trend < 0) {
        return (
            <span className="trend-badge trend-down">
                <TrendingDown size={14} />
                {trend}%
            </span>
        )
    }
    return (
        <span className="trend-badge trend-neutral">
            <Minus size={14} />
            0%
        </span>
    )
}

function getLast3MonthsData(payments) {
    const now = new Date()
    const months = []

    for (let i = 2; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const bulan = date.getMonth() + 1
        const tahun = date.getFullYear()

        const monthPayments = payments.filter(p => p.bulan === bulan && p.tahun === tahun)
        const total = monthPayments.reduce((sum, p) => sum + Number(p.nominal || 0), 0)

        months.push({
            month: getMonthName(bulan).substring(0, 3),
            bulan,
            tahun,
            total,
            count: monthPayments.length
        })
    }

    return months
}

function calculateTrend(data) {
    if (data.length < 2) return 0
    const current = data[data.length - 1].total
    const previous = data[data.length - 2].total
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
}
