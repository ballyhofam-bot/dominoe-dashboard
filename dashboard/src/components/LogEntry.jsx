import { useState } from 'react'
import {
  FLEET, CONTRACTORS, SERVICE_TYPES, QUICK_AMOUNTS, PAYMENT_METHODS,
  AUCTION_SOURCES, BUYER_TYPES, WHOLESALE_PIPELINE,
  formatCurrency,
} from '../data/mock'

// #3: Reordered — Mobile Detail first (most frequent), then Car Wash, then the rest
const STREAMS = [
  { id: 'detail',    label: 'Mobile Detail', auto: false },
  { id: 'carwash',   label: 'Car Wash',     auto: false },
  { id: 'sale',      label: 'Wholesale Sale', auto: false },
  { id: 'pay1099',   label: '1099 Payment', auto: false },
  { id: 'turo',      label: 'Turo',         auto: true },
  { id: 'auction',   label: 'Auction Buy',  auto: true },
]

export default function LogEntry() {
  const [stream, setStream] = useState('detail')
  const [lastEntry, setLastEntry] = useState(null)

  function handleSubmit(entry) {
    setLastEntry({ ...entry, time: new Date() })
  }

  const active = STREAMS.find(s => s.id === stream)

  return (
    <div className="tab-content">
      {/* #7: Last entry timestamp */}
      {lastEntry && (
        <div className="last-entry">
          <span className="last-entry-dot" />
          Last logged {formatTimeAgo(lastEntry.time)}
        </div>
      )}

      {/* #4: Confirmation card — persists until next entry */}
      {lastEntry && (
        <div className="confirm-card">
          <span className="confirm-icon">✓</span>
          <div className="confirm-body">
            <div className="confirm-title">{lastEntry.title}</div>
            <div className="confirm-detail">{lastEntry.detail}</div>
          </div>
        </div>
      )}

      {/* #3: Stream pills — wrapping, not scrolling, so nothing is hidden */}
      <div className="stream-pills">
        {STREAMS.map(s => (
          <button
            key={s.id}
            className={`stream-pill ${stream === s.id ? 'active' : ''}`}
            onClick={() => setStream(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Auto/Manual badge */}
      <div style={{ marginBottom: 16 }}>
        <span className={`badge ${active.auto ? 'badge-auto' : 'badge-manual'}`}>
          {active.auto ? 'Auto — parsed from email' : 'Manual entry'}
        </span>
      </div>

      {stream === 'turo' && <TuroForm onSubmit={handleSubmit} />}
      {stream === 'auction' && <AuctionForm onSubmit={handleSubmit} />}
      {stream === 'sale' && <SaleForm onSubmit={handleSubmit} />}
      {stream === 'carwash' && <CarwashForm onSubmit={handleSubmit} />}
      {stream === 'detail' && <DetailForm onSubmit={handleSubmit} />}
      {stream === 'pay1099' && <Pay1099Form onSubmit={handleSubmit} />}
    </div>
  )
}

function formatTimeAgo(date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/* ─── Turo (normally auto, manual override) ─────────────────────────── */
function TuroForm({ onSubmit }) {
  const [vehicleId, setVehicleId] = useState('')
  const [payout, setPayout] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const turoFleet = FLEET.filter(v => v.status !== 'wholesale' && v.status !== 'sold')
  const selected = turoFleet.find(v => String(v.id) === vehicleId)

  function handleSubmit(e) {
    e.preventDefault()
    const name = selected ? `${selected.year} ${selected.make} ${selected.model}` : 'Vehicle'
    onSubmit({
      title: 'Turo payout logged',
      detail: `${name} — ${formatCurrency(parseFloat(payout || 0))} net payout`,
    })
    setVehicleId(''); setPayout(''); setStartDate(''); setEndDate('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card-sub" style={{ marginBottom: 16 }}>
        Turo payouts are automatically parsed from weekly emails. Use this form for manual corrections only.
      </div>
      <div className="field">
        <label className="field-label">Vehicle</label>
        <select className="select" value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
          <option value="">Select vehicle...</option>
          {turoFleet.map(v => (
            <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label">Net Payout</label>
        <input className="input" type="number" step=".01" placeholder="0.00" value={payout} onChange={e => setPayout(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="field" style={{ flex: 1 }}>
          <label className="field-label">Start Date</label>
          <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label className="field-label">End Date</label>
          <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>
      <button className="btn-submit" type="submit">Log Turo Payout</button>
    </form>
  )
}

/* ─── Auction Purchase (normally auto, manual override) ──────────── */
function AuctionForm({ onSubmit }) {
  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [source, setSource] = useState('')
  const [vin, setVin] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      title: 'Auction purchase logged',
      detail: `${year} ${make} ${model} — ${formatCurrency(parseFloat(price || 0))} from ${source || 'unknown'}`,
    })
    setYear(''); setMake(''); setModel(''); setPrice(''); setSource(''); setVin('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card-sub" style={{ marginBottom: 16 }}>
        Manheim and ADESA purchases are auto-parsed from confirmation emails. Use this for local/private purchases.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="field" style={{ width: 80 }}>
          <label className="field-label">Year</label>
          <input className="input" type="number" placeholder="2024" value={year} onChange={e => setYear(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label className="field-label">Make</label>
          <input className="input" type="text" placeholder="Toyota" value={make} onChange={e => setMake(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label className="field-label">Model</label>
          <input className="input" type="text" placeholder="Camry" value={model} onChange={e => setModel(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label className="field-label">Purchase Price</label>
        <input className="input" type="number" step=".01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Source</label>
        <div className="toggle-group">
          {AUCTION_SOURCES.map(s => (
            <button key={s} type="button" className={`toggle-btn ${source === s ? 'active' : ''}`} onClick={() => setSource(s)}>{s}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="field-label">VIN (optional)</label>
        <input className="input" type="text" placeholder="1HGCV1F..." value={vin} onChange={e => setVin(e.target.value)} />
      </div>
      <button className="btn-submit" type="submit">Log Purchase</button>
    </form>
  )
}

/* ─── Wholesale Sale ─────────────────────────────────────────────── */
function SaleForm({ onSubmit }) {
  const [vehicleId, setVehicleId] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [buyerType, setBuyerType] = useState('')

  const selected = WHOLESALE_PIPELINE.find(v => String(v.id) === vehicleId)
  const profit = selected && salePrice ? parseFloat(salePrice) - selected.cost : null

  function handleSubmit(e) {
    e.preventDefault()
    const name = selected ? `${selected.year} ${selected.make} ${selected.model}` : 'Vehicle'
    onSubmit({
      title: `Wholesale sale — ${profit >= 0 ? '+' : ''}${formatCurrency(profit || 0)} profit`,
      detail: `${name} sold for ${formatCurrency(parseFloat(salePrice || 0))} to ${buyerType || 'buyer'}`,
    })
    setVehicleId(''); setSalePrice(''); setBuyerType('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="field-label">Vehicle</label>
        <select className="select" value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
          <option value="">Select vehicle...</option>
          {WHOLESALE_PIPELINE.map(v => (
            <option key={v.id} value={v.id}>
              {v.year} {v.make} {v.model}
            </option>
          ))}
        </select>
      </div>

      {/* #9: Show cost basis AFTER selection, not crammed in dropdown */}
      {selected && (
        <div className="calc-row">
          <span className="calc-label">Cost Basis</span>
          <span className="calc-value">{formatCurrency(selected.cost)}</span>
        </div>
      )}

      <div className="field">
        <label className="field-label">Sale Price</label>
        <input className="input" type="number" step=".01" placeholder="0.00" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
      </div>

      {profit !== null && (
        <div className="calc-row">
          <span className="calc-label">Profit</span>
          <span className={`calc-value ${profit >= 0 ? 'calc-profit' : 'calc-loss'}`}>
            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
          </span>
        </div>
      )}

      <div className="field">
        <label className="field-label">Buyer Type</label>
        <div className="toggle-group">
          {BUYER_TYPES.map(b => (
            <button key={b} type="button" className={`toggle-btn ${buyerType === b ? 'active' : ''}`} onClick={() => setBuyerType(b)}>{b}</button>
          ))}
        </div>
      </div>
      <button className="btn-submit" type="submit">Log Sale</button>
    </form>
  )
}

/* ─── Car Wash (R&A Auto Spa) ────────────────────────────────────── */
function CarwashForm({ onSubmit }) {
  const [date, setDate] = useState('')
  const [total, setTotal] = useState('')
  const [count, setCount] = useState('')
  const [sharePct, setSharePct] = useState('50')

  const ashShare = total && sharePct ? (parseFloat(total) * parseFloat(sharePct) / 100) : null

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      title: 'Car wash day logged',
      detail: `${formatCurrency(parseFloat(total || 0))} total — your share: ${formatCurrency(ashShare || 0)} (${sharePct}%)`,
    })
    setDate(''); setTotal(''); setCount('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="field-label">Date</label>
        <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Total Revenue</label>
        <input className="input" type="number" step=".01" placeholder="0.00" value={total} onChange={e => setTotal(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Transaction Count</label>
        <input className="input" type="number" placeholder="0" value={count} onChange={e => setCount(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Your Share %</label>
        <input className="input" type="number" step="1" min="0" max="100" value={sharePct} onChange={e => setSharePct(e.target.value)} />
      </div>

      {ashShare !== null && (
        <div className="calc-row">
          <span className="calc-label">Your Share</span>
          <span className="calc-value calc-profit">{formatCurrency(ashShare)}</span>
        </div>
      )}

      <button className="btn-submit" type="submit">Log Car Wash Day</button>
    </form>
  )
}

/* ─── Mobile Detail (R&A Mobile) — the most-used manual form ─────── */
function DetailForm({ onSubmit }) {
  const [customer, setCustomer] = useState('')
  const [contractorId, setContractorId] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [amount, setAmount] = useState('')
  const [payMethod, setPayMethod] = useState('')
  const [sharePct, setSharePct] = useState('50')

  const ashShare = amount && sharePct ? (parseFloat(amount) * parseFloat(sharePct) / 100) : null
  // #9: Show contractor YTD after selection, not in dropdown
  const selectedContractor = CONTRACTORS.find(c => String(c.id) === contractorId)
  const serviceLabel = SERVICE_TYPES.find(s => s.value === serviceType)?.label || ''

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      title: `Detail job logged — ${formatCurrency(ashShare || 0)} your share`,
      detail: `${serviceLabel || 'Job'} — ${formatCurrency(parseFloat(amount || 0))} ${payMethod || ''} — ${customer || 'Customer'}`,
    })
    setCustomer(''); setContractorId(''); setServiceType(''); setAmount(''); setPayMethod('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="field-label">Customer Name</label>
        <input className="input" type="text" placeholder="Customer name" value={customer} onChange={e => setCustomer(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Contractor</label>
        <select className="select" value={contractorId} onChange={e => setContractorId(e.target.value)}>
          <option value="">Select contractor...</option>
          {CONTRACTORS.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {/* #9: Contractor YTD shown as a card after selection */}
      {selectedContractor && (
        <div className="calc-row" style={{ marginTop: -6 }}>
          <span className="calc-label">{selectedContractor.name} — YTD</span>
          <span className={`calc-value ${selectedContractor.ytd_total >= 600 ? 'calc-loss' : ''}`} style={{ fontSize: 15 }}>
            {formatCurrency(selectedContractor.ytd_total)}
            {selectedContractor.ytd_total >= 500 && <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--orange)' }}>⚠</span>}
          </span>
        </div>
      )}
      <div className="field">
        <label className="field-label">Service Type</label>
        <div className="toggle-group">
          {SERVICE_TYPES.map(s => (
            <button key={s.value} type="button" className={`toggle-btn ${serviceType === s.value ? 'active' : ''}`} onClick={() => setServiceType(s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="field-label">Amount</label>
        <div className="amount-grid" style={{ marginBottom: 8 }}>
          {QUICK_AMOUNTS.map(a => (
            <button key={a} type="button" className={`amount-btn ${amount === String(a) ? 'active' : ''}`} onClick={() => setAmount(String(a))}>
              ${a}
            </button>
          ))}
        </div>
        <input className="input" type="number" step=".01" placeholder="Custom amount" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Payment Method</label>
        <div className="toggle-group">
          {PAYMENT_METHODS.map(m => (
            <button key={m} type="button" className={`toggle-btn ${payMethod === m ? 'active' : ''}`} onClick={() => setPayMethod(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="field-label">Your Share %</label>
        <input className="input" type="number" step="1" min="0" max="100" value={sharePct} onChange={e => setSharePct(e.target.value)} />
      </div>

      {ashShare !== null && (
        <div className="calc-row">
          <span className="calc-label">Your Share</span>
          <span className="calc-value calc-profit">{formatCurrency(ashShare)}</span>
        </div>
      )}

      <button className="btn-submit" type="submit">Log Detail Job</button>
    </form>
  )
}

/* ─── 1099 Contractor Payment ────────────────────────────────────── */
function Pay1099Form({ onSubmit }) {
  const [contractorId, setContractorId] = useState('')
  const [amount, setAmount] = useState('')
  const [payDate, setPayDate] = useState('')
  const [payMethod, setPayMethod] = useState('')
  const [category, setCategory] = useState('detailing')

  // #9: Show YTD after selection
  const selected = CONTRACTORS.find(c => String(c.id) === contractorId)
  const newYtd = selected && amount ? selected.ytd_total + parseFloat(amount || 0) : null

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      title: 'Contractor payment logged',
      detail: `${formatCurrency(parseFloat(amount || 0))} to ${selected?.name || 'contractor'} via ${payMethod || 'payment'}`,
    })
    setContractorId(''); setAmount(''); setPayDate(''); setPayMethod('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="field-label">Contractor</label>
        <select className="select" value={contractorId} onChange={e => setContractorId(e.target.value)}>
          <option value="">Select contractor...</option>
          {CONTRACTORS.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* #9: YTD shown after selection, not in dropdown */}
      {selected && (
        <div className="calc-row" style={{ marginTop: -6 }}>
          <span className="calc-label">{selected.name} — Current YTD</span>
          <span className={`calc-value ${selected.ytd_total >= 600 ? 'calc-loss' : ''}`} style={{ fontSize: 15 }}>
            {formatCurrency(selected.ytd_total)}
          </span>
        </div>
      )}

      <div className="field">
        <label className="field-label">Amount</label>
        <input className="input" type="number" step=".01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>

      {newYtd !== null && (
        <div className="calc-row">
          <span className="calc-label">New YTD After Payment</span>
          <span className={`calc-value ${newYtd >= 600 ? 'calc-loss' : ''}`}>
            {formatCurrency(newYtd)}
            {newYtd >= 600 && <span style={{ fontSize: 12, marginLeft: 8 }}>⚠ Over $600 — file 1099</span>}
          </span>
        </div>
      )}

      <div className="field">
        <label className="field-label">Payment Date</label>
        <input className="input" type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Payment Method</label>
        <div className="toggle-group">
          {[...PAYMENT_METHODS, 'Check'].map(m => (
            <button key={m} type="button" className={`toggle-btn ${payMethod === m ? 'active' : ''}`} onClick={() => setPayMethod(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="field-label">Work Category</label>
        <div className="toggle-group">
          {['Detailing', 'Other'].map(c => (
            <button key={c} type="button" className={`toggle-btn ${category === c.toLowerCase() ? 'active' : ''}`} onClick={() => setCategory(c.toLowerCase())}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <button className="btn-submit" type="submit">Log Payment</button>
    </form>
  )
}
