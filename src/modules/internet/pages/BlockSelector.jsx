// Block Selector Page - Users choose Blok A or Blok B
import { useNavigate } from 'react-router-dom'
import { Wifi, ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function BlockSelector() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()

    const blocks = [
        {
            id: 'A',
            label: 'Blok A',
            subtitle: '11 Unit Rumah',
            bank: 'BSI',
            rekening: '7276140919',
            atasNama: 'Ardyanto Pri Utomo',
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            path: '/blok-a/internet'
        },
        {
            id: 'B',
            label: 'Blok B',
            subtitle: '12 Unit Rumah',
            bank: 'Bank Mandiri',
            rekening: '1480023234738',
            atasNama: 'Ardyanto Pri Utomo',
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            path: '/blok-b/internet'
        }
    ]

    return (
        <div className="block-selector-page">
            {/* Background decorations */}
            <div className="block-selector-bg">
                <div className="block-selector-orb block-selector-orb-1" />
                <div className="block-selector-orb block-selector-orb-2" />
            </div>

            <div className="block-selector-container">
                {/* Header */}
                <div className="block-selector-header">
                    <div className="block-selector-logo">
                        <Wifi size={28} />
                    </div>
                    <h1 className="block-selector-title">Internet Sakinah</h1>
                    <p className="block-selector-subtitle">
                        Pilih blok perumahan Anda untuk melihat dashboard transparansi keuangan internet
                    </p>
                </div>

                {/* Block Cards */}
                <div className="block-selector-grid">
                    {blocks.map(block => (
                        <button
                            key={block.id}
                            className="block-selector-card"
                            onClick={() => navigate(block.path)}
                            style={{ '--block-color': block.color }}
                        >
                            <div className="block-selector-card-header" style={{ background: block.gradient }}>
                                <span className="block-selector-card-id">{block.label}</span>
                                <span className="block-selector-card-units">{block.subtitle}</span>
                            </div>
                            <div className="block-selector-card-body">
                                <div className="block-selector-card-bank">
                                    <span className="block-selector-card-bank-label">Transfer ke</span>
                                    <span className="block-selector-card-bank-name">💳 {block.bank}</span>
                                    <span className="block-selector-card-bank-rek">{block.rekening}</span>
                                    <span className="block-selector-card-bank-an">a.n. {block.atasNama}</span>
                                </div>
                                <div className="block-selector-card-action">
                                    <span>Lihat Dashboard</span>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Admin link */}
                <div className="block-selector-footer">
                    <button
                        className="block-selector-admin-link"
                        onClick={() => navigate('/internet/admin/login')}
                    >
                        🔐 Login Admin
                    </button>
                </div>
            </div>
        </div>
    )
}
