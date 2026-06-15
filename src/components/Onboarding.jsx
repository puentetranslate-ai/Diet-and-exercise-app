import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { ACTIVITY_LEVELS, GOALS, buildPlan } from '../lib/nutrition.js'
import { Segmented } from './ui/Primitives.jsx'

const STEPS = ['You', 'Body', 'Activity', 'Goal', 'Training', 'Plan']

export default function Onboarding() {
  const { profile, setProfile, completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const plan = buildPlan(profile)

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  // height helpers (imperial)
  const ft = Math.floor(profile.heightIn / 12)
  const inch = profile.heightIn % 12

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8">
      <header className="mb-6">
        <div className="mb-4 flex items-center gap-2 text-leaf-300">
          <span className="text-2xl">🥗</span>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">Nourish</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-gradient-to-r from-leaf-400 to-flux-400' : 'bg-white/8'
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </header>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <Card title="Let's get to know you" subtitle="This personalizes every number in the app.">
                <div>
                  <label className="label">What should we call you?</label>
                  <input
                    className="input"
                    placeholder="Your name"
                    value={profile.name}
                    onChange={(e) => setProfile({ name: e.target.value })}
                  />
                </div>
                <div className="mt-5">
                  <label className="label">Biological sex (for metabolic math)</label>
                  <Segmented
                    value={profile.sex}
                    onChange={(v) => setProfile({ sex: v })}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                    ]}
                  />
                </div>
              </Card>
            )}

            {step === 1 && (
              <Card title="Your body" subtitle="Used to estimate your daily energy needs.">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Age">
                    <input
                      type="number"
                      className="input"
                      value={profile.age}
                      onChange={(e) => setProfile({ age: clampNum(e.target.value, 13, 100) })}
                    />
                  </Field>
                  <Field label="Weight (lb)">
                    <input
                      type="number"
                      className="input"
                      value={profile.weightLb}
                      onChange={(e) => setProfile({ weightLb: clampNum(e.target.value, 70, 600) })}
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <label className="label">Height</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input"
                        value={ft}
                        onChange={(e) => setProfile({ heightIn: clampNum(e.target.value, 3, 8) * 12 + inch })}
                      />
                      <span className="text-sm text-slate-400">ft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input"
                        value={inch}
                        onChange={(e) => setProfile({ heightIn: ft * 12 + clampNum(e.target.value, 0, 11) })}
                      />
                      <span className="text-sm text-slate-400">in</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card title="How active are you?" subtitle="Outside of planned workouts — your day-to-day movement.">
                <div className="space-y-2.5">
                  {ACTIVITY_LEVELS.map((a) => (
                    <SelectRow
                      key={a.id}
                      active={profile.activity === a.id}
                      onClick={() => setProfile({ activity: a.id })}
                      title={a.label}
                      hint={a.hint}
                    />
                  ))}
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card title="What's your goal?" subtitle="We'll set your calories and macros to match.">
                <div className="space-y-2.5">
                  {GOALS.map((g) => (
                    <SelectRow
                      key={g.id}
                      active={profile.goal === g.id}
                      onClick={() => setProfile({ goal: g.id })}
                      title={g.label}
                      hint={g.hint}
                    />
                  ))}
                </div>
                <div className="mt-5">
                  <label className="label">Pace</label>
                  <Segmented
                    value={profile.pace}
                    onChange={(v) => setProfile({ pace: v })}
                    options={[
                      { value: 'relaxed', label: 'Relaxed' },
                      { value: 'standard', label: 'Standard' },
                      { value: 'aggressive', label: 'Aggressive' },
                    ]}
                  />
                </div>
                <div className="mt-5">
                  <label className="label">Diet preference</label>
                  <Segmented
                    value={profile.dietPref}
                    onChange={(v) => setProfile({ dietPref: v })}
                    options={[
                      { value: 'none', label: 'No restriction' },
                      { value: 'vegetarian', label: 'Vegetarian' },
                      { value: 'vegan', label: 'Vegan' },
                    ]}
                  />
                </div>
              </Card>
            )}

            {step === 4 && (
              <Card title="Training setup" subtitle="So your workout plan fits your life.">
                <div>
                  <label className="label">Where do you train?</label>
                  <Segmented
                    accent="flux"
                    value={profile.equipment}
                    onChange={(v) => setProfile({ equipment: v })}
                    options={[
                      { value: 'gym', label: 'Full gym' },
                      { value: 'home', label: 'Home (dumbbells)' },
                      { value: 'bodyweight', label: 'Bodyweight' },
                    ]}
                  />
                </div>
                <div className="mt-5">
                  <label className="label">Experience</label>
                  <Segmented
                    accent="flux"
                    value={profile.experience}
                    onChange={(v) => setProfile({ experience: v })}
                    options={[
                      { value: 'beginner', label: 'Beginner' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'advanced', label: 'Advanced' },
                    ]}
                  />
                </div>
                <div className="mt-5">
                  <label className="label">Days per week: {profile.daysPerWeek}</label>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={profile.daysPerWeek}
                    onChange={(e) => setProfile({ daysPerWeek: Number(e.target.value) })}
                    className="w-full accent-flux-500"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                    <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                  </div>
                </div>
              </Card>
            )}

            {step === 5 && (
              <Card title="Your plan is ready" subtitle="Here's your starting blueprint — you can tweak it anytime.">
                <div className="rounded-3xl border border-leaf-500/20 bg-gradient-to-br from-leaf-500/10 to-flux-500/5 p-5">
                  <div className="mb-1 flex items-center gap-2 text-leaf-300">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Daily target</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-display text-5xl font-extrabold text-white">{plan.calories}</span>
                    <span className="mb-1.5 text-sm text-slate-400">kcal / day</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <MacroChip label="Protein" value={plan.protein} color="text-protein" />
                    <MacroChip label="Carbs" value={plan.carbs} color="text-carbs" />
                    <MacroChip label="Fat" value={plan.fat} color="text-fat" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
                    <Info k="Maintenance" v={`${plan.tdee} kcal`} />
                    <Info k="BMR" v={`${plan.bmr} kcal`} />
                    <Info k="Fiber goal" v={`${plan.fiberTarget} g`} />
                    <Info k="Water goal" v={`${plan.waterOz} oz`} />
                  </div>
                </div>
                <button
                  className="btn-primary mt-6 w-full py-3.5 text-base"
                  onClick={completeOnboarding}
                >
                  <Check size={18} /> Start tracking
                </button>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {step < STEPS.length - 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button className="btn-ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="btn-primary" onClick={next}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <div className="card card-pad">
      <h1 className="font-display text-2xl font-extrabold text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      <div className="mt-5">{children}</div>
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

function SelectRow({ active, onClick, title, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
        active
          ? 'border-leaf-400/50 bg-leaf-500/10 shadow-glow'
          : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="text-xs text-slate-400">{hint}</div>
      </div>
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
          active ? 'border-leaf-400 bg-leaf-400 text-ink' : 'border-white/20'
        }`}
      >
        {active && <Check size={13} strokeWidth={3} />}
      </div>
    </button>
  )
}

function MacroChip({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3 text-center">
      <div className={`font-display text-2xl font-extrabold ${color}`}>{value}g</div>
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
    </div>
  )
}

function Info({ k, v }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
      <span>{k}</span>
      <span className="font-semibold text-slate-200">{v}</span>
    </div>
  )
}

function clampNum(v, lo, hi) {
  const n = Number(v) || 0
  return Math.max(lo, Math.min(hi, n))
}
