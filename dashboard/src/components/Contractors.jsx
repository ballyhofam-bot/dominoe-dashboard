import { AlertTriangle } from 'lucide-react'
import { CONTRACTORS, CONTRACTOR_PAYMENTS, thresholdColor, formatCurrency, formatDate } from '../data/mock'

const THRESHOLD = 600

export default function Contractors() {
  return (
    <div className="tab-content">
      <div className="section-header" style={{ marginTop: 0 }}>1099 Contractors</div>
      <div className="card-sub" style={{ marginBottom: 16 }}>
        File 1099-NEC for any contractor paid ${THRESHOLD}+ in a calendar year
      </div>

      {/* #10: Empty state */}
      {CONTRACTORS.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👷</div>
          <div className="empty-title">No contractors yet</div>
          <div className="empty-sub">When you log a detail job with a contractor, they'll appear here with their YTD total tracked automatically</div>
        </div>
      ) : (
        <div className="contractor-grid">
          {CONTRACTORS.map(c => {
            const pct = Math.min((c.ytd_total / THRESHOLD) * 100, 100)
            const color = thresholdColor(c.threshold_status)
            return (
              <div className="card" key={c.id}>
                <div className="card-header">
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</div>
                    <div className="card-sub">{c.phone}</div>
                  </div>
                  {c.threshold_status === 'over' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>
                      <AlertTriangle size={14} /> FILE 1099
                    </span>
                  )}
                  {c.threshold_status === 'approaching' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--orange)', fontSize: 12, fontWeight: 600 }}>
                      <AlertTriangle size={14} /> Near $600
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(c.ytd_total)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>/ {formatCurrency(THRESHOLD)}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                {c.threshold_status === 'over' && (
                  <div style={{
                    marginTop: 10, padding: '8px 10px',
                    background: 'rgba(255,59,48,.08)', borderRadius: 'var(--radius-sm)',
                    fontSize: 12, color: 'var(--red)', lineHeight: 1.4,
                  }}>
                    <strong>Action needed:</strong> File 1099-NEC at{' '}
                    <span style={{ textDecoration: 'underline' }}>irs.gov/iris</span>{' '}
                    (free e-file). You'll need their SSN from their W-9.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Payments */}
      <div className="section-header">Recent Payments</div>
      {CONTRACTOR_PAYMENTS.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💵</div>
          <div className="empty-title">No payments logged yet</div>
          <div className="empty-sub">Log contractor payments from the Log Entry tab</div>
        </div>
      ) : (
        <div className="card" style={{ padding: '4px 16px' }}>
          {CONTRACTOR_PAYMENTS.map(p => (
            <div className="txn-row" key={p.id}>
              <div className="txn-dot" style={{ background: 'var(--purple)' }} />
              <div className="txn-info">
                <div className="txn-label">{p.contractor_name}</div>
                <div className="txn-date">{formatDate(p.payment_date)} • {p.payment_method}</div>
              </div>
              <div className="txn-amount">{formatCurrency(p.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
