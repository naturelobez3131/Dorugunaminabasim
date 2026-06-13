import Anthropic from '@anthropic-ai/sdk'
import type { Category, FoodAnalysis, PlannedActivity } from '../types'

// NOT (guvenlik): API anahtari demo amaciyla tarayicida saklanir ve dogrudan
// Claude API'ye gonderilir (dangerouslyAllowBrowser). Gercek bir uretim
// dagitiminda anahtari bir backend/proxy arkasina alin; istemciye koymayin.

export const DEFAULT_MODEL = 'claude-opus-4-8'

const VALID_CATEGORIES: Category[] = [
  'is', 'spor', 'ogun', 'kisisel', 'saglik', 'ogrenme', 'dinlenme', 'diger'
]

function client(apiKey: string) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

function firstText(message: Anthropic.Message): string {
  for (const block of message.content) {
    if (block.type === 'text') return block.text
  }
  return ''
}

function coerceCategory(c: unknown): Category {
  return VALID_CATEGORIES.includes(c as Category) ? (c as Category) : 'diger'
}

function safeJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    // Model bazen JSON'u ```json blogu icinde verebilir
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        return null
      }
    }
    return null
  }
}

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    activities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          time: { type: 'string', description: '24 saat formati HH:MM' },
          title: { type: 'string' },
          category: { type: 'string', enum: VALID_CATEGORIES },
          durationMin: { type: 'integer' },
          note: { type: 'string' }
        },
        required: ['time', 'title', 'category'],
        additionalProperties: false
      }
    }
  },
  required: ['activities'],
  additionalProperties: false
}

const FOOD_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    calories: { type: 'integer' },
    protein: { type: 'integer' },
    carbs: { type: 'integer' },
    fat: { type: 'integer' },
    items: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'string', enum: ['dusuk', 'orta', 'yuksek'] }
  },
  required: ['name', 'calories', 'protein', 'carbs', 'fat', 'items'],
  additionalProperties: false
}

/**
 * Gunu kisaca anlat -> AI tum gunu zaman cizelgesi olarak planlar.
 */
export async function planDay(
  apiKey: string,
  model: string,
  description: string
): Promise<PlannedActivity[]> {
  if (!apiKey) return mockPlan(description)

  const message = await client(apiKey).messages.create({
    model: model || DEFAULT_MODEL,
    max_tokens: 4000,
    system:
      'Sen bir gunluk planlama asistanisin. Kullanicinin kisaca anlattigi gune ' +
      'gore gercekci, dengeli ve uygulanabilir bir gunluk zaman cizelgesi olusturursun. ' +
      'Ogun, spor, mola ve dinlenme zamanlarini mantikli yerlestir. Saatleri HH:MM (24 saat) ' +
      'formatinda ve kronolojik sirada ver. Turkce yaz. 6-12 aktivite uret.',
    messages: [
      {
        role: 'user',
        content:
          `Gunum: ${description}\n\nBu gunu detayli bir zaman cizelgesine donustur.`
      }
    ],
    // Yapilandirilmis cikti: gecerli JSON garanti edilir
    output_config: { format: { type: 'json_schema', schema: PLAN_SCHEMA } }
  } as Anthropic.MessageCreateParamsNonStreaming)

  const parsed = safeJson<{ activities: PlannedActivity[] }>(firstText(message))
  if (!parsed?.activities?.length) return mockPlan(description)

  return parsed.activities
    .map((a) => ({
      time: String(a.time).slice(0, 5),
      title: String(a.title).trim(),
      category: coerceCategory(a.category),
      durationMin: a.durationMin,
      note: a.note
    }))
    .filter((a) => a.title && /^\d{1,2}:\d{2}$/.test(a.time))
    .sort((a, b) => a.time.localeCompare(b.time))
}

/**
 * Yemek fotografini analiz et -> kalori ve makro tahmini.
 */
export async function analyzeFood(
  apiKey: string,
  model: string,
  base64Data: string,
  mediaType: string
): Promise<FoodAnalysis> {
  if (!apiKey) return mockFood()

  const message = await client(apiKey).messages.create({
    model: model || DEFAULT_MODEL,
    max_tokens: 1500,
    system:
      'Sen bir beslenme uzmanisin. Yemek fotografina bakip tahmini kalori ve makro ' +
      '(protein, karbonhidrat, yag - gram) degerlerini verirsin. Porsiyon boyutunu ' +
      'gorselden tahmin et. Emin degilsen confidence "dusuk" yaz. Turkce isimlendir.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: base64Data
            }
          },
          {
            type: 'text',
            text: 'Bu yemegi analiz et: ismi, toplam kalori ve makrolar (gram). Icindekileri listele.'
          }
        ]
      }
    ],
    output_config: { format: { type: 'json_schema', schema: FOOD_SCHEMA } }
  } as Anthropic.MessageCreateParamsNonStreaming)

  const parsed = safeJson<FoodAnalysis>(firstText(message))
  if (!parsed) return mockFood()

  return {
    name: parsed.name || 'Yemek',
    calories: Math.max(0, Math.round(parsed.calories || 0)),
    protein: Math.max(0, Math.round(parsed.protein || 0)),
    carbs: Math.max(0, Math.round(parsed.carbs || 0)),
    fat: Math.max(0, Math.round(parsed.fat || 0)),
    items: Array.isArray(parsed.items) ? parsed.items : [],
    confidence: parsed.confidence
  }
}

// ---- API anahtari yokken calisan basit yedek (demo) ----

function mockPlan(description: string): PlannedActivity[] {
  const lower = description.toLowerCase()
  const base: PlannedActivity[] = [
    { time: '07:30', title: 'Uyan ve su ic', category: 'kisisel', durationMin: 15 },
    { time: '08:00', title: 'Kahvalti', category: 'ogun', durationMin: 30 },
    { time: '09:00', title: 'Derin calisma blogu', category: 'is', durationMin: 120 },
    { time: '11:00', title: 'Kisa yuruyus / mola', category: 'dinlenme', durationMin: 15 },
    { time: '13:00', title: 'Ogle yemegi', category: 'ogun', durationMin: 45 },
    { time: '14:00', title: 'Toplanti / gorevler', category: 'is', durationMin: 120 },
    { time: '18:00', title: 'Egzersiz', category: 'spor', durationMin: 45 },
    { time: '19:30', title: 'Aksam yemegi', category: 'ogun', durationMin: 45 },
    { time: '21:00', title: 'Okuma / dinlenme', category: 'dinlenme', durationMin: 45 }
  ]
  if (lower.includes('spor') || lower.includes('antren')) {
    base.push({ time: '06:45', title: 'Sabah kosusu', category: 'spor', durationMin: 30 })
  }
  if (lower.includes('ders') || lower.includes('sinav') || lower.includes('okul')) {
    base.push({ time: '15:30', title: 'Ders calismasi', category: 'ogrenme', durationMin: 90 })
  }
  return base.sort((a, b) => a.time.localeCompare(b.time))
}

function mockFood(): FoodAnalysis {
  return {
    name: 'Karisik tabak (tahmini)',
    calories: 520,
    protein: 28,
    carbs: 55,
    fat: 18,
    items: ['Tavuk', 'Pilav', 'Salata'],
    confidence: 'dusuk'
  }
}
