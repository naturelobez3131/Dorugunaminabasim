import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Activity,
  Category,
  FoodAnalysis,
  Meal,
  PlannedActivity,
  Profile,
  Settings
} from './types'
import { DEFAULT_MODEL } from './lib/anthropic'
import { pointsForCategory, todayStr, uid } from './lib/util'

interface AppState {
  profile: Profile
  settings: Settings
  activities: Activity[]
  meals: Meal[]

  // aktivite
  setPlan: (date: string, planned: PlannedActivity[], replace: boolean) => void
  addActivity: (a: Omit<Activity, 'id' | 'done' | 'points' | 'source'> & {
    points?: number
    source?: Activity['source']
  }) => void
  toggleActivity: (id: string) => void
  deleteActivity: (id: string) => void

  // ogun / kalori
  addMeal: (date: string, food: FoodAnalysis, photo?: string) => void
  deleteMeal: (id: string) => void

  // ayar / profil
  updateSettings: (s: Partial<Settings>) => void
  updateProfile: (p: Partial<Profile>) => void
}

const initialProfile: Profile = {
  name: 'Sen',
  calorieGoal: 2200,
  proteinGoal: 120,
  points: 0,
  streak: 0,
  lastActiveDate: null
}

const initialSettings: Settings = {
  apiKey: '',
  model: DEFAULT_MODEL,
  notificationsEnabled: false,
  reminderLeadMin: 10
}

/** Aktivite tamamlaninca streak (gun serisi) gunceller. */
function bumpStreak(p: Profile): Profile {
  const today = todayStr()
  if (p.lastActiveDate === today) return p
  const yesterday = todayStr(new Date(Date.now() - 86400000))
  const streak = p.lastActiveDate === yesterday ? p.streak + 1 : 1
  return { ...p, streak, lastActiveDate: today }
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: initialProfile,
      settings: initialSettings,
      activities: [],
      meals: [],

      setPlan: (date, planned, replace) =>
        set((st) => {
          const others = replace
            ? st.activities.filter((a) => a.date !== date)
            : st.activities
          const created: Activity[] = planned.map((p) => ({
            id: uid(),
            date,
            time: p.time,
            title: p.title,
            category: p.category,
            durationMin: p.durationMin,
            note: p.note,
            points: pointsForCategory(p.category),
            done: false,
            source: 'ai'
          }))
          return { activities: [...others, ...created] }
        }),

      addActivity: (a) =>
        set((st) => ({
          activities: [
            ...st.activities,
            {
              id: uid(),
              date: a.date,
              time: a.time,
              title: a.title,
              category: a.category,
              durationMin: a.durationMin,
              note: a.note,
              points: a.points ?? pointsForCategory(a.category),
              done: false,
              source: a.source ?? 'manual'
            }
          ]
        })),

      toggleActivity: (id) =>
        set((st) => {
          let deltaPoints = 0
          let willComplete = false
          const activities = st.activities.map((a) => {
            if (a.id !== id) return a
            const done = !a.done
            deltaPoints = done ? a.points : -a.points
            willComplete = done
            return { ...a, done }
          })
          const points = Math.max(0, st.profile.points + deltaPoints)
          const profile = willComplete
            ? bumpStreak({ ...st.profile, points })
            : { ...st.profile, points }
          return { activities, profile }
        }),

      deleteActivity: (id) =>
        set((st) => ({ activities: st.activities.filter((a) => a.id !== id) })),

      addMeal: (date, food, photo) =>
        set((st) => ({
          meals: [
            ...st.meals,
            {
              id: uid(),
              date,
              name: food.name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              items: food.items,
              photo,
              createdAt: Date.now()
            }
          ]
        })),

      deleteMeal: (id) =>
        set((st) => ({ meals: st.meals.filter((m) => m.id !== id) })),

      updateSettings: (s) =>
        set((st) => ({ settings: { ...st.settings, ...s } })),

      updateProfile: (p) =>
        set((st) => ({ profile: { ...st.profile, ...p } }))
    }),
    { name: 'gunluk-aktivite-ai-v1' }
  )
)

// Secici yardimcilar
export const selectDayActivities = (date: string) => (st: AppState) =>
  st.activities
    .filter((a) => a.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))

export const selectDayMeals = (date: string) => (st: AppState) =>
  st.meals.filter((m) => m.date === date).sort((a, b) => a.createdAt - b.createdAt)

export type { Category }
