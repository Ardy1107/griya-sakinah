/**
 * Housing Map - Visual block layout for payment status
 * Shows Blok A and Blok B with color-coded payment status
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getUnits,
    getPayments
} from '../../utils/database';
import {
    Map,
    Home,
    ChevronLeft,
    ChevronRight,
    Info,
    CheckCircle,
    XCircle,
    Trophy,
    Phone,
    User
} from 'lucide-react';
import './HousingMap.css';

const HousingMap = () => {
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(() => {
        const now = new Date();
        return { month: now.getMonth(), year: now.getFullYear() };
    });
    const [hoveredUnit, setHoveredUnit] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [unitsData, paymentsData] = await Promise.all([
                    getUnits(),
                    getPayments()
                ]);
                setUnits(unitsData || []);
                setPayments(paymentsData || []);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Parse block number to get block letter and number
    const parseBlockNumber = (blockNumber) => {
        const match = blockNumber.match(/^([A-Za-z]+)-?(\d+)$/);
        if (match) {
            return { block: match[1].toUpperCase(), number: parseInt(match[2]) };
        }
        return { block: blockNumber.charAt(0).toUpperCase(), number: 1 };
    };

    // Group units by block
    const unitsByBlock = useMemo(() => {
        const grouped = { A: [], B: [] };
        units.forEach(unit => {
            const parsed = parseBlockNumber(unit.blockNumber);
            if (parsed.block === 'A') {
                grouped.A.push({ ...unit, unitNumber: parsed.number });
            } else if (parsed.block === 'B') {
                grouped.B.push({ ...unit, unitNumber: parsed.number });
            }
        });
        // Sort by unit number
        grouped.A.sort((a, b) => a.unitNumber - b.unitNumber);
        grouped.B.sort((a, b) => a.unitNumber - b.unitNumber);
        return grouped;
    }, [units]);

    // Get payment status for a unit
    const getPaymentStatus = (unitId) => {
        const unit = units.find(u => u.id === unitId);

        // Check unit status field first (manual setting)
        if (unit?.status === 'lunas') {
            return 'lunas_total'; // Gold - fully paid
        }
        if (unit?.status === 'pending_lunas') {
            return 'pending_lunas'; // Blue - waiting for documents
        }

        // Check if paid this month
        const periodKey = `${selectedPeriod.year}-${String(selectedPeriod.month + 1).padStart(2, '0')}`;
        const unitPayments = payments.filter(p => p.unitId === unitId);

        const thisMonthPayment = unitPayments.find(p => {
            if (p.paymentMonthKey) {
                return p.paymentMonthKey === periodKey;
            }
            // Fallback: check createdAt date
            const payDate = new Date(p.createdAt);
            return payDate.getMonth() === selectedPeriod.month &&
                payDate.getFullYear() === selectedPeriod.year;
        });

        if (thisMonthPayment) {
            return 'paid'; // Green - paid this month
        }

        return 'unpaid'; // Red - not paid this month
    };

    // Navigate month
    const navigateMonth = (direction) => {
        setSelectedPeriod(prev => {
            let newMonth = prev.month + direction;
            let newYear = prev.year;
            if (newMonth > 11) {
                newMonth = 0;
                newYear++;
            } else if (newMonth < 0) {
                newMonth = 11;
                newYear--;
            }
            return { month: newMonth, year: newYear };
        });
    };

    // Format month display
    const getMonthDisplay = () => {
        const date = new Date(selectedPeriod.year, selectedPeriod.month);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    // Handle mouse move for tooltip
    const handleMouseMove = (e, unit) => {
        setTooltipPos({ x: e.clientX + 15, y: e.clientY - 10 });
        setHoveredUnit(unit);
    };

    // Get stats
    const stats = useMemo(() => {
        let paid = 0, unpaid = 0, lunas = 0, pending = 0;
        units.forEach(unit => {
            const status = getPaymentStatus(unit.id);
            if (status === 'lunas_total') lunas++;
            else if (status === 'pending_lunas') pending++;
            else if (status === 'paid') paid++;
            else unpaid++;
        });
        return { paid, unpaid, lunas, pending, total: units.length };
    }, [units, payments, selectedPeriod]);

    // Render a single house cell
    const renderHouseCell = (blockNum, unit, block) => {
        if (!unit) {
            return (
                <div key={`empty-${blockNum}`} className="house-cell empty">
                    <div className="house-icon">🏠</div>
                    <span className="house-number">{blockNum}</span>
                </div>
            );
        }

        const status = getPaymentStatus(unit.id);
        return (
            <div
                key={unit.id}
                className={`house-cell ${status}`}
                onClick={() => navigate(`/angsuran/admin/units/${unit.id}`)}
                onMouseMove={(e) => handleMouseMove(e, unit)}
                onMouseLeave={() => setHoveredUnit(null)}
            >
                <div className="house-icon">🏠</div>
                <span className="house-number">{unit.blockNumber}</span>
                <span className="resident-initial">
                    {unit.residentName.charAt(0)}
                </span>
            </div>
        );
    };

    // Render house grid for a block with internal road
    const renderBlockWithRoad = (block, blockUnits) => {
        // A: 18 units (row1: 1-9, row2: 18-10 reversed)
        // B: 20 units (row1: 1-10, row2: 20-11 reversed)
        const isBlockA = block === 'A';
        const row1Count = isBlockA ? 9 : 10;
        const maxHouses = isBlockA ? 18 : 20;

        // Row 1: 1 to row1Count (left to right)
        const row1 = [];
        for (let i = 1; i <= row1Count; i++) {
            const unit = blockUnits.find(u => u.unitNumber === i);
            const blockNum = `${block}-${String(i).padStart(2, '0')}`;
            row1.push({ unit, blockNum, num: i });
        }

        // Row 2: maxHouses down to (row1Count + 1) (reversed - right to left visually but in array left to right)
        const row2 = [];
        for (let i = maxHouses; i > row1Count; i--) {
            const unit = blockUnits.find(u => u.unitNumber === i);
            const blockNum = `${block}-${String(i).padStart(2, '0')}`;
            row2.push({ unit, blockNum, num: i });
        }

        // Block Label component
        const BlockLabel = () => (
            <div className="block-label">
                <Home size={18} />
                <span>Blok {block} ({maxHouses} Unit)</span>
            </div>
        );

        return (
            <div className="block-container">
                {/* Label at top for Blok A */}
                {isBlockA && <BlockLabel />}

                {/* Row 1 */}
                <div className="houses-row" style={{ gridTemplateColumns: `repeat(${row1Count}, 1fr)` }}>
                    {row1.map(pos => renderHouseCell(pos.blockNum, pos.unit, block))}
                </div>

                {/* Internal Road */}
                <div className="block-road">
                    <div className="road-line"></div>
                    <span className="road-label">═══ JALAN BLOK {block} ═══</span>
                    <div className="road-line"></div>
                </div>

                {/* Row 2 (reversed order facing row 1) */}
                <div className="houses-row" style={{ gridTemplateColumns: `repeat(${row1Count}, 1fr)` }}>
                    {row2.map(pos => renderHouseCell(pos.blockNum, pos.unit, block))}
                </div>

                {/* Label at bottom for Blok B */}
                {!isBlockA && <BlockLabel />}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="housing-map-page">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="housing-map-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>
                        <Map size={28} />
                        Peta Blok Perumahan
                    </h1>
                    <p>Visualisasi status pembayaran per rumah</p>
                </div>
            </div>

            {/* Period Selector */}
            <div className="period-selector">
                <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft size={20} />
                </button>
                <span className="period-display">{getMonthDisplay()}</span>
                <button className="nav-btn" onClick={() => navigateMonth(1)}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Legend */}
            <div className="legend-bar">
                <div className="legend-item">
                    <span className="legend-dot paid"></span>
                    <span>Sudah Bayar ({stats.paid})</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot unpaid"></span>
                    <span>Belum Bayar ({stats.unpaid})</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot pending_lunas"></span>
                    <span>Pending Lunas ({stats.pending})</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot lunas_total"></span>
                    <span>Lunas Total ({stats.lunas})</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot empty"></span>
                    <span>Kosong</span>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-row">
                <div className="stat-box paid">
                    <CheckCircle size={24} />
                    <div>
                        <span className="stat-value">{stats.paid}</span>
                        <span className="stat-label">Sudah Bayar</span>
                    </div>
                </div>
                <div className="stat-box unpaid">
                    <XCircle size={24} />
                    <div>
                        <span className="stat-value">{stats.unpaid}</span>
                        <span className="stat-label">Belum Bayar</span>
                    </div>
                </div>
                <div className="stat-box lunas">
                    <Trophy size={24} />
                    <div>
                        <span className="stat-value">{stats.lunas}</span>
                        <span className="stat-label">Lunas Total</span>
                    </div>
                </div>
            </div>

            {/* Housing Map */}
            <div className="map-container">
                {/* Blok A */}
                {renderBlockWithRoad('A', unitsByBlock.A)}

                {/* Blok B - directly below (A18 and B01 are back-to-back) */}
                {renderBlockWithRoad('B', unitsByBlock.B)}
            </div>

            {/* Info */}
            <div className="info-box">
                <Info size={18} />
                <span>Klik rumah untuk melihat detail pembayaran. Hover untuk info cepat.</span>
            </div>

            {/* Tooltip */}
            {
                hoveredUnit && (
                    <div
                        className="house-tooltip"
                        style={{
                            left: tooltipPos.x,
                            top: tooltipPos.y,
                            position: 'fixed'
                        }}
                    >
                        <div className="tooltip-header">
                            <strong>{hoveredUnit.blockNumber}</strong>
                            <span className={`status-badge ${getPaymentStatus(hoveredUnit.id)}`}>
                                {getPaymentStatus(hoveredUnit.id) === 'paid' && 'Sudah Bayar'}
                                {getPaymentStatus(hoveredUnit.id) === 'unpaid' && 'Belum Bayar'}
                                {getPaymentStatus(hoveredUnit.id) === 'pending_lunas' && 'Pending Lunas'}
                                {getPaymentStatus(hoveredUnit.id) === 'lunas_total' && 'Lunas Total'}
                            </span>
                        </div>
                        <div className="tooltip-body">
                            <p><User size={14} /> {hoveredUnit.residentName}</p>
                            <p><Phone size={14} /> {hoveredUnit.phone}</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default HousingMap;
