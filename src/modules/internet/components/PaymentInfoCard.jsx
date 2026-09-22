// Payment Info Card - Shows bank transfer details per block
import { useState } from 'react'
import { Copy, Check, CreditCard } from 'lucide-react'
import { formatCurrency } from '../utils/helpers'
import { getBlockConfig } from '../config/blockConfig'

export default function PaymentInfoCard({ blockId }) {
  const [copied, setCopied] = useState(null)
  const config = getBlockConfig(blockId)

  if (!config) return null

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (e) {
      // fallback for older browsers
    }
  }

  return (
    <div className="payment-info-card" style={{ '--block-color': config.color }}>
      <div className="payment-info-header" style={{ background: config.gradient }}>
        <div className="payment-info-header-content">
          <CreditCard size={22} />
          <div>
            <div className="payment-info-title">Info Pembayaran</div>
            <div className="payment-info-subtitle">{config.name} — Internet Sakinah</div>
          </div>
        </div>
      </div>

      <div className="payment-info-body">
        {/* Bank Info */}
        <div className="payment-info-row">
          <span className="payment-info-label">Bank</span>
          <span className="payment-info-value">
            {config.bank.logo} {config.bank.name}
          </span>
        </div>

        <div className="payment-info-row clickable" onClick={() => handleCopy(config.bank.accountNumber, 'account')}>
          <span className="payment-info-label">No. Rekening</span>
          <span className="payment-info-value payment-info-account">
            <span className="payment-info-account-number">{config.bank.accountNumber}</span>
            {copied === 'account' ? (
              <Check size={14} className="payment-info-copy-icon copied" />
            ) : (
              <Copy size={14} className="payment-info-copy-icon" />
            )}
          </span>
        </div>

        <div className="payment-info-row">
          <span className="payment-info-label">Atas Nama</span>
          <span className="payment-info-value payment-info-bold">{config.bank.accountHolder}</span>
        </div>

        <div className="payment-info-divider" />

        <div className="payment-info-row">
          <span className="payment-info-label">Iuran / Bulan</span>
          <span className="payment-info-value payment-info-amount" style={{ color: config.color }}>
            {formatCurrency(config.iuran)}
          </span>
        </div>
      </div>

      <div className="payment-info-footer">
        <p>💡 Setelah transfer, hubungi admin untuk konfirmasi pembayaran.</p>
      </div>
    </div>
  )
}
