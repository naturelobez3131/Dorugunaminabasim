import { useRef, useState } from 'react'
import { selectDayMeals, useStore } from '../store'
import { Ring } from '../components/Ring'
import { analyzeFood } from '../lib/anthropic'
import { prepareImage } from '../lib/image'
import { todayStr } from '../lib/util'
import { FOOD_PRESETS } from '../lib/foods'
import type { FoodAnalysis } from '../types'

export function Nutrition({ toast }: { toast: (m: string) => void }) {
  const date = todayStr()
  const meals = useStore(selectDayMeals(date))
  const addMeal = useStore((s) => s.addMeal)
  const delMeal = useStore((s) => s.deleteMeal)
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)

  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<{ food: FoodAnalysis; thumb?: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [manual, setManual] = useState(false)

  const totals = meals.reduce(
    (acc, m) => ({
      cal: acc.cal + m.calories,
      p: acc.p + m.protein,
      c: acc.c + m.carbs,
      f: acc.f + m.fat
    }),
    { cal: 0, p: 0, c: 0, f: 0 }
  )

  const goal = profile.calorieGoal
  const remaining = Math.max(0, goal - totals.cal)
  const progress = goal ? Math.min(1, totals.cal / goal) : 0

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLoading(true)
    setErr(null)
    try {
      const img = await prepareImage(file)
      const food = await analyzeFood(settings.apiKey, settings.model, img.base64, img.mediaType)
      setPending({ food, thumb: img.thumb })
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Analiz basarisiz')
    } finally {
      setLoading(false)
    }
  }

  function confirm() {
    if (!pending) return
    addMeal(date, pending.food, pending.thumb)
    toast(`${pending.food.name} eklendi · ${pending.food.calories} kcal`)
    setPending(null)
  }

  return (
    <>
      <div className="header">
        <div>
          <h1>Kalori & Diyet</h1>
          <div className="sub">Yemegin fotografini cek, AI hesaplasin</div>
        </div>
      </div>

      {!settings.apiKey && (
        <div className="banner">
          API anahtari yok — fotograf analizi <b>demo</b> deger doner. Gercek AI
          analizi icin Profil → Ayarlar.
        </div>
      )}

      <div className="card">
        <div className="hero">
          <Ring progress={progress} num={`${totals.cal}`} cap={`/ ${goal} kcal`} color="#111111" />
          <div>
            <div className="big">{remaining}</div>
            <div className="label">kcal kaldi</div>
          </div>
        </div>
        <div className="macro-row">
          <Macro k="Protein" v={totals.p} goal={profile.proteinGoal} unit="g" color="#EF6F6F" />
          <Macro k="Karb" v={totals.c} goal={Math.round((goal * 0.45) / 4)} unit="g" color="#F6A35C" />
          <Macro k="Yag" v={totals.f} goal={Math.round((goal * 0.3) / 9)} unit="g" color="#5B8DEF" />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={onPick}
      />

      {!pending && !manual && (
        <div className="row">
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={loading}>
            {loading ? <span className="spinner" /> : '📷'}
            {loading ? 'AI analiz ediyor…' : 'Fotograf'}
          </button>
          <button className="btn ghost" onClick={() => setManual(true)} disabled={loading}>
            ✏️ Manuel
          </button>
        </div>
      )}

      {err && <div className="muted" style={{ color: '#c0392b', marginTop: 10 }}>{err}</div>}

      {manual && !pending && (
        <ManualMeal
          onCancel={() => setManual(false)}
          onSave={(food) => {
            addMeal(date, food)
            toast(`${food.name} eklendi · ${food.calories} kcal`)
            setManual(false)
          }}
        />
      )}

      {pending && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-title">AI analizi</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {pending.thumb ? (
              <img className="thumb" src={pending.thumb} style={{ width: 72, height: 72 }} />
            ) : (
              <div className="thumb" style={{ width: 72, height: 72, fontSize: 30 }}>🍽️</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{pending.food.name}</div>
              <div className="muted">{pending.food.items.join(', ')}</div>
              {pending.food.confidence && (
                <div className="muted" style={{ marginTop: 2 }}>
                  Guven: {pending.food.confidence}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 22 }}>{pending.food.calories}</div>
              <div className="muted">kcal</div>
            </div>
          </div>
          <div className="macro-row">
            <Macro k="Protein" v={pending.food.protein} unit="g" color="#EF6F6F" />
            <Macro k="Karb" v={pending.food.carbs} unit="g" color="#F6A35C" />
            <Macro k="Yag" v={pending.food.fat} unit="g" color="#5B8DEF" />
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn ghost" onClick={() => setPending(null)}>
              Iptal
            </button>
            <button className="btn" onClick={confirm}>
              Gune ekle
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Bugunku ogunler</div>
        {meals.length === 0 && <div className="empty">Henuz ogun eklenmedi.</div>}
        {meals.map((m) => (
          <div key={m.id} className="meal">
            {m.photo ? <img className="thumb" src={m.photo} /> : <div className="thumb">🍽️</div>}
            <div className="b">
              <div className="t">{m.name}</div>
              <div className="m">
                P {m.protein}g · K {m.carbs}g · Y {m.fat}g
              </div>
            </div>
            <div className="kcal">{m.calories}</div>
            <button className="x" onClick={() => delMeal(m.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

function Macro({
  k,
  v,
  goal,
  unit,
  color
}: {
  k: string
  v: number
  goal?: number
  unit: string
  color: string
}) {
  const pct = goal ? Math.min(1, v / goal) : 0
  return (
    <div className="macro">
      <div className="v">
        {v}
        {unit}
      </div>
      <div className="k">
        {k}
        {goal ? ` / ${goal}${unit}` : ''}
      </div>
      {goal != null && (
        <div className="bar">
          <span style={{ width: `${pct * 100}%`, background: color }} />
        </div>
      )}
    </div>
  )
}

function ManualMeal({
  onSave,
  onCancel
}: {
  onSave: (food: FoodAnalysis) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [cal, setCal] = useState('')
  const [p, setP] = useState('')
  const [c, setC] = useState('')
  const [f, setF] = useState('')

  function fillPreset(presetName: string) {
    const preset = FOOD_PRESETS.find((x) => x.name === presetName)
    if (!preset) return
    setName(preset.name)
    setCal(String(preset.calories))
    setP(String(preset.protein))
    setC(String(preset.carbs))
    setF(String(preset.fat))
  }

  function save() {
    if (!name.trim() || !cal) return
    onSave({
      name: name.trim(),
      calories: Number(cal) || 0,
      protein: Number(p) || 0,
      carbs: Number(c) || 0,
      fat: Number(f) || 0,
      items: [name.trim()]
    })
  }

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div className="card-title">Manuel ogun ekle</div>
      <div className="muted" style={{ marginBottom: 10 }}>
        Hazir bir yemek sec ya da kendin doldur (API gerekmez):
      </div>
      <div className="chips" style={{ marginBottom: 14 }}>
        {FOOD_PRESETS.map((x) => (
          <button key={x.name} className="chip" onClick={() => fillPreset(x.name)}>
            {x.emoji} {x.name.replace(/ \(.*\)/, '')}
          </button>
        ))}
      </div>
      <div className="field">
        <input
          className="input"
          placeholder="Yemek adi"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field">
        <label>Kalori (kcal)</label>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          placeholder="or. 450"
          value={cal}
          onChange={(e) => setCal(e.target.value)}
        />
      </div>
      <div className="row">
        <div className="field">
          <label>Protein (g)</label>
          <input className="input" type="number" value={p} onChange={(e) => setP(e.target.value)} />
        </div>
        <div className="field">
          <label>Karb (g)</label>
          <input className="input" type="number" value={c} onChange={(e) => setC(e.target.value)} />
        </div>
        <div className="field">
          <label>Yag (g)</label>
          <input className="input" type="number" value={f} onChange={(e) => setF(e.target.value)} />
        </div>
      </div>
      <div className="row" style={{ marginTop: 4 }}>
        <button className="btn ghost" onClick={onCancel}>
          Iptal
        </button>
        <button className="btn" onClick={save} disabled={!name.trim() || !cal}>
          Ekle
        </button>
      </div>
    </div>
  )
}
