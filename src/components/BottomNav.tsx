export type Tab = 'today' | 'plan' | 'nutrition' | 'profile'

const TABS: { key: Tab; label: string; ic: string }[] = [
  { key: 'today', label: 'Bugun', ic: '📋' },
  { key: 'plan', label: 'Planla', ic: '✨' },
  { key: 'nutrition', label: 'Kalori', ic: '🍎' },
  { key: 'profile', label: 'Profil', ic: '🏆' }
]

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`nav-btn ${tab === t.key ? 'on' : ''}`}
            onClick={() => onChange(t.key)}
          >
            <span className="ic">{t.ic}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
