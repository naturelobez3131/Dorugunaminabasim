import { useMemo, useState } from 'react'
import { selectDayActivities, useStore } from '../store'
import { Ring } from '../components/Ring'
import { CATEGORY_META, fmtDuration, pointsForCategory, todayStr } from '../lib/util'
import type { Category } from '../types'
import { rankForPoints } from '../lib/ranks'

const CATS: Category[] = ['is', 'spor', 'ogun', 'ogrenme', 'saglik', 'kisisel', 'dinlenme', 'diger']

export function Today({ onPlan }: { onPlan: () => void }) {
  const date = todayStr()
  const activities = useStore(selectDayActivities(date))
  const toggle = useStore((s) => s.toggleActivity)
  const del = useStore((s) => s.deleteActivity)
  const add = useStore((s) => s.addActivity)
  const points = useStore((s) => s.profile.points)
  const rank = rankForPoints(points)

  const done = activities.filter((a) => a.done).length
  const total = activities.length
  const dayPoints = activities.filter((a) => a.done).reduce((s, a) => s + a.points, 0)
  const progress = total ? done / total : 0

  const [adding, setAdding] = useState(false)

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 6) return 'Iyi geceler'
    if (h < 12) return 'Gunaydin'
    if (h < 18) return 'Iyi gunler'
    return 'Iyi aksamlar'
  }, [])

  return (
    <>
      <div className="header">
        <div>
          <h1>{greeting} 👋</h1>
          <div className="sub">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div className="rank-pill" style={{ color: rank.color }}>
          {rank.emoji} {rank.name}
        </div>
      </div>

      <div className="card">
        <div className="hero">
          <Ring progress={progress} num={`${done}/${total || 0}`} cap="aktivite" />
          <div>
            <div className="big">+{dayPoints} puan</div>
            <div className="label">bugun kazanildi</div>
            <div className="muted" style={{ marginTop: 8 }}>
              {total === 0
                ? 'Henuz plan yok. AI ile gununu planla.'
                : done === total
                ? 'Hepsi tamam, harikasin! 🎉'
                : `${total - done} aktivite kaldi`}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6
          }}
        >
          <div className="card-title" style={{ margin: 0 }}>
            Gunluk akis
          </div>
          <button className="chip" onClick={() => setAdding((v) => !v)}>
            + Ekle
          </button>
        </div>

        {adding && <QuickAdd date={date} onDone={() => setAdding(false)} add={add} />}

        {activities.length === 0 && !adding && (
          <div className="empty">
            Bos gun.
            <br />
            <button className="btn sm" style={{ marginTop: 12 }} onClick={onPlan}>
              ✨ AI ile planla
            </button>
          </div>
        )}

        {activities.map((a) => {
          const meta = CATEGORY_META[a.category]
          return (
            <div key={a.id} className={`act ${a.done ? 'done' : ''}`}>
              <div className="time">{a.time}</div>
              <div className="icon" style={{ background: meta.color + '22' }}>
                {meta.emoji}
              </div>
              <div className="body">
                <div className="t">{a.title}</div>
                <div className="m">
                  {meta.label}
                  {a.durationMin ? ` · ${fmtDuration(a.durationMin)}` : ''}
                  {a.note ? ` · ${a.note}` : ''}
                </div>
              </div>
              <div className="pts">+{a.points}</div>
              <button
                className={`check ${a.done ? 'on' : ''}`}
                onClick={() => toggle(a.id)}
                aria-label="tamamla"
              >
                ✓
              </button>
              <button className="x" onClick={() => del(a.id)} aria-label="sil">
                ×
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}

function QuickAdd({
  date,
  onDone,
  add
}: {
  date: string
  onDone: () => void
  add: ReturnType<typeof useStore.getState>['addActivity']
}) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('12:00')
  const [cat, setCat] = useState<Category>('is')

  function save() {
    if (!title.trim()) return
    add({ date, time, title: title.trim(), category: cat, points: pointsForCategory(cat) })
    onDone()
  }

  return (
    <div style={{ padding: '6px 0 14px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}>
      <div className="field">
        <input
          className="input"
          placeholder="Aktivite (or. Spor salonu)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="chips" style={{ marginBottom: 12 }}>
        {CATS.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
            {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
          </button>
        ))}
      </div>
      <div className="row">
        <button className="btn ghost sm" onClick={onDone}>
          Vazgec
        </button>
        <button className="btn sm" onClick={save}>
          Kaydet
        </button>
      </div>
    </div>
  )
}
