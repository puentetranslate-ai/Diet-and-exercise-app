// Meal engine: take a craving ("I want a burrito") + a per-meal macro target,
// then build a real version of that dish whose portions fit the target.
// Fully deterministic & offline — no API key required.

import { FOODS, food } from './foods.js'

// Dish templates. Each names component foods by role; the solver sizes them.
const TEMPLATES = [
  {
    id: 'burrito_bowl', name: 'Burrito bowl', emoji: '🌯',
    keywords: ['burrito', 'bowl', 'mexican', 'chipotle', 'taco', 'fajita', 'tex mex'],
    protein: 'chicken_breast', carb: 'jasmine_rice', fat: 'avocado',
    veg: ['peppers', 'onion'], sauce: 'salsa', vegGrams: 120,
    method: 'Build a bowl with rice, seared protein, peppers & onions, then top with avocado and salsa.',
  },
  {
    id: 'pasta', name: 'Protein pasta', emoji: '🍝',
    keywords: ['pasta', 'spaghetti', 'noodles italian', 'bolognese', 'marinara', 'italian'],
    protein: 'ground_turkey', carb: 'pasta', fat: 'parmesan',
    veg: ['spinach', 'tomato'], sauce: 'tomato_sauce', vegGrams: 100,
    method: 'Brown the protein, simmer in marinara with greens, toss with pasta and a little parmesan.',
  },
  {
    id: 'burger', name: 'Smash burger plate', emoji: '🍔',
    keywords: ['burger', 'cheeseburger', 'patty', 'smash'],
    protein: 'lean_beef', carb: 'bun', fat: 'cheese',
    veg: ['lettuce', 'tomato', 'onion'], sauce: 'salsa', vegGrams: 80,
    method: 'Smash the beef thin, sear hard, melt cheese, stack on a bun with crisp veg.',
  },
  {
    id: 'stir_fry', name: 'Stir-fry', emoji: '🥢',
    keywords: ['stir fry', 'stir-fry', 'asian', 'wok', 'teriyaki', 'chinese', 'fried rice'],
    protein: 'chicken_breast', carb: 'jasmine_rice', fat: 'olive_oil',
    veg: ['mixed_veg', 'peppers'], sauce: 'soy_sauce', vegGrams: 150,
    method: 'Sear protein in a hot wok, add veg, finish with rice and a splash of teriyaki/soy.',
  },
  {
    id: 'salmon_plate', name: 'Salmon & potatoes', emoji: '🐟',
    keywords: ['salmon', 'fish', 'seafood plate'],
    protein: 'salmon', carb: 'sweet_potato', fat: 'olive_oil',
    veg: ['broccoli'], sauce: null, vegGrams: 150,
    method: 'Roast salmon and sweet potato, steam the broccoli, finish with a drizzle of olive oil.',
  },
  {
    id: 'taco', name: 'Street tacos', emoji: '🌮',
    keywords: ['taco', 'tacos', 'street taco', 'carne'],
    protein: 'lean_beef', carb: 'tortilla', fat: 'avocado',
    veg: ['onion', 'tomato'], sauce: 'salsa', vegGrams: 70,
    method: 'Season and sear the protein, warm tortillas, top with onion, salsa and avocado.',
  },
  {
    id: 'salad', name: 'Power salad', emoji: '🥗',
    keywords: ['salad', 'greens', 'caesar', 'light', 'healthy bowl'],
    protein: 'chicken_breast', carb: 'quinoa', fat: 'feta',
    veg: ['lettuce', 'cucumber', 'tomato'], sauce: 'olive_oil', vegGrams: 160,
    method: 'Toss greens with quinoa, sliced protein, feta and an olive-oil dressing.',
  },
  {
    id: 'smoothie', name: 'Protein smoothie', emoji: '🥤',
    keywords: ['smoothie', 'shake', 'protein shake', 'drink', 'blend'],
    protein: 'whey', carb: 'banana', fat: 'peanut_butter',
    veg: ['spinach'], sauce: null, vegGrams: 30, extra: 'berries',
    method: 'Blend protein, banana, berries and a spoon of peanut butter with milk or water and ice.',
  },
  {
    id: 'oatmeal', name: 'Power oats', emoji: '🥣',
    keywords: ['oatmeal', 'oats', 'porridge', 'breakfast bowl'],
    protein: 'greek_yogurt', carb: 'oats', fat: 'almonds',
    veg: [], sauce: 'honey', vegGrams: 0, extra: 'berries',
    method: 'Cook oats, stir in Greek yogurt, top with berries, almonds and a drizzle of honey.',
  },
  {
    id: 'omelette', name: 'Loaded omelette', emoji: '🍳',
    keywords: ['omelette', 'omelet', 'eggs', 'scramble', 'breakfast'],
    protein: 'eggs', carb: 'bread', fat: 'cheese',
    veg: ['spinach', 'peppers', 'onion'], sauce: null, vegGrams: 90,
    method: 'Whisk eggs, fold in sautéed veg and cheese, serve with toast.',
  },
  {
    id: 'curry', name: 'Curry bowl', emoji: '🍛',
    keywords: ['curry', 'indian', 'thai', 'masala', 'tikka'],
    protein: 'chickpeas', carb: 'brown_rice', fat: 'olive_oil',
    veg: ['spinach', 'onion'], sauce: 'curry_sauce', vegGrams: 120,
    method: 'Simmer protein and veg in curry sauce, serve over rice.',
  },
  {
    id: 'sandwich', name: 'Stacked sandwich', emoji: '🥪',
    keywords: ['sandwich', 'sub', 'wrap', 'panini', 'club', 'lunch'],
    protein: 'chicken_breast', carb: 'bread', fat: 'avocado',
    veg: ['lettuce', 'tomato'], sauce: null, vegGrams: 70,
    method: 'Layer protein, avocado and crisp veg between fresh bread.',
  },
  {
    id: 'pizza', name: 'Protein flatbread pizza', emoji: '🍕',
    keywords: ['pizza', 'flatbread', 'margherita', 'pepperoni'],
    protein: 'chicken_breast', carb: 'pizza_dough', fat: 'cheese',
    veg: ['peppers', 'spinach'], sauce: 'tomato_sauce', vegGrams: 80,
    method: 'Top crust with marinara, cheese, lean protein and veg; bake until crisp.',
  },
  {
    id: 'shrimp_rice', name: 'Garlic shrimp & rice', emoji: '🍤',
    keywords: ['shrimp', 'prawn', 'scampi'],
    protein: 'shrimp', carb: 'white_rice', fat: 'olive_oil',
    veg: ['broccoli', 'peppers'], sauce: 'soy_sauce', vegGrams: 140,
    method: 'Sauté shrimp in garlic and oil, serve over rice with steamed veg.',
  },
  {
    id: 'balanced_plate', name: 'Balanced plate', emoji: '🍽️',
    keywords: [],
    protein: 'chicken_breast', carb: 'brown_rice', fat: 'olive_oil',
    veg: ['broccoli', 'peppers'], sauce: null, vegGrams: 150,
    method: 'A classic balanced plate: lean protein, smart carbs, veg and a little healthy fat.',
  },
]

