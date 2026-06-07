import { OVERVIEW, RECENT_TRANSACTIONS, STREAM_MTD, streamColor, formatCurrency, formatDate } from '../data/mock'

export default function Overview() {
  const trend = OVERVIEW.netMtd >= OVERVIEW.lastMonthNet ? 'up' : 'down'
  const trendPct = Math.round(((OVERVIEW.netMtd - OVERVIEW.lastMonthNet) / OVERVIEW.lastMonthNet) * 100)

  return (
    <div className="tab-content">
      {/* #6: Simplified — one hero card, income|expenses below */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="card-title">Net Profit — June 2026</div>
        <div className="hero-number">{formatCurrency(OVERVIEW.netMtd)}</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 6, fontSize: 13, fontWeight: 600,
          color: trend === 'up' ? 'var(--green)' : 'var(--red)',
        }}>
          {trend === 'up' ? '▲' : '▼'} {Math.abs(trendPct)}% vs last month
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{formatCurrency(OVERVIEW.totalMtd)}</div>
          <div className="stat-label">Income</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--red)' }}>{formatCurrency(OVERVIEW.totalExpenses)}</div>
          <div className="stat-label">Expenses</div>
        </div>
      </div>

      {/* #5: Last Month instead of "YTD Pace" — a number Ash understands */}
      <div className="stat-row">
        <div className="stat-box">
          <div className="stat-value">{formatCurrency(OVERVIEW.ytdNet)}</div>
          <div className="stat-label">YTD Total</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--text2)' }}>{formatCurrency(OVERVIEW.lastMonthNet)}</div>
          <div className="stat-label">Last Month</div>
        </div>
      </div>

      {/* Stream breakdown */}
      <div className="section-header">Streams — June</div>
      <div className="card-grid">
        {Object.entries(STREAM_MTD).map(([key, s]) => (
          <div className="card" key={key} style={{ padding: '12px 16px' }}>
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="status-dot" style={{ background: streamColor(key) }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
              </span>
              <span className={`badge ${s.auto ? 'badge-auto' : 'badge-manual'}`}>
                {s.auto ? 'Auto' : 'Manual'}
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(s.mtd)}</div>
            {s.count != null && (
              <div className="card-sub">{s.count} transaction{s.count !== 1 ? 's' : ''}</div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="section-header">Recent Activity</div>
      <div className="card" style={{ padding: '4px 16px' }}>
        {RECENT_TRANSACTIONS.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No activity yet</div>
            <div className="empty-sub">Transactions will show up here as you log them</div>
          </div>
        ) : (
          RECENT_TRANSACTIONS.map((tx, i) => (
            <div className="txn-row" key={i}>
              <div className="txn-dot" style={{ background: streamColor(tx.stream) }} />
              <div className="txn-info">
                <div className="txn-label">{tx.label}</div>
                <div className="txn-date">{formatDate(tx.date)}</div>
              </div>
              <div className="txn-amount" style={{ color: 'var(--green)' }}>
                +{formatCurrency(tx.amount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
