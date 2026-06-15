// Nutrition math: BMR, TDEE, calorie targets and macro splits.
// Uses the Mifflin–St Jeor equation, which is the modern clinical standard.

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', hint: 'Desk job, little exercise', factor: 1.2 },
  { id: 'light', label: 'Lightly active', hint: 'Light exercise 1–3 days/wk', factor: 1.375 },
  { id: 'moderate', label: 'Moderately active', hint: 'Exercise 3–5 days/wk', factor: 1.55 },
  { id: 'active', label: 'Very active', hint: 'Hard exercise 6–7 days/wk', factor: 1.725 },
  { id: 'athlete', label: 'Athlete', hint: 'Physical job or 2x/day training', factor: 1.9 },
]

export const GOALS = [
  {
    id: 'lose',
    label: 'Lose fat',
    hint: 'Lean down while keeping muscle',
    calorieDelta: -0.2, // % of TDEE
    proteinPerLb: 1.0,
    fatPerLb: 0.4,
  },
  {
    id: 'maintain',
    label: 'Maintain',
    hint: 'Stay where you are, get healthier',
    calorieDelta: 0,
    proteinPerLb: 0.8,
    fatPerLb: 0.4,
  },
  {
    id: 'gain',
    label: 'Build muscle',
    hint: 'Lean bulk and get stronger',
    calorieDelta: 0.12,
    proteinPerLb: 0.9,
    fatPerLb: 0.35,
  },
  {
    id: 'recomp',
    label: 'Recomposition',
    hint: 'Lose fat & add muscle at maintenance',
    calorieDelta: -0.05,
    proteinPerLb: 1.1,
    fatPerLb: 0.4,
  },
]

export const PACE = {
  relaxed: 0.6,
  standard: 1.0,
  aggressive: 1.4,
}

// Unit helpers ------------------------------------------------------------
export const lbToKg = (lb) => lb * 0.453592
export const kgToLb = (kg) => kg / 0.453592
export const inToCm = (inch) => inch * 2.54
export const ftInToIn = (ft, inch) => ft * 12 + inch

export function calcBMR({ sex, weightLb, heightIn, age }) {
  const kg = lbToKg(weightLb)
  const cm = inToCm(heightIn)
  const base = 10 * kg + 6.25 * cm - 5 * age
  return Math.round(sex === 'female' ? base - 161 : base + 5)
}

export function getActivityFactor(id) {
  return (ACTIVITY_LEVELS.find((a) => a.id === id) || ACTIVITY_LEVELS[2]).factor
}

export function getGoal(id) {
  return GOALS.find((g) => g.id === id) || GOALS[1]
}

// Full target plan from a profile -----------------------------------------
export function buildPlan(profile) {
  const {
    sex = 'male',
    weightLb = 170,
    heightIn = 70,
    age = 30,
    activity = 'moderate',
    goal = 'maintain',
    pace = 'standard',
  } = profile || {}

  const bmr = calcBMR({ sex, weightLb, heightIn, age })
  const factor = getActivityFactor(activity)
  const tdee = Math.round(bmr * factor)

  const g = getGoal(goal)
  const paceMult = PACE[pace] ?? 1
  const calories = Math.max(1200, Math.round(tdee * (1 + g.calorieDelta * paceMult)))

  // Macros — protein & fat anchored to bodyweight, carbs fill the rest.
  const protein = Math.round(g.proteinPerLb * weightLb)
  let fat = Math.round(g.fatPerLb * weightLb)

  const proteinCals = protein * 4
  let fatCals = fat * 9
  let carbCals = calories - proteinCals - fatCals

  // Guard: if carbs would go negative, trim fat down to a 20% floor.
  if (carbCals < 0) {
    fatCals = Math.max(calories * 0.2, calories - proteinCals)
    fat = Math.round(fatCals / 9)
    carbCals = Math.max(0, calories - proteinCals - fatCals)
  }
  const carbs = Math.round(carbCals / 4)

  return {
    bmr,
    tdee,
    calories,
    protein,
    carbs,
    fat,
    macroCals: {
      protein: protein * 4,
      carbs: carbs * 4,
      fat: fat * 9,
    },
    fiberTarget: Math.round((calories / 1000) * 14), // 14g per 1000 kcal
    waterOz: Math.round(weightLb * 0.5), // ~half bodyweight in oz
  }
}

// Per-meal distribution of the daily macro budget -------------------------
export const MEAL_SPLITS = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
}

export function macrosForMeal(plan, mealType) {
  const split = MEAL_SPLITS[mealType] ?? 0.3
  return {
    calories: Math.round(plan.calories * split),
    protein: Math.round(plan.protein * split),
    carbs: Math.round(plan.carbs * split),
    fat: Math.round(plan.fat * split),
  }
}

// Hand-portion coaching translated from the daily plan --------------------
export function portionGuide(plan) {
  const proteinPalms = Math.max(1, Math.round(plan.protein / 25)) // ~25g protein per palm
  const carbCups = Math.max(1, Math.round(plan.carbs / 30)) // ~30g carbs per cupped hand
  const fatThumbs = Math.max(1, Math.round(plan.fat / 12)) // ~12g fat per thumb
  return [
    {
      icon: '✋',
      title: `${proteinPalms} palm${proteinPalms > 1 ? 's' : ''} of protein`,
      detail: 'chicken, fish, lean beef, tofu or eggs — spread across the day',
      color: 'protein',
    },
    {
      icon: '🤲',
      title: `${carbCups} cupped hand${carbCups > 1 ? 's' : ''} of carbs`,
      detail: 'rice, oats, potatoes, pasta or fruit',
      color: 'carbs',
    },
    {
      icon: '👍',
      title: `${fatThumbs} thumb${fatThumbs > 1 ? 's' : ''} of fats`,
      detail: 'oils, nuts, avocado, cheese or nut butter',
      color: 'fat',
    },
    {
      icon: '🥦',
      title: '2+ fists of veggies',
      detail: 'fill the rest of the plate with colorful vegetables',
      color: 'leaf',
    },
  ]
}

export const round = (n, d = 0) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}
