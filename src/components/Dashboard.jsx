import { motion } from 'framer-motion'
import { Flame, Plus, UtensilsCrossed } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { useStore, dayTotals } from '../store/useStore.js'
import { buildPlan, portionGuide } from '../lib/nutrition.js'
import { todayKey, shortDate, lastNDays } from '../lib/date.js'
import { Ring, MacroBar, Stat, SectionTitle, Pill, fadeUp } from './ui/Primitives.jsx'

export default function Dashboard({ go }) {
  const { profile, logs, addWater } = useStore()
  const plan = buildPlan(profile)
  const key = todayKey()
  const day = logs[key] || { meals: [], workouts: [], waterOz: 0 }
  const totals = dayTotals(day)
  const guide = portionGuide(plan)

  const remaining = plan.calories - totals.kcal
  const greeting = getGreeting()

  const weekData = lastNDays(7).map((k) => {
    const d = logs[k] || { meals: [] }
    return { day: shortDate(k).split(' ')[1], kcal: dayTotals(d).kcal }
  })

  return (
    <div className="space-y-5">
      <motion.div {...fadeUp}>
        <p className="text-sm text-slate-400">{greeting},</p>
        <h1 className="font-display text-2xl font-extrabold text-white">
          {profile.name || 'friend'} 👋
        </h1>
      </motion.div>

      {/* Hero: calories + macros */}
      <motion.div {...fadeUp} className="card card-pad">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center">
            <Ring value={totals.kcal} goal={plan.calories} label="kcal" sublabel={`of ${plan.calories}`} color="#34d399" size={150} />
            <div className="mt-3 text-center">
              {remaining >= 0 ? (
                <Pill tone="green">
                  <Flame size={12} /> {remaining} kcal left
                </Pill>
              ) : (
                <Pill tone="red">
                  <Flame size={12} /> {Math.abs(remaining)} kcal over
                </Pill>
              )}
            </div>
          </div>
          <div className="w-full flex-1 space-y-4">
            <MacroBar name="protein" value={totals.protein} goal={plan.protein} colorKey="protein" />
            <MacroBar name="carbs" value={totals.carbs} goal={plan.carbs} colorKey="carbs" />
            <MacroBar name="fat" value={totals.fat} goal={plan.fat} colorKey="fat" />
            <button onClick={() => go('plan')} className="btn-primary w-full">
              <Plus size={16} /> Plan a meal that fits
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div {...fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon="🍽️" label="Meals logged" value={day.meals.length} accent="leaf" />
        <Stat icon="🔥" label="Protein" value={`${totals.protein}g`} hint={`goal ${plan.protein}g`} accent="leaf" />
        <button onClick={() => addWater(8)} className="text-left">
          <Stat icon="💧" label="Water (+8oz)" value={`${day.waterOz}oz`} hint={`goal ${plan.waterOz}oz`} accent="flux" />
        </button>
        <Stat icon="🏋️" label="Workouts" value={day.workouts.length} accent="flux" />
      </motion.div>

      {/* Weekly trend */}
      <motion.div {...fadeUp} className="card card-pad">
        <SectionTitle>This week's calories</SectionTitle>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
              <defs>
                <linearGradient id="kcalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, (max) => Math.max(max, plan.calories) * 1.1]} />
              <Tooltip
                contentStyle={{ background: '#161f38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v) => [`${v} kcal`, 'Eaten']}
              />
              <ReferenceLine y={plan.calories} stroke="#818cf8" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="kcal" stroke="#34d399" strokeWidth={2.5} fill="url(#kcalFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Dashed line = your {plan.calories} kcal target
        </p>
      </motion.div>

      {/* Portion coaching */}
      <motion.div {...fadeUp} className="card card-pad">
        <SectionTitle>Your portions today</SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {guide.map((g) => (
            <div key={g.title} className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-3">
              <span className="text-2xl">{g.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white">{g.title}</div>
                <div className="text-xs text-slate-400">{g.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Today's meals */}
      <motion.div {...fadeUp} className="card card-pad">
        <SectionTitle action={<button onClick={() => go('log')} className="text-xs font-semibold text-leaf-300">View log →</button>}>
          Today's meals
        </SectionTitle>
        {day.meals.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="text-leaf-300" />}
            text="Nothing logged yet. Plan a meal or add one from the log."
          />
        ) : (
          <ul className="space-y-2">
            {day.meals.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {m.emoji ? `${m.emoji} ` : ''}{m.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {m.kcal} kcal · {m.protein}p / {m.carbs}c / {m.fat}f
                  </div>
                </div>
                <Pill tone="slate">{m.mealType || 'meal'}</Pill>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 py-8 text-center">
      <div className="text-2xl">{icon}</div>
      <p className="max-w-xs text-sm text-slate-400">{text}</p>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
