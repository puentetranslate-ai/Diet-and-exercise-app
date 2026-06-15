// Meal engine: take a craving ("I want pizza") + a per-meal macro target, and
// build several goal-appropriate versions of that dish — each a real recipe
// whose portions fit the target, framed as a lighter/smarter take on the
// indulgent original. Fully deterministic & offline — no API key required.

import { FOODS, food } from './foods.js'

// Dish templates. Each names a default composition plus `alts` (alternative
// foods per role) used to build distinct options, a `classicKcal` reference for
// the typical indulgent restaurant portion, and `lightSwaps` coaching notes.
const TEMPLATES = [
  {
    id: 'burrito_bowl', name: 'Burrito bowl', emoji: '🌯',
    keywords: ['burrito', 'bowl', 'mexican', 'chipotle', 'taco', 'fajita', 'tex mex', 'carnitas'],
    protein: 'chicken_breast', carb: 'jasmine_rice', fat: 'avocado',
    veg: ['peppers', 'onion'], sauce: 'salsa', vegGrams: 120, classicKcal: 1050,
    alts: { protein: ['chicken_breast', 'shrimp', 'lean_beef'], carb: ['jasmine_rice', 'brown_rice', 'black_beans'], fat: ['avocado', 'cheese', 'olive_oil'] },
    lightSwaps: ['Brown rice + extra black beans for fiber', 'Half the rice, double the fajita veg', 'A few slices of avocado instead of a big scoop', 'Salsa & pico instead of creamy sauces'],
    method: 'Build a bowl with rice & beans, seared protein, fajita veg, then a little avocado and plenty of salsa.',
  },
  {
    id: 'pasta', name: 'Pasta', emoji: '🍝',
    keywords: ['pasta', 'spaghetti', 'noodles italian', 'bolognese', 'marinara', 'italian', 'penne', 'alfredo'],
    protein: 'ground_turkey', carb: 'pasta', fat: 'parmesan',
    veg: ['spinach', 'tomato'], sauce: 'tomato_sauce', vegGrams: 100, classicKcal: 1000,
    alts: { protein: ['chicken_breast', 'ground_turkey', 'lean_beef'], carb: ['pasta', 'quinoa'], fat: ['parmesan', 'olive_oil', 'feta'] },
    lightSwaps: ['Stir in zucchini ribbons to stretch the pasta', 'Lean turkey instead of fatty beef', 'Marinara (not cream/alfredo) base', 'Finish with a little parmesan — big flavor, less fat'],
    method: 'Brown the protein, simmer in marinara with greens, toss with pasta and a little parmesan.',
  },
  {
    id: 'burger', name: 'Burger plate', emoji: '🍔',
    keywords: ['burger', 'cheeseburger', 'patty', 'smash', 'hamburger'],
    protein: 'lean_beef', carb: 'bun', fat: 'cheese',
    veg: ['lettuce', 'tomato', 'onion'], sauce: 'salsa', vegGrams: 90, classicKcal: 1100,
    alts: { protein: ['chicken_breast', 'ground_turkey', 'lean_beef'], carb: ['bun', 'sweet_potato'], fat: ['avocado', 'cheese'] },
    lightSwaps: ['Single lean patty (93/7 beef or turkey)', 'Lettuce-wrap or a thin/half bun', 'Mustard, salsa or pickles instead of mayo', 'Pile on lettuce, tomato & onion'],
    method: 'Sear a lean patty hard, stack on a bun (or lettuce wrap) with crisp veg and a smart sauce.',
  },
  {
    id: 'stir_fry', name: 'Stir-fry', emoji: '🥢',
    keywords: ['stir fry', 'stir-fry', 'asian', 'wok', 'teriyaki', 'chinese', 'fried rice', 'pad thai', 'lo mein'],
    protein: 'chicken_breast', carb: 'jasmine_rice', fat: 'olive_oil',
    veg: ['mixed_veg', 'peppers'], sauce: 'soy_sauce', vegGrams: 160, classicKcal: 900,
    alts: { protein: ['chicken_breast', 'shrimp', 'tofu'], carb: ['jasmine_rice', 'brown_rice', 'noodles'], fat: ['olive_oil', 'almonds'] },
    lightSwaps: ['Steam, don\'t deep-fry — light oil in a hot wok', 'Load it with veg (broccoli, peppers, snap peas)', 'Light soy/teriyaki, go easy on sweet sauces', 'Brown rice or extra veg in place of half the rice'],
    method: 'Sear protein in a hot wok with a touch of oil, pile in veg, finish with rice and a splash of light soy/teriyaki.',
  },
  {
    id: 'salmon_plate', name: 'Salmon & potatoes', emoji: '🐟',
    keywords: ['salmon', 'fish', 'seafood plate', 'cod'],
    protein: 'salmon', carb: 'sweet_potato', fat: 'olive_oil',
    veg: ['broccoli'], sauce: null, vegGrams: 160, classicKcal: 750,
    alts: { protein: ['white_fish', 'salmon', 'shrimp'], carb: ['sweet_potato', 'quinoa', 'potato'], fat: ['olive_oil', 'avocado'] },
    lightSwaps: ['White fish (cod/tilapia) for fewer calories than salmon', 'Roast the potatoes with a light spritz of oil', 'Double the greens', 'Lemon & herbs instead of butter sauces'],
    method: 'Roast the fish and potato, steam the broccoli, finish with lemon and a light drizzle of olive oil.',
  },
  {
    id: 'taco', name: 'Tacos', emoji: '🌮',
    keywords: ['taco', 'tacos', 'street taco', 'carne', 'al pastor'],
    protein: 'lean_beef', carb: 'tortilla', fat: 'avocado',
    veg: ['onion', 'tomato'], sauce: 'salsa', vegGrams: 80, classicKcal: 900,
    alts: { protein: ['chicken_breast', 'lean_beef', 'shrimp'], carb: ['tortilla', 'black_beans'], fat: ['avocado', 'cheese'] },
    lightSwaps: ['Soft corn-style / smaller tortillas', 'Grilled chicken or shrimp instead of fatty carnitas', 'Salsa & cilantro-onion instead of cheese & sour cream', 'A little avocado for richness'],
    method: 'Season and sear the protein, warm small tortillas, top with onion, salsa and a little avocado.',
  },
  {
    id: 'salad', name: 'Power salad', emoji: '🥗',
    keywords: ['salad', 'greens', 'caesar', 'light', 'healthy bowl', 'cobb'],
    protein: 'chicken_breast', carb: 'quinoa', fat: 'feta',
    veg: ['lettuce', 'cucumber', 'tomato'], sauce: 'olive_oil', vegGrams: 170, classicKcal: 750,
    alts: { protein: ['chicken_breast', 'shrimp', 'chickpeas'], carb: ['quinoa', 'sweet_potato'], fat: ['feta', 'avocado', 'almonds'] },
    lightSwaps: ['Vinaigrette on the side (not creamy Caesar/ranch)', 'A sprinkle of feta or nuts, not a handful', 'Grilled protein for staying power', 'Pile on the crunchy veg'],
    method: 'Toss big greens with quinoa, sliced protein, a little feta and an olive-oil vinaigrette.',
  },
  {
    id: 'smoothie', name: 'Protein smoothie', emoji: '🥤',
    keywords: ['smoothie', 'shake', 'protein shake', 'drink', 'blend', 'frappe'],
    protein: 'whey', carb: 'banana', fat: 'peanut_butter',
    veg: ['spinach'], sauce: null, vegGrams: 30, extra: 'berries', classicKcal: 600,
    alts: { protein: ['whey', 'greek_yogurt'], carb: ['banana', 'berries', 'oats'], fat: ['peanut_butter', 'almonds'] },
    lightSwaps: ['Water or unsweetened milk instead of juice', 'Whole fruit instead of sweetened purees/syrups', 'A teaspoon of nut butter, not a glob', 'Handful of spinach you won\'t even taste'],
    method: 'Blend protein, fruit and a little nut butter with spinach, water/milk and ice.',
  },
  {
    id: 'oatmeal', name: 'Power oats', emoji: '🥣',
    keywords: ['oatmeal', 'oats', 'porridge', 'breakfast bowl'],
    protein: 'greek_yogurt', carb: 'oats', fat: 'almonds',
    veg: [], sauce: 'honey', vegGrams: 0, extra: 'berries', classicKcal: 550,
    alts: { protein: ['greek_yogurt', 'whey', 'egg_whites'], carb: ['oats', 'banana'], fat: ['almonds', 'peanut_butter'] },
    lightSwaps: ['Stir in Greek yogurt or a scoop of protein', 'Top with berries instead of brown sugar', 'A few almonds, not a heaping scoop', 'A small drizzle of honey for sweetness'],
    method: 'Cook oats, stir in Greek yogurt or protein, top with berries, a few nuts and a little honey.',
  },
  {
    id: 'omelette', name: 'Loaded omelette', emoji: '🍳',
    keywords: ['omelette', 'omelet', 'eggs', 'scramble', 'breakfast', 'frittata'],
    protein: 'eggs', carb: 'bread', fat: 'cheese',
    veg: ['spinach', 'peppers', 'onion'], sauce: null, vegGrams: 100, classicKcal: 700,
    alts: { protein: ['egg_whites', 'eggs', 'greek_yogurt'], carb: ['bread', 'potato'], fat: ['cheese', 'avocado'] },
    lightSwaps: ['Mix whole eggs with extra egg whites', 'Load with veggies for volume', 'A little cheese or avocado, not both heaped', 'One slice of whole-grain toast'],
    method: 'Whisk eggs (plus whites), fold in sautéed veg and a little cheese, serve with toast.',
  },
  {
    id: 'curry', name: 'Curry bowl', emoji: '🍛',
    keywords: ['curry', 'indian', 'thai', 'masala', 'tikka', 'korma'],
    protein: 'chicken_breast', carb: 'brown_rice', fat: 'olive_oil',
    veg: ['spinach', 'onion'], sauce: 'curry_sauce', vegGrams: 130, classicKcal: 950,
    alts: { protein: ['chicken_breast', 'chickpeas', 'shrimp'], carb: ['brown_rice', 'jasmine_rice', 'lentils'], fat: ['olive_oil', 'almonds'] },
    lightSwaps: ['Tomato/yogurt-based curry instead of heavy coconut-cream', 'Lean chicken or chickpeas', 'Bulk it with spinach & onion', 'Right-size the rice, scoop extra sauce & veg'],
    method: 'Simmer protein and veg in a lighter curry sauce, serve over rice.',
  },
  {
    id: 'sandwich', name: 'Stacked sandwich', emoji: '🥪',
    keywords: ['sandwich', 'sub', 'wrap', 'panini', 'club', 'lunch', 'deli'],
    protein: 'chicken_breast', carb: 'bread', fat: 'avocado',
    veg: ['lettuce', 'tomato'], sauce: null, vegGrams: 80, classicKcal: 800,
    alts: { protein: ['chicken_breast', 'eggs', 'tofu'], carb: ['bread', 'tortilla'], fat: ['avocado', 'cheese'] },
    lightSwaps: ['Lean deli protein, piled high', 'Avocado or mustard instead of mayo', 'Whole-grain bread or a wrap', 'Stack on the veggies'],
    method: 'Layer lean protein, a little avocado and crisp veg between fresh whole-grain bread.',
  },
  {
    id: 'pizza', name: 'Pizza', emoji: '🍕',
    keywords: ['pizza', 'flatbread', 'margherita', 'pepperoni', 'pie', 'slice'],
    protein: 'chicken_breast', carb: 'pizza_dough', fat: 'cheese',
    veg: ['peppers', 'spinach'], sauce: 'tomato_sauce', vegGrams: 90, classicKcal: 1150,
    alts: { protein: ['chicken_breast', 'ground_turkey', 'tofu'], carb: ['pizza_dough', 'bread'], fat: ['cheese', 'feta'] },
    lightSwaps: ['Thin-crust or cauliflower crust', 'A lighter layer of part-skim mozzarella', 'Grilled chicken instead of pepperoni/sausage', 'Half the cheese, double the veggies'],
    method: 'Top a thin crust with marinara, a light layer of cheese, lean protein and lots of veg; bake until crisp.',
  },
  {
    id: 'shrimp_rice', name: 'Garlic shrimp & rice', emoji: '🍤',
    keywords: ['shrimp', 'prawn', 'scampi'],
    protein: 'shrimp', carb: 'white_rice', fat: 'olive_oil',
    veg: ['broccoli', 'peppers'], sauce: 'soy_sauce', vegGrams: 150, classicKcal: 800,
    alts: { protein: ['shrimp', 'white_fish', 'chicken_breast'], carb: ['white_rice', 'brown_rice'], fat: ['olive_oil', 'avocado'] },
    lightSwaps: ['Sauté in a little oil, not butter', 'Load the plate with steamed veg', 'Right-size the rice (or go cauliflower rice)', 'Garlic, lemon & chili for big flavor'],
    method: 'Sauté shrimp in garlic and a little oil, serve over rice with steamed veg.',
  },
  {
    id: 'balanced_plate', name: 'Balanced plate', emoji: '🍽️',
    keywords: [],
    protein: 'chicken_breast', carb: 'brown_rice', fat: 'olive_oil',
    veg: ['broccoli', 'peppers'], sauce: null, vegGrams: 150, classicKcal: 800,
    alts: { protein: ['chicken_breast', 'white_fish', 'lean_beef'], carb: ['brown_rice', 'sweet_potato', 'quinoa'], fat: ['olive_oil', 'avocado'] },
    lightSwaps: ['Lean protein the size of your palm', 'Smart carbs the size of a cupped hand', 'Half the plate veggies', 'A thumb of healthy fat'],
    method: 'A classic balanced plate: lean protein, smart carbs, half-plate veg and a little healthy fat.',
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

function swapId(id, pref) {
  if (pref === 'vegan') return VEGAN_SWAP[id] || id
  if (pref === 'vegetarian') return VEGETARIAN_SWAP[id] || id
  return id
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
const snap = (g) => Math.max(5, Math.round(g / 5) * 5)
const kcalOf = (id) => (food(id) ? food(id).kcal : 0)
const leanestOf = (ids) => [...ids].sort((a, b) => kcalOf(a) - kcalOf(b))[0]
const densestOf = (ids) => [...ids].sort((a, b) => kcalOf(b) - kcalOf(a))[0]
// "Leanest protein" = most protein per calorie (not just fewest calories), so a
// meat-eater's lighter option is grilled chicken/shrimp — not tofu.
const ratio = (id) => (food(id) ? food(id).p / Math.max(1, food(id).kcal) : 0)
const leanestProtein = (ids) => [...ids].sort((a, b) => ratio(b) - ratio(a))[0]

function sumMacros(items) {
  return items.reduce(
    (a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, c: a.c + it.c, f: a.f + it.f }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  )
}

function lineFor(id, grams) {
  const f = food(id)
  const k = grams / 100
  return {
    id, name: f.name, role: f.role, grams,
    kcal: Math.round(f.kcal * k),
    p: Math.round(f.p * k * 10) / 10,
    c: Math.round(f.c * k * 10) / 10,
    f: Math.round(f.f * k * 10) / 10,
    household: household(id, grams),
  }
}

function household(id, grams) {
  const role = food(id).role
  if (role === 'fat' && food(id).f >= 80) {
    const tbsp = grams / 14
    return tbsp < 1 ? `${Math.max(1, Math.round(grams / 5))} tsp` : `${Math.round(tbsp)} tbsp`
  }
  if (role === 'protein') return `~${Math.round(grams / 28)} oz`
  if (role === 'carb') return `~${(grams / 150).toFixed(1)} cup`
  if (role === 'veg') return `~${Math.max(1, Math.round(grams / 90))} fist`
  if (role === 'sauce') return `${Math.max(1, Math.round(grams / 15))} tbsp`
  return `${grams} g`
}

// Solve one explicit composition to a per-meal macro target.
function solveComposition(comp, target, pref) {
  const tP = target.protein
  const tC = target.carbs
  const tF = target.fat

  const items = []
  const proteinId = swapId(comp.protein, pref)
  const carbId = swapId(comp.carb, pref)
  const fatId = comp.fat ? swapId(comp.fat, pref) : null

  // Veg first (generous, near-free) + optional fruit extra.
  const vegIds = comp.veg && comp.veg.length ? comp.veg : []
  if (vegIds.length) {
    const each = Math.round(comp.vegGrams / vegIds.length)
    vegIds.forEach((v) => items.push(lineFor(v, snap(each))))
  }
  if (comp.extra) items.push(lineFor(comp.extra, 60))

  // Protein to hit protein target (minus what veg/extra already provide).
  const pf = food(proteinId)
  const preP = sumMacros(items).p
  const pGrams = clamp(((tP - preP) / (pf.p || 1)) * 100, 30, 450)
  items.push(lineFor(proteinId, snap(pGrams)))

  // Carb to fill the carb target.
  const cf = food(carbId)
  const preC = sumMacros(items).c
  const cGrams = clamp(((tC - preC) / (cf.c || 1)) * 100, 20, 450)
  items.push(lineFor(carbId, snap(cGrams)))

  // Modest sauce for flavor.
  if (comp.sauce) items.push(lineFor(swapId(comp.sauce, pref), 20))

  // Top up fat if short of target.
  if (fatId) {
    const cur = sumMacros(items)
    const ff = food(fatId)
    const needFat = tF - cur.f
    if (needFat > 2 && ff.f > 0) {
      const fGrams = clamp((needFat / ff.f) * 100, 5, 80)
      items.push(lineFor(fatId, snap(fGrams)))
    }
  }

  // Calorie correction — nudge the carb portion so kcal lands close.
  let total = sumMacros(items)
  if (target.calories && Math.abs(total.kcal - target.calories) > target.calories * 0.1) {
    const carbLine = items.find((it) => it.id === carbId)
    if (carbLine) {
      const overBy = total.kcal - target.calories
      const perG = food(carbId).kcal / 100
      const newGrams = clamp(carbLine.grams - overBy / perG, 20, 500)
      items[items.indexOf(carbLine)] = lineFor(carbId, snap(newGrams))
    }
  }

  const order = { protein: 0, carb: 1, fat: 2, dairy: 2, veg: 3, fruit: 4, sauce: 5 }
  items.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9))
  total = sumMacros(items)

  return {
    items,
    totals: {
      kcal: Math.round(total.kcal),
      protein: Math.round(total.p),
      carbs: Math.round(total.c),
      fat: Math.round(total.f),
    },
    fit: fitScore(total, target),
  }
}

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
  return Math.round(Math.max(0, 100 - (err / Math.max(1, n)) * 100))
}

