import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayKey } from '../lib/date.js'
import { buildPlan } from '../lib/nutrition.js'

const DEFAULT_PROFILE = {
  name: '',
  sex: 'male',
  age: 30,
  heightIn: 70,
  weightLb: 175,
  activity: 'moderate',
  goal: 'lose',
  pace: 'standard',
  dietPref: 'none', // none | vegetarian | vegan
  // training
  equipment: 'gym', // gym | home | bodyweight
  experience: 'intermediate', // beginner | intermediate | advanced
  daysPerWeek: 4,
}

function emptyDay() {
  return { meals: [], workouts: [], waterOz: 0 }
}

export const useStore = create(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: DEFAULT_PROFILE,
      logs: {}, // { dateKey: { meals, workouts, waterOz } }
      weights: [], // [{ date, lb }]
      savedPlan: null, // workout plan

      // ---- Profile / onboarding ----
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      completeOnboarding: () =>
        set((s) => {
          const w = s.profile.weightLb
          const weights = s.weights.length ? s.weights : [{ date: todayKey(), lb: w }]
          return { onboarded: true, weights }
        }),
      reset: () => set({ onboarded: false, profile: DEFAULT_PROFILE, logs: {}, weights: [], savedPlan: null }),

      // ---- Derived plan ----
      plan: () => buildPlan(get().profile),

      // ---- Daily log helpers ----
      dayLog: (key = todayKey()) => get().logs[key] || emptyDay(),

      addMeal: (meal, key = todayKey()) =>
        set((s) => {
          const day = s.logs[key] || emptyDay()
          const entry = { id: crypto.randomUUID(), at: Date.now(), ...meal }
          return { logs: { ...s.logs, [key]: { ...day, meals: [...day.meals, entry] } } }
        }),

      removeMeal: (id, key = todayKey()) =>
        set((s) => {
          const day = s.logs[key] || emptyDay()
          return { logs: { ...s.logs, [key]: { ...day, meals: day.meals.filter((m) => m.id !== id) } } }
        }),

      addWater: (oz, key = todayKey()) =>
        set((s) => {
          const day = s.logs[key] || emptyDay()
          return { logs: { ...s.logs, [key]: { ...day, waterOz: Math.max(0, day.waterOz + oz) } } }
        }),

      logWorkout: (session, key = todayKey()) =>
        set((s) => {
          const day = s.logs[key] || emptyDay()
          const entry = { id: crypto.randomUUID(), at: Date.now(), ...session }
          return { logs: { ...s.logs, [key]: { ...day, workouts: [...day.workouts, entry] } } }
        }),

      removeWorkout: (id, key = todayKey()) =>
        set((s) => {
          const day = s.logs[key] || emptyDay()
          return { logs: { ...s.logs, [key]: { ...day, workouts: day.workouts.filter((w) => w.id !== id) } } }
        }),

      // ---- Weight tracking ----
      logWeight: (lb, key = todayKey()) =>
        set((s) => {
          const others = s.weights.filter((w) => w.date !== key)
          const weights = [...others, { date: key, lb: Number(lb) }].sort((a, b) => a.date.localeCompare(b.date))
          return { weights, profile: { ...s.profile, weightLb: Number(lb) } }
        }),

      // ---- Workout plan ----
      savePlan: (plan) => set({ savedPlan: plan }),
    }),
    {
      name: 'nourish-store-v1',
      partialize: (s) => ({
        onboarded: s.onboarded,
        profile: s.profile,
        logs: s.logs,
        weights: s.weights,
        savedPlan: s.savedPlan,
      }),
    },
  ),
)

// Aggregate a day's logged meals into total macros.
export function dayTotals(day) {
  return (day?.meals || []).reduce(
    (a, m) => ({
      kcal: a.kcal + (m.kcal || 0),
      protein: a.protein + (m.protein || 0),
      carbs: a.carbs + (m.carbs || 0),
      fat: a.fat + (m.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
}
