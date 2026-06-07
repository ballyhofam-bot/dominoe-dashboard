import { LayoutDashboard, BarChart3, Car, PenSquare, Users } from 'lucide-react'

const TABS = [
  { id: 'log',         label: 'Log Entry', icon: PenSquare },
  { id: 'overview',    label: 'Overview',  icon: LayoutDashboard },
  { id: 'streams',     label: 'Streams',   icon: BarChart3 },
  { id: 'fleet',       label: 'Fleet',     icon: Car },
  { id: 'contractors', label: '1099',      icon: Users },
]

export default function BottomNav({ active, onTabChange }) {
  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="mobile-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'rgba(10,10,10,.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'var(--safe-bottom)',
        zIndex: 50,
      }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 0',
              background: 'none',
              border: 'none',
              color: active === id ? 'var(--gold)' : 'var(--text3)',
              cursor: 'pointer',
              transition: 'color .15s',
              WebkitAppearance: 'none',
            }}
          >
            <Icon size={22} strokeWidth={active === id ? 2.2 : 1.5} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.3px' }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'none',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-.3px' }}>Dominoe</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Operations Dashboard</div>
        </div>
        <div style={{ padding: '16px 12px', flex: 1 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                marginBottom: 4,
                background: active === id ? 'var(--gold-dim)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: active === id ? 'var(--gold)' : 'var(--text2)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: active === id ? 600 : 500,
                transition: 'all .15s',
                WebkitAppearance: 'none',
                textAlign: 'left',
              }}
            >
              <Icon size={18} strokeWidth={active === id ? 2.2 : 1.5} />
              {label}
            </button>
          ))}
        </div>
      </aside>

      <style>{`
        @media (min-width: 768px) {
          .mobile-nav { display: none !important; }
          .desktop-sidebar { display: flex !important; }
        }
      `}</style>
    </>
  )
}
