import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Trash2, Droplets, Minus } from 'lucide-react'
import { useStore, dayTotals } from '../store/useStore.js'
import { buildPlan } from '../lib/nutrition.js'
import { searchFoods, macrosFor } from '../lib/foods.js'
import { todayKey } from '../lib/date.js'
import { MacroBar, SectionTitle, Pill, fadeUp } from './ui/Primitives.jsx'

export default function FoodLog() {
  const { profile, logs, addMeal, removeMeal, addWater } = useStore()
  const plan = buildPlan(profile)
  const key = todayKey()
  const day = logs[key] || { meals: [], workouts: [], waterOz: 0 }
  const totals = dayTotals(day)

  const [q, setQ] = useState('')
  const [picked, setPicked] = useState(null)
  const [grams, setGrams] = useState(150)
  const [mealType, setMealType] = useState('snack')

  const results = searchFoods(q)
  const preview = picked ? macrosFor(picked.id, grams) : null

  const add = () => {
    if (!picked) return
    const m = macrosFor(picked.id, grams)
    addMeal({
      title: `${picked.name} (${grams}g)`,
      mealType,
      kcal: m.kcal,
      protein: m.p,
      carbs: m.c,
      fat: m.f,
    })
    setPicked(null)
    setQ('')
    setGrams(150)
  }

  return (
    <div className="space-y-5">
      <motion.div {...fadeUp}>
        <h1 className="font-display text-2xl font-extrabold text-white">Food Log</h1>
        <p className="mt-1 text-sm text-slate-400">Everything you eat today, tracked against your targets.</p>
      </motion.div>

      {/* Totals */}
      <motion.div {...fadeUp} className="card card-pad">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="font-display text-3xl font-extrabold text-white">
              {totals.kcal} <span className="text-base font-semibold text-slate-400">/ {plan.calories} kcal</span>
            </div>
            <p className="text-xs text-slate-400">{Math.max(0, plan.calories - totals.kcal)} kcal remaining</p>
          </div>
          <Pill tone={totals.kcal > plan.calories ? 'red' : 'green'}>
            {Math.round((totals.kcal / plan.calories) * 100)}%
          </Pill>
        </div>
        <div className="space-y-3">
          <MacroBar name="protein" value={totals.protein} goal={plan.protein} colorKey="protein" />
          <MacroBar name="carbs" value={totals.carbs} goal={plan.carbs} colorKey="carbs" />
          <MacroBar name="fat" value={totals.fat} goal={plan.fat} colorKey="fat" />
        </div>
      </motion.div>

      {/* Water */}
      <motion.div {...fadeUp} className="card card-pad">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-flux-500/15 text-flux-300">
              <Droplets size={20} />
            </span>
            <div>
              <div className="font-display text-lg font-bold text-white">{day.waterOz} oz water</div>
              <div className="text-xs text-slate-400">Goal {plan.waterOz} oz</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => addWater(-8)} className="btn-ghost h-10 w-10 p-0"><Minus size={16} /></button>
            <button onClick={() => addWater(8)} className="btn-flux h-10 px-3 text-xs">+8 oz</button>
          </div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-flux-400 to-flux-600 transition-all"
            style={{ width: `${Math.min(100, (day.waterOz / plan.waterOz) * 100)}%` }}
          />
        </div>
      </motion.div>

      {/* Quick add */}
      <motion.div {...fadeUp} className="card card-pad">
        <SectionTitle>Quick add a food</SectionTitle>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-10"
            placeholder="Search foods (chicken, rice, avocado…)"
            value={picked ? picked.name : q}
            onChange={(e) => {
              setPicked(null)
              setQ(e.target.value)
            }}
          />
        </div>

        {!picked && results.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setPicked(r)}
                  className="flex w-full items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-2.5 text-left transition hover:bg-white/[0.07]"
                >
                  <span className="text-sm font-medium text-white">{r.name}</span>
                  <span className="text-xs text-slate-500">{r.kcal} kcal /100g</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {picked && (
          <div className="mt-3 space-y-3 rounded-2xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-400">Amount</label>
              <input
                type="number"
                className="input flex-1 py-2"
                value={grams}
                onChange={(e) => setGrams(Math.max(0, Number(e.target.value)))}
              />
              <span className="text-sm text-slate-400">grams</span>
            </div>
            {preview && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <PreviewCell label="kcal" value={preview.kcal} />
                <PreviewCell label="P" value={`${preview.p}g`} />
                <PreviewCell label="C" value={`${preview.c}g`} />
                <PreviewCell label="F" value={`${preview.f}g`} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mt) => (
                <button
                  key={mt}
                  onClick={() => setMealType(mt)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    mealType === mt ? 'bg-leaf-500 text-ink' : 'bg-white/5 text-slate-300'
                  }`}
                >
                  {mt}
                </button>
              ))}
            </div>
            <button onClick={add} className="btn-primary w-full">
              <Plus size={16} /> Add to log
            </button>
          </div>
        )}
      </motion.div>

      {/* Logged meals */}
      <motion.div {...fadeUp} className="card card-pad">
        <SectionTitle>Logged today</SectionTitle>
        {day.meals.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No foods logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {day.meals.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {m.emoji ? `${m.emoji} ` : ''}{m.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {m.kcal} kcal · {m.protein}p / {m.carbs}c / {m.fat}f
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="slate">{m.mealType}</Pill>
                  <button onClick={() => removeMeal(m.id)} className="text-slate-500 transition hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  )
}

function PreviewCell({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 py-2">
      <div className="font-display text-base font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
    </div>
  )
}
