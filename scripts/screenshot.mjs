import puppeteer from 'puppeteer'

const BASE = 'http://127.0.0.1:4173/'
const today = new Date().toISOString().slice(0, 10)

// Demo veri: ekranlar dolu gorunsun
const seed = {
  state: {
    profile: {
      name: 'Selim',
      calorieGoal: 2200,
      proteinGoal: 120,
      points: 740,
      streak: 5,
      lastActiveDate: today
    },
    settings: { apiKey: '', model: 'claude-opus-4-8', notificationsEnabled: true, reminderLeadMin: 10 },
    activities: [
      { id: 'a1', date: today, time: '07:30', title: 'Uyan ve su ic', category: 'kisisel', points: 10, durationMin: 15, done: true, source: 'ai' },
      { id: 'a2', date: today, time: '08:00', title: 'Kahvalti', category: 'ogun', points: 10, durationMin: 30, done: true, source: 'ai' },
      { id: 'a3', date: today, time: '09:00', title: 'Derin calisma blogu', category: 'is', points: 20, durationMin: 120, done: true, source: 'ai' },
      { id: 'a4', date: today, time: '13:00', title: 'Ogle yemegi', category: 'ogun', points: 10, durationMin: 45, done: false, source: 'ai' },
      { id: 'a5', date: today, time: '18:00', title: 'Egzersiz', category: 'spor', points: 30, durationMin: 45, done: false, source: 'ai' },
      { id: 'a6', date: today, time: '21:00', title: 'Okuma / dinlenme', category: 'dinlenme', points: 8, durationMin: 45, done: false, source: 'ai' }
    ],
    meals: [
      { id: 'm1', date: today, name: 'Yulaf + muz + findik', calories: 410, protein: 14, carbs: 62, fat: 12, items: ['Yulaf', 'Muz', 'Findik'], createdAt: Date.now() - 9000000 },
      { id: 'm2', date: today, name: 'Tavuklu salata kasesi', calories: 520, protein: 42, carbs: 28, fat: 22, items: ['Izgara tavuk', 'Yesillik', 'Zeytinyagi'], createdAt: Date.now() - 3000000 }
    ]
  },
  version: 0
}

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }
})
const page = await browser.newPage()

// Once seed yaz
await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate((s) => {
  localStorage.setItem('gunluk-aktivite-ai-v1', JSON.stringify(s))
}, seed)
await page.reload({ waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 600))

async function shot(name) {
  await new Promise((r) => setTimeout(r, 500))
  await page.screenshot({ path: `shots/${name}.png` })
  console.log('shot:', name)
}

// Bugun
await shot('1-bugun')

// Planla sekmesi (nav butonlari)
const tabs = await page.$$('.nav-btn')
async function clickTab(i) {
  const btns = await page.$$('.nav-btn')
  await btns[i].click()
  await new Promise((r) => setTimeout(r, 500))
}
await clickTab(1)
// ornek metni doldur
const ta = await page.$('textarea.input')
if (ta) await ta.type('Sabah spor, gunduz ofiste 3 toplanti, aksam ders calisma')
await shot('2-planla')

await clickTab(2)
await shot('3-kalori')

await clickTab(3)
await shot('4-profil')

// Kalori sekmesinde manuel ekleme panelini ac
await clickTab(2)
const btns = await page.$$('.btn')
// "Manuel" butonu (ghost) — metnine gore bul
for (const b of btns) {
  const t = await page.evaluate((el) => el.textContent, b)
  if (t && t.includes('Manuel')) {
    await b.click()
    break
  }
}
await new Promise((r) => setTimeout(r, 500))
await shot('5-manuel-kalori')

await browser.close()
console.log('done; tabs:', tabs.length)
