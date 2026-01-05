// Tunggakan List Component - Shows overdue payments
import { AlertTriangle, Phone, MessageCircle } from 'lucide-react'
import { formatCurrency, getMonthName, generateWhatsAppUrl } from '../utils/helpers'

export default function TunggakanList({ residents, currentPeriod }) {
    // Filter residents who haven't paid for more than 1 month
    const tunggakan = residents.filter(r => {
        if (r.isPaid) return false
        // Check if they also missed previous month
        return !r.lastPayment || isOverdue(r.lastPayment, currentPeriod)
    })

    if (tunggakan.length === 0) {
        return (
            <div className="card tunggakan-empty">
                <div className="tunggakan-empty-icon">✓</div>
                <p>Tidak ada tunggakan! Semua warga bayar tepat waktu.</p>
            </div>
        )
    }

    return (
        <div className="card tunggakan-card">
            <div className="card-header">
                <h3 className="card-title">
                    <AlertTriangle size={20} className="text-danger" />
                    Daftar Tunggakan
                    <span className="badge badge-danger">{tunggakan.length}</span>
                </h3>
            </div>

            <div className="tunggakan-list">
                {tunggakan.map(resident => (
                    <div key={resident.id} className="tunggakan-item">
                        <div className="tunggakan-info">
                            <span className="tunggakan-blok">{resident.blok_rumah}</span>
                            <span className="tunggakan-nama">{resident.nama_warga}</span>
                            <span className="tunggakan-status">
                                Belum bayar sejak {resident.lastPayment
                                    ? `${getMonthName(resident.lastPayment.bulan)} ${resident.lastPayment.tahun}`
                                    : 'awal'
                                }
                            </span>
                        </div>
                        <div className="tunggakan-actions">
                            {resident.no_whatsapp && (
                                <a
                                    href={generateWhatsAppUrl(resident.no_whatsapp, generateReminderMessage(resident, currentPeriod))}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-success"
                                    title="Kirim Reminder"
                                >
                                    <MessageCircle size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function isOverdue(lastPayment, currentPeriod) {
    const lastDate = new Date(lastPayment.tahun, lastPayment.bulan - 1)
    const currentDate = new Date(currentPeriod.tahun, currentPeriod.bulan - 1)
    const diffMonths = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 +
        (currentDate.getMonth() - lastDate.getMonth())
    return diffMonths > 1
}

function generateReminderMessage(resident, period) {
    return `Assalamu'alaikum ${resident.nama_warga},

Kami ingin mengingatkan bahwa iuran internet Griya Sakinah untuk bulan ${getMonthName(period.bulan)} ${period.tahun} belum kami terima.

Nominal: Rp 150.000

Mohon untuk segera melakukan pembayaran. Terima kasih atas kerjasamanya.

_Griya Sakinah Internet Management_`
}
