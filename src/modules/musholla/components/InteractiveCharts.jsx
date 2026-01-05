/**
 * Interactive Charts Component for Musholla Dashboard
 * Features: Bar Chart, Donut Chart, Area Chart with tooltips and drill-down
 */

import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area,
    LineChart, Line
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Filter } from 'lucide-react';

// Color palette
const COLORS = {
    green: '#10B981',
    greenLight: '#34D399',
    rose: '#F43F5E',
    roseLight: '#FB7185',
    blue: '#3B82F6',
    blueLight: '#60A5FA',
    gold: '#F59E0B',
    goldLight: '#FBBF24',
    purple: '#8B5CF6',
    purpleLight: '#A78BFA'
};

const CHART_COLORS = [COLORS.green, COLORS.blue, COLORS.gold, COLORS.purple, COLORS.rose];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, darkMode = true }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)'
            }}>
                <p style={{
                    fontWeight: 700,
                    color: darkMode ? '#fff' : '#1f2937',
                    marginBottom: '8px',
                    fontSize: '14px'
                }}>
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <p key={index} style={{
                        color: entry.color,
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: entry.color,
                            display: 'inline-block'
                        }} />
                        {entry.name}: Rp {Number(entry.value).toLocaleString('id-ID')}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Monthly Donation Bar Chart
export function DonationBarChart({ data = [], darkMode = true, onBarClick }) {
    const textColor = darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
    const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return (
        <div style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '20px',
            padding: '24px',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingUp size={20} color={COLORS.green} />
                    <h3 style={{
                        fontWeight: 700,
                        color: darkMode ? '#fff' : '#1f2937',
                        fontSize: '16px'
                    }}>
                        Donasi Bulanan
                    </h3>
                </div>
                <button
                    onClick={() => exportChart('donasi-bulanan')}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: textColor,
                        fontSize: '13px'
                    }}
                >
                    <Download size={14} />
                    Export
                </button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} onClick={onBarClick}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="bulan"
                        tick={{ fill: textColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                    />
                    <YAxis
                        tick={{ fill: textColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                    />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Legend />
                    <Bar
                        dataKey="donasi"
                        name="Donasi"
                        fill={COLORS.green}
                        radius={[8, 8, 0, 0]}
                        cursor="pointer"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Expense Area Chart
export function ExpenseAreaChart({ data = [], darkMode = true }) {
    const textColor = darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
    const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return (
        <div style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '20px',
            padding: '24px',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
            }}>
                <TrendingDown size={20} color={COLORS.rose} />
                <h3 style={{
                    fontWeight: 700,
                    color: darkMode ? '#fff' : '#1f2937',
                    fontSize: '16px'
                }}>
                    Trend Pengeluaran
                </h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="bulan"
                        tick={{ fill: textColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                    />
                    <YAxis
                        tick={{ fill: textColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                    />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Area
                        type="monotone"
                        dataKey="pengeluaran"
                        name="Pengeluaran"
                        stroke={COLORS.rose}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// Overview Donut Chart
export function OverviewDonutChart({ data = [], darkMode = true, centerText = '' }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const onPieEnter = (_, index) => setActiveIndex(index);
    const onPieLeave = () => setActiveIndex(null);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '20px',
            padding: '24px',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
            <h3 style={{
                fontWeight: 700,
                color: darkMode ? '#fff' : '#1f2937',
                fontSize: '16px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                Overview Keuangan
            </h3>

            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={activeIndex !== null ? 110 : 100}
                        paddingAngle={4}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                style={{
                                    filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                    />
                    <Legend
                        verticalAlign="bottom"
                        formatter={(value) => (
                            <span style={{ color: darkMode ? '#fff' : '#1f2937', fontSize: '13px' }}>
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
            }}>
                <p style={{
                    fontSize: '12px',
                    color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                }}>
                    Total
                </p>
                <p style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: darkMode ? '#fff' : '#1f2937'
                }}>
                    Rp {(total / 1000000).toFixed(1)}jt
                </p>
            </div>
        </div>
    );
}

// Combined Comparison Chart
export function ComparisonLineChart({ data = [], darkMode = true }) {
    const textColor = darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
    const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return (
        <div style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '20px',
            padding: '24px',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
            <h3 style={{
                fontWeight: 700,
                color: darkMode ? '#fff' : '#1f2937',
                fontSize: '16px',
                marginBottom: '20px'
            }}>
                📊 Perbandingan Donasi vs Pengeluaran
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="bulan"
                        tick={{ fill: textColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                    />
                    <YAxis
                        tick={{ fill: textColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                    />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="donasi"
                        name="Donasi"
                        stroke={COLORS.green}
                        strokeWidth={3}
                        dot={{ fill: COLORS.green, strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="pengeluaran"
                        name="Pengeluaran"
                        stroke={COLORS.rose}
                        strokeWidth={3}
                        dot={{ fill: COLORS.rose, strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// Export chart as image
function exportChart(chartId) {
    // This would typically use html2canvas or similar
    alert('Fitur export akan segera tersedia!');
}

// Main Interactive Charts Container
export default function InteractiveCharts({
    monthlyData = [],
    overviewData = [],
    darkMode = true,
    onDrillDown
}) {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const handleBarClick = (data) => {
        if (data && data.activePayload) {
            const month = data.activePayload[0].payload;
            setSelectedMonth(month);
            if (onDrillDown) {
                onDrillDown(month);
            }
        }
    };

    return (
        <div>
            {/* Filter Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    padding: '8px 16px',
                    borderRadius: '12px'
                }}>
                    <Filter size={16} color={darkMode ? '#fff' : '#1f2937'} />
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: darkMode ? '#fff' : '#1f2937',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value={2026}>2026</option>
                        <option value={2025}>2025</option>
                    </select>
                </div>

                {selectedMonth && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ color: COLORS.green, fontSize: '14px', fontWeight: 600 }}>
                            📅 {selectedMonth.bulan}
                        </span>
                        <button
                            onClick={() => setSelectedMonth(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: COLORS.green,
                                cursor: 'pointer',
                                padding: '2px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px'
            }}>
                <DonationBarChart
                    data={monthlyData}
                    darkMode={darkMode}
                    onBarClick={handleBarClick}
                />
                <ExpenseAreaChart
                    data={monthlyData}
                    darkMode={darkMode}
                />
            </div>

            {/* Comparison Chart */}
            <div style={{ marginTop: '24px' }}>
                <ComparisonLineChart
                    data={monthlyData}
                    darkMode={darkMode}
                />
            </div>
        </div>
    );
}
