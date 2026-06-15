import { useState } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { Scale, Plus, Settings2, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { buildPlan, ACTIVITY_LEVELS, GOALS } from '../lib/nutrition.js'
import { todayKey, shortDate } from '../lib/date.js'
import { Segmented, SectionTitle, Stat, Pill, fadeUp } from './ui/Primitives.jsx'

export default function Profile() {
  const { profile, setProfile, weights, logWeight, reset } = useStore()
  const plan = buildPlan(profile)
  const [newWeight, setNewWeight] = useState('')

  const chartData = weights.map((w) => ({ date: shortDate(w.date), lb: w.lb }))
  const first = weights[0]?.lb
  const latest = weights[weights.length - 1]?.lb
  const delta = first != null && latest != null ? +(latest - first).toFixed(1) : 0

  const ft = Math.floor(profile.heightIn / 12)
  const inch = profile.heightIn % 12

  return (
    <div className="space-y-5">
      <motion.div {...fadeUp}>
        <h1 className="font-display text-2xl font-extrabold text-white">Progress & Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Track your weight and fine-tune your plan.</p>
      </motion.div>

      {/* Weight tracker */}
      <motion.div {...fadeUp} className="card card-pad">
        <SectionTitle
          action={
            delta !== 0 && (
              <Pill tone={delta < 0 ? 'green' : 'amber'}>
                {delta < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {Math.abs(delta)} lb
              </Pill>
            )
          }
        >
          Weight trend
        </SectionTitle>
        {chartData.length > 1 ? (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#161f38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v) => [`${v} lb`, 'Weight']}
                />
                <Line type="monotone" dataKey="lb" stroke="#34d399" strokeWidth={3} dot={{ r: 3, fill: '#34d399' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">Log your weight a few times to see your trend.</p>
        )}
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Scale size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              className="input pl-10"
              placeholder={`Today's weight (lb) — last ${latest ?? profile.weightLb}`}
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
            />
          </div>
          <button
            className="btn-primary px-4"
            onClick={() => {
              if (!newWeight) return
              logWeight(newWeight)
              setNewWeight('')
            }}
          >
            <Plus size={16} /> Log
          </button>
        </div>
      </motion.div>

      {/* Plan summary */}
      <motion.div {...fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon="🔥" label="Daily calories" value={plan.calories} accent="leaf" />
        <Stat icon="💪" label="Protein" value={`${plan.protein}g`} accent="leaf" />
        <Stat icon="🍞" label="Carbs" value={`${plan.carbs}g`} accent="leaf" />
        <Stat icon="🥑" label="Fat" value={`${plan.fat}g`} accent="leaf" />
      </motion.div>

      {/* Editable settings */}
      <motion.div {...fadeUp} className="card card-pad space-y-5">
        <div className="flex items-center gap-2 text-slate-300">
          <Settings2 size={16} />
          <h2 className="font-display text-lg font-bold text-white">Adjust your plan</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Age">
            <input type="number" className="input" value={profile.age} onChange={(e) => setProfile({ age: clamp(e.target.value, 13, 100) })} />
          </Field>
          <Field label="Weight (lb)">
            <input type="number" className="input" value={profile.weightLb} onChange={(e) => setProfile({ weightLb: clamp(e.target.value, 70, 600) })} />
          </Field>
        </div>

        <div>
          <label className="label">Height</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input type="number" className="input" value={ft} onChange={(e) => setProfile({ heightIn: clamp(e.target.value, 3, 8) * 12 + inch })} />
              <span className="text-sm text-slate-400">ft</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" className="input" value={inch} onChange={(e) => setProfile({ heightIn: ft * 12 + clamp(e.target.value, 0, 11) })} />
              <span className="text-sm text-slate-400">in</span>
            </div>
          </div>
        </div>

        <div>
          <label className="label">Sex</label>
          <Segmented
            value={profile.sex}
            onChange={(v) => setProfile({ sex: v })}
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
          />
        </div>

        <div>
          <label className="label">Goal</label>
          <Segmented value={profile.goal} onChange={(v) => setProfile({ goal: v })} options={GOALS.map((g) => ({ value: g.id, label: g.label }))} />
        </div>

        <div>
          <label className="label">Activity level</label>
          <Segmented value={profile.activity} onChange={(v) => setProfile({ activity: v })} options={ACTIVITY_LEVELS.map((a) => ({ value: a.id, label: a.label }))} />
        </div>

        <div>
          <label className="label">Pace</label>
          <Segmented
            value={profile.pace}
            onChange={(v) => setProfile({ pace: v })}
            options={[{ value: 'relaxed', label: 'Relaxed' }, { value: 'standard', label: 'Standard' }, { value: 'aggressive', label: 'Aggressive' }]}
          />
        </div>

        <div>
          <label className="label">Diet preference</label>
          <Segmented
            value={profile.dietPref}
            onChange={(v) => setProfile({ dietPref: v })}
            options={[{ value: 'none', label: 'None' }, { value: 'vegetarian', label: 'Vegetarian' }, { value: 'vegan', label: 'Vegan' }]}
          />
        </div>
      </motion.div>

      <motion.div {...fadeUp} className="card card-pad">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Reset everything</div>
            <div className="text-xs text-slate-400">Clears your profile, logs and history on this device.</div>
          </div>
          <button
            onClick={() => {
              if (confirm('Reset all data and start over?')) reset()
            }}
            className="btn-ghost text-red-300"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function clamp(v, lo, hi) {
  const n = Number(v) || 0
  return Math.max(lo, Math.min(hi, n))
}
