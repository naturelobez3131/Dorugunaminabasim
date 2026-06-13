import { useState } from 'react'
import { useStore } from '../store'
import { Ring } from '../components/Ring'
import { RANKS, nextRank, rankForPoints, rankProgress } from '../lib/ranks'
import { requestPermission, testNotification } from '../lib/notifications'
import { DEFAULT_MODEL } from '../lib/anthropic'

export function Profile({ toast }: { toast: (m: string) => void }) {
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const updateProfile = useStore((s) => s.updateProfile)
  const updateSettings = useStore((s) => s.updateSettings)
  const activities = useStore((s) => s.activities)

  const rank = rankForPoints(profile.points)
  const next = nextRank(profile.points)
  const prog = rankProgress(profile.points)
  const totalDone = activities.filter((a) => a.done).length

  const [showKey, setShowKey] = useState(false)

  async function toggleNotif(on: boolean) {
    if (on) {
      const ok = await requestPermission()
      if (!ok) {
        toast('Bildirim izni verilmedi')
        return
      }
    }
    updateSettings({ notificationsEnabled: on })
  }

  return (
    <>
      <div className="header">
        <div>
          <h1>Profil</h1>
          <div className="sub">Rank, istatistik ve ayarlar</div>
        </div>
      </div>

      <div className="card">
        <div className="hero">
          <Ring
            progress={prog}
            color={rank.color}
            num={rank.emoji}
            cap={rank.name}
          />
          <div>
            <div className="big">{profile.points} puan</div>
            <div className="label">
              {next
                ? `${next.name}'a ${next.min - profile.points} puan`
                : 'En yuksek rank! 🏆'}
            </div>
            <div className="muted" style={{ marginTop: 8 }}>
              🔥 {profile.streak} gun seri · ✅ {totalDone} tamamlanan
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Rank yolu</div>
        <div className="chips">
          {RANKS.map((r) => (
            <div
              key={r.key}
              className={`chip ${profile.points >= r.min ? 'on' : ''}`}
              style={profile.points >= r.min ? { background: r.color, borderColor: r.color } : {}}
            >
              {r.emoji} {r.name} · {r.min}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Hedefler</div>
        <div className="field">
          <label>Isim</label>
          <input
            className="input"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
          />
        </div>
        <div className="row">
          <div className="field">
            <label>Gunluk kalori (kcal)</label>
            <input
              className="input"
              type="number"
              value={profile.calorieGoal}
              onChange={(e) => updateProfile({ calorieGoal: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="field">
            <label>Protein (g)</label>
            <input
              className="input"
              type="number"
              value={profile.proteinGoal}
              onChange={(e) => updateProfile({ proteinGoal: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Bildirimler</div>
        <Toggle
          label="Aktivite hatirlaticilari"
          desc="Saati yaklasan aktivitede kilit ekraninda uyari"
          on={settings.notificationsEnabled}
          onChange={toggleNotif}
        />
        <div className="field" style={{ marginTop: 12 }}>
          <label>Kac dakika once hatirlat</label>
          <input
            className="input"
            type="number"
            value={settings.reminderLeadMin}
            onChange={(e) => updateSettings({ reminderLeadMin: Number(e.target.value) || 0 })}
          />
        </div>
        <button className="btn ghost sm" onClick={() => testNotification()}>
          Test bildirimi gonder
        </button>
        <div className="muted" style={{ marginTop: 10 }}>
          Not: Uygulama tamamen kapaliyken kilit ekrani bildirimi icin sunucu
          tarafli Web Push gerekir. Uygulama acik/arka planda iken hatirlaticilar
          calisir.
        </div>
      </div>

      <div className="card">
        <div className="card-title">AI Ayarlari (Claude)</div>
        <div className="field">
          <label>Claude API anahtari</label>
          <div className="row">
            <input
              className="input"
              type={showKey ? 'text' : 'password'}
              placeholder="sk-ant-..."
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value.trim() })}
            />
            <button
              className="btn ghost sm"
              style={{ flex: '0 0 auto' }}
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? 'Gizle' : 'Goster'}
            </button>
          </div>
        </div>
        <div className="field">
          <label>Model</label>
          <input
            className="input"
            value={settings.model}
            onChange={(e) => updateSettings({ model: e.target.value.trim() || DEFAULT_MODEL })}
          />
        </div>
        <div className="muted">
          Anahtar yalnizca bu cihazda saklanir. Gercek uretimde guvenlik icin
          anahtari bir backend proxy arkasina almaniz onerilir.
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '8px 0 4px' }} className="muted">
        Gunluk Aktivite AI · PWA · Telefon · PC · Android · iPhone
      </div>
    </>
  )
}

function Toggle({
  label,
  desc,
  on,
  onChange
}: {
  label: string
  desc?: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {desc && <div className="muted">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!on)}
        style={{
          width: 52,
          height: 30,
          borderRadius: 999,
          background: on ? 'var(--green)' : 'var(--line)',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.2s'
        }}
        aria-label={label}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 25 : 3,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 0.2s'
          }}
        />
      </button>
    </div>
  )
}