// Build the list of option "styles" for a template, ordered by goal.
function styleSpecs(t, goal) {
  const a = t.alts || { protein: [t.protein], carb: [t.carb], fat: [t.fat] }
  const lean = {
    key: 'lean',
    label: goal === 'gain' ? 'Lean & clean' : 'Lighter version',
    note: 'Leaner protein and lower-calorie swaps with more volume.',
    protein: leanestProtein(a.protein),
    carb: leanestOf(a.carb),
    fat: leanestOf(a.fat),
    vegMult: 1.4,
    swaps: t.lightSwaps,
  }
  const highP = {
    key: 'protein',
    label: 'High-protein',
    note: 'Maximum protein to stay full and protect muscle.',
    protein: leanestProtein(a.protein),
    carb: a.carb[0],
    fat: leanestOf(a.fat),
    vegMult: 1.1,
    swaps: ['Extra lean protein', ...t.lightSwaps.slice(0, 2)],
  }
  const hearty = {
    key: 'hearty',
    label: goal === 'gain' ? 'Hearty / bulk' : 'Classic, lightened',
    note: goal === 'gain'
      ? 'Closest to the real thing with energy-dense carbs for your surplus.'
      : 'The real-deal flavors, just portion-controlled to your plan.',
    protein: t.protein,
    carb: goal === 'gain' ? densestOf(a.carb) : t.carb,
    fat: t.fat || leanestOf(a.fat),
    vegMult: 1.0,
    swaps: t.lightSwaps,
  }

  if (goal === 'gain') return [hearty, highP, lean]
  if (goal === 'lose' || goal === 'recomp') return [lean, highP, hearty]
  return [highP, lean, hearty] // maintain
}

