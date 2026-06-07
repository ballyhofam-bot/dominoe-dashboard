import { STREAM_MTD, CARWASH_PACKAGES, WHOLESALE_PIPELINE, streamColor, formatCurrency } from '../data/mock'

const PIPELINE_COLORS = {
  sourced: { bg: 'rgba(74,158,255,.15)', color: 'var(--blue)' },
  listed:  { bg: 'rgba(212,168,67,.15)', color: 'var(--gold)' },
  pending: { bg: 'rgba(255,149,0,.15)',  color: 'var(--orange)' },
  sold:    { bg: 'rgba(52,199,89,.15)',  color: 'var(--green)' },
}

export default function Streams() {
  const entries = Object.entries(STREAM_MTD)
  const maxMtd = Math.max(...entries.map(([, s]) => s.mtd))

  return (
    <div className="tab-content">
      <div className="section-header" style={{ marginTop: 0 }}>Revenue by Stream</div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No revenue this month</div>
          <div className="empty-sub">Start logging entries and your streams will fill in automatically</div>
        </div>
      ) : (
        <div className="card-grid">
          {entries.map(([key, s]) => (
            <div className="card" key={key}>
              <div className="card-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="status-dot" style={{ background: streamColor(key) }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                </span>
                <span className={`badge ${s.auto ? 'badge-auto' : 'badge-manual'}`}>
                  {s.auto ? 'Auto' : 'Manual'}
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{formatCurrency(s.mtd)}</div>
              {s.count != null && <div className="card-sub">{s.count} transactions</div>}
              <div className="rev-bar-track">
                <div
                  className="rev-bar-fill"
                  style={{
                    width: `${(s.mtd / maxMtd) * 100}%`,
                    background: streamColor(key),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Car Wash Package Breakdown */}
      <div className="section-header">Car Wash Packages</div>
      <div className="card">
        {CARWASH_PACKAGES.map((pkg, i) => (
          <div key={pkg.name} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < CARWASH_PACKAGES.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{pkg.name}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>${pkg.price}</span>
          </div>
        ))}
      </div>

      {/* Wholesale Pipeline */}
      <div className="section-header">Wholesale Pipeline</div>
      {WHOLESALE_PIPELINE.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚘</div>
          <div className="empty-title">Pipeline empty</div>
          <div className="empty-sub">Auction purchases will appear here as they move through stages</div>
        </div>
      ) : (
        <div className="fleet-grid">
          {WHOLESALE_PIPELINE.map(v => {
            const stage = PIPELINE_COLORS[v.status] || PIPELINE_COLORS.sourced
            return (
              <div className="card fleet-card" key={v.id}>
                <div className="fleet-info">
                  <div className="fleet-name">{v.year} {v.make} {v.model}</div>
                  <div className="fleet-meta">
                    <span>Cost: {formatCurrency(v.cost)}</span>
                    <span>•</span>
                    <span>{v.source}</span>
                  </div>
                </div>
                <span className="pipeline-stage" style={{ background: stage.bg, color: stage.color }}>
                  {v.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
