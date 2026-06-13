import type { Activity } from '../types'
import { timeToDate } from './util'

// Bildirimler: aktivite saati yaklasinca hatirlatma gosterir.
// Uygulama acik (veya PWA olarak yuklu ve service worker aktif) iken calisir.
//
// NOT: iOS/Android kilit ekraninda uygulama TAMAMEN kapaliyken bildirim
// gostermek icin sunucu tarafli Web Push (VAPID) gerekir. Bu istemci-tarafli
// surum, uygulama acikken / arka planda asili dururken kilit ekraninda
// bildirim gosterir. Push altyapisi eklenince ayni arayuz kullanilabilir.

let timers: number[] = []

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  const res = await Notification.requestPermission()
  return res === 'granted'
}

async function show(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    // Service worker varsa onu kullan (mobilde daha guvenilir, kilit ekrani)
    const reg = await navigator.serviceWorker?.getRegistration?.()
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'aktivite-' + title,
        // @ts-expect-error renotify standart ama TS lib eksik olabilir
        renotify: true,
        vibrate: [120, 60, 120]
      })
      return
    }
  } catch {
    /* SW yoksa asagidaki fallback */
  }
  new Notification(title, { body, icon: '/icon-192.png' })
}

function clearTimers() {
  timers.forEach((t) => clearTimeout(t))
  timers = []
}

/**
 * Bugunku tamamlanmamis aktiviteler icin hatirlatici zamanlar kurar.
 * leadMin: aktiviteden kac dakika once hatirlatilsin.
 */
export function scheduleReminders(
  activities: Activity[],
  leadMin: number,
  enabled: boolean
) {
  clearTimers()
  if (!enabled || !notificationsSupported() || Notification.permission !== 'granted') return

  const now = Date.now()
  const horizon = now + 16 * 60 * 60 * 1000 // sonraki 16 saat

  for (const a of activities) {
    if (a.done) continue
    const at = timeToDate(a.time, a.date).getTime()

    // Aktiviteden "leadMin" once hatirlatma
    const lead = at - leadMin * 60 * 1000
    if (lead > now && lead < horizon) {
      timers.push(
        window.setTimeout(() => {
          show('Yaklasan aktivite', `${a.time} · ${a.title} (${leadMin} dk kaldi)`)
        }, lead - now)
      )
    }

    // Tam zamaninda hatirlatma
    if (at > now && at < horizon) {
      timers.push(
        window.setTimeout(() => {
          show('Simdi zamani', `${a.time} · ${a.title}`)
        }, at - now)
      )
    }
  }
}

export async function testNotification() {
  const ok = await requestPermission()
  if (ok) await show('Bildirim aktif ✅', 'Aktivitelerin yaklasinca seni uyaracagim.')
}