// MAIN: return several fitted options for a craving.
export function generateMealOptions(craving, target, profile = {}) {
  const t = matchTemplate(craving)
  const pref = profile.dietPref || 'none'
  const goal = profile.goal || 'maintain'
  const specs = styleSpecs(t, goal)

  const seen = new Set()
  const options = []
  for (const s of specs) {
    const comp = {
      protein: s.protein, carb: s.carb, fat: s.fat,
      veg: t.veg, vegGrams: Math.round((t.vegGrams || 0) * (s.vegMult || 1)),
      sauce: t.sauce, extra: t.extra,
    }
    const solved = solveComposition(comp, target, pref)
    // De-dupe options that come out essentially identical.
    const sig = solved.items.map((i) => i.id + i.grams).join('|')
    if (seen.has(sig)) continue
    seen.add(sig)
    options.push({
      key: s.key,
      label: s.label,
      note: s.note,
      swaps: s.swaps,
      method: t.method,
      ...solved,
      saved: Math.max(0, (t.classicKcal || 0) - solved.totals.kcal),
    })
  }

  return {
    template: t,
    title: t.name,
    emoji: t.emoji,
    classicKcal: t.classicKcal || 0,
    target,
    options,
  }
}

// Backwards-compatible single-result helper.
export function generateMeal(craving, target, pref = 'none') {
  const res = generateMealOptions(craving, target, { dietPref: pref })
  const top = res.options[0]
  return {
    template: res.template, title: res.title, emoji: res.emoji, method: top.method,
    items: top.items, totals: top.totals, target, fit: top.fit,
  }
}

export const TEMPLATE_LIST = TEMPLATES.filter((t) => t.id !== 'balanced_plate')
