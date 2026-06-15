// A compact whole-foods database. Macros are per 100g (cooked/edible portion).
// role: protein | carb | fat | veg | fruit | dairy | sauce | extra
// unit: how we describe a serving in the UI.

export const FOODS = {
  // ---- Proteins ----
  chicken_breast: { name: 'Grilled chicken breast', role: 'protein', kcal: 165, p: 31, c: 0, f: 3.6, tags: ['chicken', 'poultry', 'lean'] },
  ground_turkey: { name: 'Lean ground turkey', role: 'protein', kcal: 150, p: 27, c: 0, f: 4, tags: ['turkey', 'ground', 'lean'] },
  lean_beef: { name: '93% lean ground beef', role: 'protein', kcal: 172, p: 26, c: 0, f: 7, tags: ['beef', 'burger', 'red meat'] },
  steak: { name: 'Sirloin steak', role: 'protein', kcal: 206, p: 27, c: 0, f: 10, tags: ['beef', 'steak', 'red meat'] },
  salmon: { name: 'Baked salmon', role: 'protein', kcal: 208, p: 22, c: 0, f: 13, tags: ['fish', 'salmon', 'omega'] },
  white_fish: { name: 'White fish (cod/tilapia)', role: 'protein', kcal: 105, p: 23, c: 0, f: 1.5, tags: ['fish', 'cod', 'lean'] },
  shrimp: { name: 'Shrimp', role: 'protein', kcal: 99, p: 24, c: 0.2, f: 0.3, tags: ['shrimp', 'seafood'] },
  eggs: { name: 'Whole eggs', role: 'protein', kcal: 143, p: 13, c: 1.1, f: 9.5, tags: ['egg', 'breakfast'] },
  egg_whites: { name: 'Egg whites', role: 'protein', kcal: 52, p: 11, c: 0.7, f: 0.2, tags: ['egg', 'lean'] },
  tofu: { name: 'Firm tofu', role: 'protein', kcal: 144, p: 17, c: 3, f: 9, tags: ['tofu', 'vegan', 'vegetarian', 'plant'] },
  tempeh: { name: 'Tempeh', role: 'protein', kcal: 192, p: 20, c: 8, f: 11, tags: ['tempeh', 'vegan', 'plant'] },
  greek_yogurt: { name: 'Nonfat Greek yogurt', role: 'protein', kcal: 59, p: 10, c: 3.6, f: 0.4, tags: ['yogurt', 'dairy', 'breakfast'] },
  whey: { name: 'Whey protein', role: 'protein', kcal: 370, p: 80, c: 8, f: 5, tags: ['protein powder', 'shake', 'smoothie'] },
  black_beans: { name: 'Black beans', role: 'protein', kcal: 132, p: 9, c: 24, f: 0.5, tags: ['beans', 'vegan', 'plant', 'fiber'] },
  lentils: { name: 'Lentils', role: 'protein', kcal: 116, p: 9, c: 20, f: 0.4, tags: ['lentil', 'vegan', 'plant', 'curry'] },
  chickpeas: { name: 'Chickpeas', role: 'protein', kcal: 164, p: 9, c: 27, f: 2.6, tags: ['chickpea', 'vegan', 'plant', 'hummus'] },

  // ---- Carbs ----
  white_rice: { name: 'White rice', role: 'carb', kcal: 130, p: 2.7, c: 28, f: 0.3, tags: ['rice', 'grain'] },
  brown_rice: { name: 'Brown rice', role: 'carb', kcal: 123, p: 2.7, c: 26, f: 1, tags: ['rice', 'grain', 'fiber'] },
  jasmine_rice: { name: 'Jasmine rice', role: 'carb', kcal: 130, p: 2.7, c: 28, f: 0.3, tags: ['rice', 'asian', 'stir fry'] },
  pasta: { name: 'Pasta', role: 'carb', kcal: 158, p: 6, c: 31, f: 0.9, tags: ['pasta', 'noodle', 'italian'] },
  potato: { name: 'Roasted potato', role: 'carb', kcal: 93, p: 2, c: 21, f: 0.1, tags: ['potato', 'spud'] },
  sweet_potato: { name: 'Sweet potato', role: 'carb', kcal: 90, p: 2, c: 21, f: 0.1, tags: ['sweet potato', 'yam'] },
  quinoa: { name: 'Quinoa', role: 'carb', kcal: 120, p: 4.4, c: 21, f: 1.9, tags: ['quinoa', 'grain', 'fiber'] },
  oats: { name: 'Oats', role: 'carb', kcal: 150, p: 5, c: 27, f: 2.5, tags: ['oats', 'oatmeal', 'breakfast'] },
  bread: { name: 'Whole-grain bread', role: 'carb', kcal: 247, p: 13, c: 41, f: 4, tags: ['bread', 'toast', 'sandwich'] },
  tortilla: { name: 'Flour tortilla', role: 'carb', kcal: 290, p: 8, c: 49, f: 7, tags: ['tortilla', 'wrap', 'taco', 'burrito'] },
  bun: { name: 'Burger bun', role: 'carb', kcal: 270, p: 9, c: 49, f: 4, tags: ['bun', 'burger'] },
  pizza_dough: { name: 'Pizza crust', role: 'carb', kcal: 270, p: 9, c: 50, f: 3.5, tags: ['pizza', 'dough', 'crust'] },
  noodles: { name: 'Rice noodles', role: 'carb', kcal: 109, p: 2, c: 25, f: 0.2, tags: ['noodle', 'asian', 'pad thai', 'stir fry'] },

  // ---- Veg ----
  broccoli: { name: 'Broccoli', role: 'veg', kcal: 35, p: 2.4, c: 7, f: 0.4, tags: ['broccoli', 'green'] },
  mixed_veg: { name: 'Mixed vegetables', role: 'veg', kcal: 40, p: 2, c: 8, f: 0.3, tags: ['vegetable', 'stir fry'] },
  spinach: { name: 'Spinach', role: 'veg', kcal: 23, p: 2.9, c: 3.6, f: 0.4, tags: ['spinach', 'greens', 'salad'] },
  peppers: { name: 'Bell peppers', role: 'veg', kcal: 31, p: 1, c: 6, f: 0.3, tags: ['pepper', 'fajita', 'stir fry'] },
  lettuce: { name: 'Romaine lettuce', role: 'veg', kcal: 17, p: 1.2, c: 3.3, f: 0.3, tags: ['lettuce', 'salad'] },
  tomato: { name: 'Tomato', role: 'veg', kcal: 18, p: 0.9, c: 3.9, f: 0.2, tags: ['tomato', 'salad'] },
  zucchini: { name: 'Zucchini', role: 'veg', kcal: 17, p: 1.2, c: 3.1, f: 0.3, tags: ['zucchini', 'vegetable'] },
  cucumber: { name: 'Cucumber', role: 'veg', kcal: 15, p: 0.7, c: 3.6, f: 0.1, tags: ['cucumber', 'salad'] },
  onion: { name: 'Onion', role: 'veg', kcal: 40, p: 1.1, c: 9, f: 0.1, tags: ['onion'] },

  // ---- Fats ----
  olive_oil: { name: 'Olive oil', role: 'fat', kcal: 884, p: 0, c: 0, f: 100, tags: ['oil', 'olive'] },
  avocado: { name: 'Avocado', role: 'fat', kcal: 160, p: 2, c: 9, f: 15, tags: ['avocado', 'guac'] },
  almonds: { name: 'Almonds', role: 'fat', kcal: 579, p: 21, c: 22, f: 50, tags: ['almond', 'nuts'] },
  peanut_butter: { name: 'Peanut butter', role: 'fat', kcal: 588, p: 25, c: 20, f: 50, tags: ['peanut butter', 'nut butter'] },
  cheese: { name: 'Cheddar cheese', role: 'dairy', kcal: 403, p: 25, c: 1.3, f: 33, tags: ['cheese', 'dairy'] },
  feta: { name: 'Feta', role: 'dairy', kcal: 264, p: 14, c: 4, f: 21, tags: ['feta', 'cheese', 'greek'] },
  parmesan: { name: 'Parmesan', role: 'dairy', kcal: 431, p: 38, c: 4, f: 29, tags: ['parmesan', 'cheese', 'italian'] },

  // ---- Fruit ----
  banana: { name: 'Banana', role: 'fruit', kcal: 89, p: 1.1, c: 23, f: 0.3, tags: ['banana', 'fruit', 'smoothie'] },
  berries: { name: 'Mixed berries', role: 'fruit', kcal: 57, p: 0.7, c: 14, f: 0.3, tags: ['berry', 'berries', 'fruit', 'smoothie'] },
  apple: { name: 'Apple', role: 'fruit', kcal: 52, p: 0.3, c: 14, f: 0.2, tags: ['apple', 'fruit'] },

  // ---- Sauces / extras ----
  tomato_sauce: { name: 'Marinara sauce', role: 'sauce', kcal: 60, p: 1.6, c: 9, f: 1.8, tags: ['marinara', 'tomato sauce', 'pasta', 'pizza'] },
  salsa: { name: 'Salsa', role: 'sauce', kcal: 36, p: 1.5, c: 7, f: 0.2, tags: ['salsa', 'mexican'] },
  soy_sauce: { name: 'Soy sauce / teriyaki', role: 'sauce', kcal: 80, p: 5, c: 14, f: 0.1, tags: ['soy', 'teriyaki', 'asian', 'stir fry'] },
  curry_sauce: { name: 'Curry sauce', role: 'sauce', kcal: 90, p: 1.5, c: 7, f: 6, tags: ['curry', 'indian', 'thai'] },
  honey: { name: 'Honey', role: 'sauce', kcal: 304, p: 0.3, c: 82, f: 0, tags: ['honey', 'sweet'] },
}

export function food(id) {
  return FOODS[id]
}

// Search foods by free text (for manual logging).
export function searchFoods(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return Object.entries(FOODS)
    .filter(([, f]) => f.name.toLowerCase().includes(q) || f.tags.some((t) => t.includes(q)))
    .slice(0, 8)
    .map(([id, f]) => ({ id, ...f }))
}

export function macrosFor(id, grams) {
  const f = FOODS[id]
  if (!f) return { kcal: 0, p: 0, c: 0, f: 0 }
  const k = grams / 100
  return {
    kcal: Math.round(f.kcal * k),
    p: Math.round(f.p * k),
    c: Math.round(f.c * k),
    f: Math.round(f.f * k),
  }
}
