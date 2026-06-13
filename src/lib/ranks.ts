// Puan -> Rank sistemi. Yapilan aktiviteler puan kazandirir, puanlar rank belirler.

export interface Rank {
  key: string
  name: string
  min: number
  color: string
  emoji: string
}

export const RANKS: Rank[] = [
  { key: 'bronze', name: 'Bronz', min: 0, color: '#B07A4B', emoji: '🥉' },
  { key: 'silver', name: 'Gumus', min: 250, color: '#9AA3AD', emoji: '🥈' },
  { key: 'gold', name: 'Altin', min: 600, color: '#E0B341', emoji: '🥇' },
  { key: 'platinum', name: 'Platin', min: 1200, color: '#5FB4C9', emoji: '💎' },
  { key: 'diamond', name: 'Elmas', min: 2200, color: '#7C8CF8', emoji: '🔷' },
  { key: 'master', name: 'Usta', min: 3800, color: '#B06FE0', emoji: '👑' },
  { key: 'legend', name: 'Efsane', min: 6000, color: '#111111', emoji: '🏆' }
]

export function rankForPoints(points: number): Rank {
  let current = RANKS[0]
  for (const r of RANKS) {
    if (points >= r.min) current = r
  }
  return current
}

export function nextRank(points: number): Rank | null {
  for (const r of RANKS) {
    if (points < r.min) return r
  }
  return null
}

/** Mevcut rank icinde sonraki ranka ilerleme yuzdesi (0-1). */
export function rankProgress(points: number): number {
  const cur = rankForPoints(points)
  const nxt = nextRank(points)
  if (!nxt) return 1
  const span = nxt.min - cur.min
  if (span <= 0) return 1
  return Math.min(1, Math.max(0, (points - cur.min) / span))
}
