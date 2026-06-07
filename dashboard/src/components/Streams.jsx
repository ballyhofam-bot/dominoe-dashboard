import { useState } from 'react'
import { RECENT_TRANSACTIONS, WHOLESALE_PIPELINE, STREAM_MTD, streamColor, formatCurrency, formatDate } from '../data/mock'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'turo', label: 'Turo' },
  { id: 'detail', label: 'Detail' },
  { id: 'carwash', label: 'Car Wash' },
  { id: 'wholesale', label: 'Wholesale' },
]

const PIPELINE_COLORS = {
  sourced: { bg: 'rgba(74,158,255,.15)', color: 'var(--blue)' },
  listed:  { bg: 'rgba(212,168,67,.15)', color: 'var(--gold)' },
  pending: { bg: 'rgba(255,149,0,.15)',  color: 'var(--orange)' },
  sold:    { bg: 'rgba(52,199,89,.15)',  color: 'var(--green)' },
}

export default function Streams() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? RECENT_TRANSACTIONS
    : RECENT_TRANSACTIONS.filter(tx => tx.stream === filter)

  const activeStream = filter !== 'all' ? STREAM_MTD[filter] : null

  return (
    <div className="tab-content">
      {/* Filter pills */}
      <div className="stream-pills">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`stream-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.id !== 'all' && (
              <span className="status-dot" style={{ background: streamColor(f.id), marginRight: 4 }} />
            )}
            {f.label}
          </button>
        ))}
      </div>

      {/* Stream summary when filtered */}
      {activeStream && (
        <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
          <div className="card-title">{activeStream.label} — June</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: streamColor(filter), marginTop: 4 }}>
            {formatCurrency(activeStream.mtd)}
          </div>
          <div className="card-sub">{activeStream.count} transaction{activeStream.count !== 1 ? 's' : ''}</div>
        </div>
      )}

      {/* Transaction list */}
      <div className="section-header" style={{ marginTop: activeStream ? 0 : undefined }}>
        {filter === 'all' ? 'All Transactions' : `${FILTERS.find(f => f.id === filter)?.label} Entries`}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No entries yet</div>
          <div className="empty-sub">
            {filter === 'all'
              ? 'Start logging from the Log Entry tab'
              : `No ${FILTERS.find(f => f.id === filter)?.label.toLowerCase()} entries this month`
            }
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '4px 16px' }}>
          {filtered.map((tx, i) => (
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
          ))}
        </div>
      )}

      {/* Wholesale Pipeline — only show when viewing all or wholesale */}
      {(filter === 'all' || filter === 'wholesale') && WHOLESALE_PIPELINE.length > 0 && (
        <>
          <div className="section-header">Wholesale Pipeline</div>
          <div className="fleet-grid">
            {WHOLESALE_PIPELINE.map(v => {
              const stage = PIPELINE_COLORS[v.status] || PIPELINE_COLORS.sourced
              return (
                <div className="card fleet-card" key={v.id}>
                  <div className="fleet-info">
                    <div className="fleet-name">{v.year} {v.make} {v.model}</div>
                    <div className="fleet-meta">
                      <span>Cost: {formatCurrency(v.cost)}</span>
                      <span>·</span>
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
        </>
      )}
    </div>
  )
}
