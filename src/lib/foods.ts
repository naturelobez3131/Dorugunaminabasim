import type { FoodAnalysis } from '../types'

// API gerektirmeden hizli kalori girisi icin yaygin yemekler (1 porsiyon).
// Kullanici fotograf cekmeden de ogun ekleyip kalori takibi yapabilsin.
export interface FoodPreset {
  name: string
  emoji: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const FOOD_PRESETS: FoodPreset[] = [
  { name: 'Yumurta (2 adet)', emoji: '🍳', calories: 155, protein: 13, carbs: 1, fat: 11 },
  { name: 'Yulaf ezmesi (kase)', emoji: '🥣', calories: 280, protein: 10, carbs: 50, fat: 6 },
  { name: 'Tavuk gogsu (150g)', emoji: '🍗', calories: 250, protein: 46, carbs: 0, fat: 6 },
  { name: 'Pilav (porsiyon)', emoji: '🍚', calories: 270, protein: 5, carbs: 56, fat: 3 },
  { name: 'Makarna (porsiyon)', emoji: '🍝', calories: 350, protein: 12, carbs: 65, fat: 4 },
  { name: 'Karisik salata', emoji: '🥗', calories: 120, protein: 4, carbs: 12, fat: 7 },
  { name: 'Tam bugday ekmek (dilim)', emoji: '🍞', calories: 80, protein: 4, carbs: 14, fat: 1 },
  { name: 'Muz', emoji: '🍌', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Elma', emoji: '🍎', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { name: 'Yogurt (kase)', emoji: '🥛', calories: 150, protein: 12, carbs: 12, fat: 6 },
  { name: 'Findik/badem (avuc)', emoji: '🥜', calories: 200, protein: 6, carbs: 6, fat: 18 },
  { name: 'Doner durum', emoji: '🌯', calories: 600, protein: 28, carbs: 60, fat: 28 },
  { name: 'Pizza (dilim)', emoji: '🍕', calories: 285, protein: 12, carbs: 36, fat: 10 },
  { name: 'Hamburger', emoji: '🍔', calories: 550, protein: 25, carbs: 45, fat: 30 },
  { name: 'Corba (kase)', emoji: '🍲', calories: 150, protein: 6, carbs: 18, fat: 6 },
  { name: 'Kahve (sutlu)', emoji: '☕', calories: 60, protein: 3, carbs: 6, fat: 3 }
]

export function presetToFood(p: FoodPreset): FoodAnalysis {
  return {
    name: p.name,
    calories: p.calories,
    protein: p.protein,
    carbs: p.carbs,
    fat: p.fat,
    items: [p.name]
  }
}
