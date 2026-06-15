import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Wand2, Check, RefreshCw, Target } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { buildPlan, macrosForMeal } from '../lib/nutrition.js'
import { generateMeal, TEMPLATE_LIST } from '../lib/mealEngine.js'
import { Segmented, SectionTitle, Pill, fadeUp } from './ui/Primitives.jsx'

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
]

const SUGGESTIONS = ['Burrito bowl', 'Pasta', 'Burger', 'Stir-fry', 'Tacos', 'Salad', 'Smoothie', 'Curry', 'Pizza']

export default function MealPlanner() {
  const { profile, addMeal } = useStore()
  const plan = buildPlan(profile)
  const [mealType, setMealType] = useState(defaultMealType())
  const [craving, setCraving] = useState('')
  const [result, setResult] = useState(null)
  const [logged, setLogged] = useState(false)

  const target = macrosForMeal(plan, mealType)

  const generate = (text) => {
    const q = text ?? craving
    setCraving(q)
    setResult(generateMeal(q, target, profile.dietPref))
    setLogged(false)
  }

  const logIt = () => {
    if (!result) return
    addMeal({
      title: result.title,
      emoji: result.emoji,
      mealType,
      kcal: result.totals.kcal,
      protein: result.totals.protein,
      carbs: result.totals.carbs,
      fat: result.totals.fat,
      items: result.items.map((i) => ({ name: i.name, grams: i.grams, household: i.household })),
    })
    setLogged(true)
  }

  return (
    <div className="space-y-5">
      <motion.div {...fadeUp}>
        <h1 className="font-display text-2xl font-extrabold text-white">Meal Planner</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tell us what you're craving — we'll build a version that fits your macros.
        </p>
      </motion.div>

      {/* Target for this meal */}
      <motion.div {...fadeUp} className="card card-pad">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Target size={14} /> Target for this {mealType}
        </div>
        <Segmented value={mealType} onChange={(v) => { setMealType(v); setResult(null) }} options={MEAL_TYPES} />
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <MiniTarget label="kcal" value={target.calories} color="text-leaf-300" />
          <MiniTarget label="protein" value={`${target.protein}g`} color="text-protein" />
          <MiniTarget label="carbs" value={`${target.carbs}g`} color="text-carbs" />
          <MiniTarget label="fat" value={`${target.fat}g`} color="text-fat" />
        </div>
      </motion.div>

      {/* Craving input */}
      <motion.div {...fadeUp} className="card card-pad">
        <label className="label">What do you feel like eating?</label>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="e.g. cheeseburger, pad thai, a big salad…"
            value={craving}
            onChange={(e) => setCraving(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
          />
          <button className="btn-primary px-4" onClick={() => generate()}>
            <Wand2 size={18} />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => generate(s)}
              className="chip transition hover:border-leaf-400/40 hover:text-leaf-300"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.title + craving}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card card-pad"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{result.emoji}</span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-white">{result.title}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <Pill tone={result.fit >= 85 ? 'green' : result.fit >= 70 ? 'amber' : 'red'}>
                      <Sparkles size={11} /> {result.fit}% macro match
                    </Pill>
                  </div>
                </div>
              </div>
              <button onClick={() => generate()} className="btn-ghost px-3 py-2" title="Regenerate">
                <RefreshCw size={15} />
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-400">{result.method}</p>

            {/* Macro summary vs target */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              <ResultMacro label="kcal" value={result.totals.kcal} target={target.calories} />
              <ResultMacro label="protein" value={result.totals.protein} target={target.protein} unit="g" />
              <ResultMacro label="carbs" value={result.totals.carbs} target={target.carbs} unit="g" />
              <ResultMacro label="fat" value={result.totals.fat} target={target.fat} unit="g" />
            </div>

            {/* Ingredients */}
            <div className="mt-5">
              <SectionTitle>Build it with</SectionTitle>
              <ul className="space-y-2">
                {result.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <RoleDot role={it.role} />
                      <span className="text-sm font-medium text-white">{it.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-200">{it.grams}g</div>
                      <div className="text-[11px] text-slate-500">{it.household}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={logIt} disabled={logged} className={`mt-5 w-full ${logged ? 'btn-ghost' : 'btn-primary'}`}>
              {logged ? (
                <>
                  <Check size={16} /> Logged to today
                </>
              ) : (
                <>
                  <Check size={16} /> Log this {mealType}
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && (
        <motion.div {...fadeUp} className="card card-pad">
          <SectionTitle>Need ideas?</SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEMPLATE_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => generate(t.name)}
                className="flex items-center gap-2 rounded-2xl bg-white/[0.03] px-3 py-3 text-left transition hover:bg-white/[0.07]"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-sm font-medium text-white">{t.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function MiniTarget({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] py-2.5">
      <div className={`font-display text-lg font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  )
}

function ResultMacro({ label, value, target, unit = '' }) {
  const diff = value - target
  const close = Math.abs(diff) <= Math.max(5, target * 0.12)
  return (
    <div className="rounded-2xl bg-white/[0.03] py-2.5 text-center">
      <div className="font-display text-lg font-extrabold text-white">
        {value}
        {unit}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-[10px] font-semibold ${close ? 'text-leaf-300' : 'text-amber-300'}`}>
        {diff === 0 ? 'on target' : `${diff > 0 ? '+' : ''}${diff}${unit}`}
      </div>
    </div>
  )
}

function RoleDot({ role }) {
  const map = {
    protein: '#f472b6',
    carb: '#fbbf24',
    fat: '#60a5fa',
    dairy: '#60a5fa',
    veg: '#34d399',
    fruit: '#fb7185',
    sauce: '#a78bfa',
  }
  return <span className="h-2.5 w-2.5 rounded-full" style={{ background: map[role] || '#94a3b8' }} />
}

function defaultMealType() {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 21) return 'dinner'
  return 'snack'
}
