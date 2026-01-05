import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import './MonthPicker.css';

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DatePicker = ({ value, onChange, minYear = 2025 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(value?.year || new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(value?.month || new Date().getMonth());

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handleSelectDate = (day) => {
        onChange({ day, month: viewMonth, year: viewYear });
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            if (viewYear > minYear) {
                setViewMonth(11);
                setViewYear(viewYear - 1);
            }
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const formatDisplay = () => {
        if (!value || !value.day) return 'Pilih Tanggal';
        return `${value.day} ${MONTHS[value.month]} ${value.year}`;
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

    const isSelected = (day) => {
        return value?.day === day && value?.month === viewMonth && value?.year === viewYear;
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
    };

    return (
        <div className="date-picker">
            <button
                type="button"
                className="date-picker-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar size={18} />
                <span>{formatDisplay()}</span>
                <ChevronRight size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="date-picker-dropdown">
                    <div className="month-nav">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            disabled={viewYear <= minYear && viewMonth === 0}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="month-year-display">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="weekdays">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    <div className="days-grid">
                        {emptyDays.map((_, i) => (
                            <span key={`empty-${i}`} className="day empty"></span>
                        ))}
                        {days.map(day => (
                            <button
                                key={day}
                                type="button"
                                className={`day ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''}`}
                                onClick={() => handleSelectDate(day)}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const formatFullDate = (value) => {
    if (!value || !value.day) return '';
    return `${value.day} ${MONTHS[value.month]} ${value.year}`;
};

export const getDateKey = (value) => {
    if (!value || !value.day) return '';
    return `${value.year}-${String(value.month + 1).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
};

// For backward compatibility
export const formatMonthYear = (value) => {
    if (!value) return '';
    if (value.day) {
        return `${value.day} ${MONTHS[value.month]} ${value.year}`;
    }
    return `${MONTHS[value.month]} ${value.year}`;
};

export const getMonthYearKey = (value) => {
    if (!value) return '';
    if (value.day) {
        return `${value.year}-${String(value.month + 1).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
    }
    return `${value.year}-${String(value.month + 1).padStart(2, '0')}`;
};

export default DatePicker;
