import type { Category } from '../types'

export function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function nowHHMM(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const CATEGORY_POINTS: Record<Category, number> = {
  spor: 30,
  saglik: 25,
  ogrenme: 25,
  is: 20,
  ogun: 10,
  kisisel: 10,
  dinlenme: 8,
  diger: 12
}

export function pointsForCategory(c: Category): number {
  return CATEGORY_POINTS[c] ?? 12
}

export const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string }> = {
  is: { label: 'Is', emoji: '💼', color: '#5B8DEF' },
  spor: { label: 'Spor', emoji: '🏃', color: '#7BD389' },
  ogun: { label: 'Ogun', emoji: '🍽️', color: '#F6A35C' },
  kisisel: { label: 'Kisisel', emoji: '🧴', color: '#C98BDB' },
  saglik: { label: 'Saglik', emoji: '❤️', color: '#EF6F6F' },
  ogrenme: { label: 'Ogrenme', emoji: '📚', color: '#56C2C2' },
  dinlenme: { label: 'Dinlenme', emoji: '🌿', color: '#9AC6A0' },
  diger: { label: 'Diger', emoji: '✨', color: '#9AA3AD' }
}

/** "HH:MM" -> bugunun o saatine ait Date */
export function timeToDate(hhmm: string, dateStr?: string): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const base = dateStr ? new Date(dateStr + 'T00:00:00') : new Date()
  base.setHours(h || 0, m || 0, 0, 0)
  return base
}

/** Dakikayi "1s 30dk" gibi gosterir */
export function fmtDuration(min?: number): string {
  if (!min) return ''
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h && m) return `${h}s ${m}dk`
  if (h) return `${h}s`
  return `${m}dk`
}