// Plant-based substitutions for the animal proteins / dairy.
const VEGAN_SWAP = {
  chicken_breast: 'tofu', ground_turkey: 'tempeh', lean_beef: 'black_beans',
  steak: 'tempeh', salmon: 'tofu', white_fish: 'tofu', shrimp: 'chickpeas',
  eggs: 'tofu', egg_whites: 'tofu', greek_yogurt: 'tofu', whey: 'whey',
  cheese: 'avocado', feta: 'avocado', parmesan: 'almonds',
}
const VEGETARIAN_SWAP = {
  chicken_breast: 'tofu', ground_turkey: 'lentils', lean_beef: 'black_beans',
  steak: 'tempeh', salmon: 'eggs', white_fish: 'eggs', shrimp: 'chickpeas',
}

export function matchTemplate(query) {
  const q = (query || '').toLowerCase()
  if (!q.trim()) return TEMPLATES.find((t) => t.id === 'balanced_plate')
  let best = null
  let bestScore = 0
  for (const t of TEMPLATES) {
    let score = 0
    for (const k of t.keywords) {
      if (q.includes(k)) score += k.split(' ').length * 2
    }
    // also match the canonical name words
    for (const w of t.name.toLowerCase().split(' ')) {
      if (w.length > 3 && q.includes(w)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = t
    }
  }
  return best || TEMPLATES.find((t) => t.id === 'balanced_plate')
}

function applyPref(template, pref) {
  if (pref !== 'vegan' && pref !== 'vegetarian') return template
  const swap = pref === 'vegan' ? VEGAN_SWAP : VEGETARIAN_SWAP
  const clone = { ...template }
  if (swap[clone.protein]) clone.protein = swap[clone.protein]
  if (pref === 'vegan') {
    if (swap[clone.fat]) clone.fat = swap[clone.fat]
    if (clone.sauce && swap[clone.sauce]) clone.sauce = swap[clone.sauce]
  }
  return clone
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
const snap = (g) => Math.max(5, Math.round(g / 5) * 5)

function sumMacros(items) {
  return items.reduce(
    (a, it) => ({
      kcal: a.kcal + it.kcal,
      p: a.p + it.p,
      c: a.c + it.c,
      f: a.f + it.f,
    }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  )
}

function lineFor(id, grams) {
  const f = food(id)
  const k = grams / 100
  return {
    id,
    name: f.name,
    role: f.role,
    grams,
    kcal: Math.round(f.kcal * k),
    p: Math.round(f.p * k * 10) / 10,
    c: Math.round(f.c * k * 10) / 10,
    f: Math.round(f.f * k * 10) / 10,
    household: household(id, grams),
  }
}

// Friendly household measure per role.
function household(id, grams) {
  const role = food(id).role
  if (role === 'fat' && food(id).f >= 80) {
    const tbsp = grams / 14
    return tbsp < 1 ? `${Math.round(grams / 5)} tsp` : `${Math.round(tbsp)} tbsp`
  }
  if (role === 'protein') return `~${Math.round(grams / 28)} oz`
  if (role === 'carb') return `~${(grams / 150).toFixed(1)} cup`
  if (role === 'veg') return `~${Math.max(1, Math.round(grams / 90))} fist`
  if (role === 'sauce') return `${Math.round(grams / 15)} tbsp`
  return `${grams} g`
}

// Core solver: size the dish to a per-meal macro target.
export function generateMeal(craving, target, pref = 'none') {
  const base = applyPref(matchTemplate(craving), pref)
  const tP = target.protein
  const tC = target.carbs
  const tF = target.fat

  // 1) Fixed veg (generous, near-free) and optional small extra fruit.
  const items = []
  const vegIds = base.veg && base.veg.length ? base.veg : []
  if (vegIds.length) {
    const each = Math.round(base.vegGrams / vegIds.length)
    vegIds.forEach((v) => items.push(lineFor(v, snap(each))))
  }
  if (base.extra) items.push(lineFor(base.extra, 60))

  // 2) Protein source sized to hit protein target.
  const pf = food(base.protein)
  let pGrams = clamp((tP / (pf.p || 1)) * 100, 40, 400)
  // account for protein already supplied by veg/extra
  const preP = sumMacros(items).p
  pGrams = clamp(((tP - preP) / (pf.p || 1)) * 100, 30, 450)
  items.push(lineFor(base.protein, snap(pGrams)))

  // 3) Carb source sized to fill the carb target (minus carbs already present).
  const cf = food(base.carb)
  const preC = sumMacros(items).c
  let cGrams = clamp(((tC - preC) / (cf.c || 1)) * 100, 20, 450)
  items.push(lineFor(base.carb, snap(cGrams)))

  // 4) Sauce — modest fixed amount for flavor.
  if (base.sauce) items.push(lineFor(base.sauce, 20))

  // 5) Fat source — top up to the fat target if we're short.
  if (base.fat) {
    const cur = sumMacros(items)
    const needFat = tF - cur.f
    const ff = food(base.fat)
    if (needFat > 2 && ff.f > 0) {
      const fGrams = clamp((needFat / ff.f) * 100, 5, 80)
      items.push(lineFor(base.fat, snap(fGrams)))
    }
  }

  // 6) Calorie correction — nudge the carb portion so total kcal lands close.
  let total = sumMacros(items)
  const targetK = target.calories
  if (targetK && Math.abs(total.kcal - targetK) > targetK * 0.1) {
    const carbLine = items.find((it) => it.id === base.carb)
    if (carbLine) {
      const overBy = total.kcal - targetK
      const cfKcalPerG = food(base.carb).kcal / 100
      let delta = -overBy / cfKcalPerG
      const newGrams = clamp(carbLine.grams + delta, 20, 500)
      const idx = items.indexOf(carbLine)
      items[idx] = lineFor(base.carb, snap(newGrams))
      total = sumMacros(items)
    }
  }

  // Order: protein, carb, fat/dairy, veg, sauce, fruit
  const order = { protein: 0, carb: 1, fat: 2, dairy: 2, veg: 3, fruit: 4, sauce: 5 }
  items.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9))

  total = sumMacros(items)
  return {
    template: base,
    title: base.name,
    emoji: base.emoji,
    method: base.method,
    items,
    totals: {
      kcal: Math.round(total.kcal),
      protein: Math.round(total.p),
      carbs: Math.round(total.c),
      fat: Math.round(total.f),
    },
    target,
    fit: fitScore(total, target),
  }
}

// How well the result matches the target (0–100).
function fitScore(total, target) {
  const parts = [
    [total.p, target.protein],
    [total.c, target.carbs],
    [total.f, target.fat],
    [total.kcal, target.calories],
  ]
  let err = 0
  let n = 0
  for (const [a, b] of parts) {
    if (!b) continue
    err += Math.abs(a - b) / b
    n++
  }
  const score = Math.max(0, 100 - (err / Math.max(1, n)) * 100)
  return Math.round(score)
}

export const TEMPLATE_LIST = TEMPLATES.filter((t) => t.id !== 'balanced_plate')
