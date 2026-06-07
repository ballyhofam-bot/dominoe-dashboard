import { useState } from 'react'
import { Star } from 'lucide-react'
import { FLEET as INITIAL_FLEET, statusColor, statusLabel } from '../data/mock'

const STATUS_CYCLE = ['available', 'rented', 'wholesale']

export default function Fleet() {
  // #8: Fleet is now interactive — tap status to toggle
  const [fleet, setFleet] = useState(INITIAL_FLEET)

  function cycleStatus(id) {
    setFleet(prev => prev.map(v => {
      if (v.id !== id) return v
      const idx = STATUS_CYCLE.indexOf(v.status)
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
      return { ...v, status: next }
    }))
  }

  const counts = {
    total: fleet.length,
    available: fleet.filter(v => v.status === 'available').length,
    rented: fleet.filter(v => v.status === 'rented').length,
    wholesale: fleet.filter(v => v.status === 'wholesale').length,
  }

  return (
    <div className="tab-content">
      {/* Summary strip */}
      <div className="stat-row">
        <div className="stat-box">
          <div className="stat-value">{counts.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{counts.available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--orange)' }}>{counts.rented}</div>
          <div className="stat-label">Rented</div>
        </div>
      </div>

      <div className="card-sub" style={{ marginBottom: 12, fontSize: 12 }}>
        Tap a vehicle's status to change it
      </div>

      {/* #10: Empty state */}
      {fleet.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <div className="empty-title">No vehicles yet</div>
          <div className="empty-sub">Your Turo fleet will appear here once connected</div>
        </div>
      ) : (
        <div className="fleet-grid">
          {fleet.map(v => {
            const sColor = statusColor(v.status)
            return (
              <div className="card fleet-card" key={v.id}>
                <div className="fleet-info">
                  <div className="fleet-name">{v.year} {v.make} {v.model}</div>
                  <div className="fleet-meta">
                    {v.turo_rating != null ? (
                      <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={12} fill="var(--gold)" stroke="var(--gold)" />
                          {v.turo_rating.toFixed(v.turo_rating % 1 === 0 ? 1 : 2)}
                        </span>
                        <span>({v.turo_review_count} reviews)</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text3)' }}>New listing</span>
                    )}
                  </div>
                </div>
                {/* #8: Tappable status badge — cycles through Available → Rented → Wholesale */}
                <span
                  className="fleet-status"
                  onClick={() => cycleStatus(v.id)}
                  style={{
                    background: `${sColor}20`,
                    color: sColor,
                  }}
                >
                  <span className="status-dot" style={{ background: sColor }} />
                  {statusLabel(v.status)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
