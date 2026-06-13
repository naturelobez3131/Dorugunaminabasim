// Uygulama veri modelleri

export type Category =
  | 'is'
  | 'spor'
  | 'ogun'
  | 'kisisel'
  | 'saglik'
  | 'ogrenme'
  | 'dinlenme'
  | 'diger'

export interface Activity {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM (24s)
  title: string
  category: Category
  points: number
  durationMin?: number
  note?: string
  done: boolean
  source: 'ai' | 'manual'
}

export interface Meal {
  id: string
  date: string // YYYY-MM-DD
  name: string
  calories: number
  protein: number // gram
  carbs: number // gram
  fat: number // gram
  items?: string[]
  photo?: string // data URL (kucuk onizleme)
  createdAt: number
}

export interface Settings {
  apiKey: string
  model: string
  notificationsEnabled: boolean
  reminderLeadMin: number // aktiviteden kac dk once hatirlat
}

export interface Profile {
  name: string
  calorieGoal: number
  proteinGoal: number
  points: number
  streak: number
  lastActiveDate: string | null
}

// AI plan ciktisi (ham)
export interface PlannedActivity {
  time: string
  title: string
  category: Category
  durationMin?: number
  note?: string
}

// AI yemek analizi ciktisi
export interface FoodAnalysis {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  items: string[]
  confidence?: 'dusuk' | 'orta' | 'yuksek'
}
