import { useEffect, useRef, useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { Today } from './screens/Today'
import { Plan } from './screens/Plan'
import { Nutrition } from './screens/Nutrition'
import { Profile } from './screens/Profile'
import { useStore } from './store'
import { scheduleReminders } from './lib/notifications'
import { todayStr } from './lib/util'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number>()

  const activities = useStore((s) => s.activities)
  const settings = useStore((s) => s.settings)

  function showToast(msg: string) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }

  // Aktivite veya ayar degisince hatirlaticilari yeniden zamanla
  useEffect(() => {
    const today = activities.filter((a) => a.date === todayStr())
    scheduleReminders(today, settings.reminderLeadMin, settings.notificationsEnabled)
  }, [activities, settings.reminderLeadMin, settings.notificationsEnabled])

  return (
    <div className="app">
      {tab === 'today' && <Today onPlan={() => setTab('plan')} />}
      {tab === 'plan' && <Plan onGo={() => setTab('today')} />}
      {tab === 'nutrition' && <Nutrition toast={showToast} />}
      {tab === 'profile' && <Profile toast={showToast} />}

      {toast && <div className="toast">{toast}</div>}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
