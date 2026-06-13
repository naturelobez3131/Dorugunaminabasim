import { useState } from 'react'
import { useStore } from '../store'
import { planDay } from '../lib/anthropic'
import { CATEGORY_META, todayStr } from '../lib/util'
import type { PlannedActivity } from '../types'

const EXAMPLES = [
  'Sabah spor, gunduz ofiste 3 toplanti, aksam ders calismak istiyorum',
  'Evden calisiyorum, 2 saat derin odak, ogle yuruyusu, aksam yoga',
  'Bugun izinliyim; market, temizlik, arkadaslarla bulusma ve dinlenme'
]

export function Plan({ onGo }: { onGo: () => void }) {
  const date = todayStr()
  const settings = useStore((s) => s.settings)
  const setPlan = useStore((s) => s.setPlan)

  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<PlannedActivity[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function generate() {
    if (!desc.trim()) return
    setLoading(true)
    setErr(null)
    try {
      const result = await planDay(settings.apiKey, settings.model, desc.trim())
      setPreview(result)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Plan olusturulamadi')
    } finally {
      setLoading(false)
    }
  }

  function apply(replace: boolean) {
    if (!preview) return
    setPlan(date, preview, replace)
    setPreview(null)
    setDesc('')
    onGo()
  }

  return (
    <>
      <div className="header">
        <div>
          <h1>AI Planlama</h1>
          <div className="sub">Gununu kisaca anlat, gerisini AI halletsin</div>
        </div>
      </div>

      {!settings.apiKey && (
        <div className="banner">
          API anahtari girilmedi — su an <b>demo plan</b> uretiliyor. Gercek AI
          planlama icin Profil → Ayarlar bolumunden Claude API anahtarini ekle.
        </div>
      )}

      <div className="card">
        <div className="card-title">Bugun ne yapmak istiyorsun?</div>
        <textarea
          className="input"
          rows={4}
          placeholder="Or. Sabah kosu, gunduz proje uzerinde calisma, aksam yemek ve dizi..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <div className="chips" style={{ marginTop: 12 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="chip" onClick={() => setDesc(ex)}>
              {ex.length > 34 ? ex.slice(0, 34) + '…' : ex}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <button className="btn" onClick={generate} disabled={loading || !desc.trim()}>
            {loading ? <span className="spinner" /> : '✨'}
            {loading ? 'Planliyor…' : 'AI ile planimi olustur'}
          </button>
        </div>
        {err && <div className="muted" style={{ color: '#c0392b', marginTop: 10 }}>{err}</div>}
      </div>

      {preview && (
        <div className="card">
          <div className="card-title">Onerilen plan · {preview.length} aktivite</div>
          {preview.map((p, i) => {
            const meta = CATEGORY_META[p.category]
            return (
              <div key={i} className="act">
                <div className="time">{p.time}</div>
                <div className="icon" style={{ background: meta.color + '22' }}>
                  {meta.emoji}
                </div>
                <div className="body">
                  <div className="t">{p.title}</div>
                  <div className="m">
                    {meta.label}
                    {p.durationMin ? ` · ${p.durationMin}dk` : ''}
                  </div>
                </div>
              </div>
            )
          })}
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn ghost" onClick={() => apply(false)}>
              Listeye ekle
            </button>
            <button className="btn" onClick={() => apply(true)}>
              Gunu degistir
            </button>
          </div>
        </div>
      )}
    </>
  )
}
