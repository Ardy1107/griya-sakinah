// Premium Period Picker Component
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react'

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const START_YEAR = 2026

export default function PeriodPicker({ value, onChange, className = '' }) {
    const [isOpen, setIsOpen] = useState(false)
    const [viewYear, setViewYear] = useState(value?.tahun || new Date().getFullYear())
    const pickerRef = useRef(null)

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMonthSelect = (month) => {
        onChange({ bulan: month, tahun: viewYear })
        setIsOpen(false)
    }

    const handleYearChange = (delta) => {
        const newYear = viewYear + delta
        if (newYear >= START_YEAR) {
            setViewYear(newYear)
        }
    }

    const isSelected = (month) => {
        return value?.bulan === month && value?.tahun === viewYear
    }

    const isCurrent = (month) => {
        const now = new Date()
        return month === (now.getMonth() + 1) && viewYear === now.getFullYear()
    }

    const displayText = value
        ? `${MONTHS[value.bulan - 1]} ${value.tahun}`
        : 'Pilih Periode'

    return (
        <div className={`period-picker ${className}`} ref={pickerRef}>
            <button
                className="period-picker-trigger"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <Calendar size={18} />
                <span>{displayText}</span>
                <ChevronRight
                    size={18}
                    className={`period-picker-arrow ${isOpen ? 'rotated' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="period-picker-dropdown">
                    {/* Year Selector */}
                    <div className="period-picker-header">
                        <button
                            className="period-picker-nav"
                            onClick={() => handleYearChange(-1)}
                            disabled={viewYear <= START_YEAR}
                            type="button"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="period-picker-year">{viewYear}</span>
                        <button
                            className="period-picker-nav"
                            onClick={() => handleYearChange(1)}
                            type="button"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Month Grid */}
                    <div className="period-picker-grid">
                        {MONTHS.map((month, index) => {
                            const monthNum = index + 1
                            const selected = isSelected(monthNum)
                            const current = isCurrent(monthNum)

                            return (
                                <button
                                    key={month}
                                    className={`period-picker-month ${selected ? 'selected' : ''} ${current ? 'current' : ''}`}
                                    onClick={() => handleMonthSelect(monthNum)}
                                    type="button"
                                >
                                    {selected && <Check size={14} className="period-picker-check" />}
                                    <span>{month.substring(0, 3)}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div className="period-picker-footer">
                        <button
                            className="period-picker-quick"
                            onClick={() => {
                                const now = new Date()
                                onChange({ bulan: now.getMonth() + 1, tahun: now.getFullYear() })
                                setIsOpen(false)
                            }}
                            type="button"
                        >
                            Bulan Ini
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Get month name helper
export function getMonthName(month) {
    return MONTHS[month - 1] || ''
}
