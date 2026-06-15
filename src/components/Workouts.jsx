import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Check, ChevronDown, Activity, Heart, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { buildWorkoutPlan } from '../lib/workoutEngine.js'
import { GOALS } from '../lib/nutrition.js'
import { todayKey } from '../lib/date.js'
import { Segmented, SectionTitle, Pill, fadeUp } from './ui/Primitives.jsx'

export default function Workouts() {
  const { profile, setProfile, logs, logWorkout, removeWorkout } = useStore()
  const key = todayKey()
  const day = logs[key] || { workouts: [] }
  const [openDay, setOpenDay] = useState(0)

  const plan = useMemo(
    () =>
      buildWorkoutPlan({
        goal: profile.goal,
        daysPerWeek: profile.daysPerWeek,
        equipment: profile.equipment,
        experience: profile.experience,
      }),
    [profile.goal, profile.daysPerWeek, profile.equipment, profile.experience],
  )

  const goalLabel = (GOALS.find((g) => g.id === profile.goal) || {}).label || profile.goal

  return (
    <div className="space-y-5">
      <motion.div {...fadeUp}>
        <h1 className="font-display text-2xl font-extrabold text-white">Training</h1>
        <p className="mt-1 text-sm text-slate-400">A weekly plan built around your goal: <span className="text-flux-300">{goalLabel}</span>.</p>
      </motion.div>

      {/* Controls */}
      <motion.div {...fadeUp} className="card card-pad space-y-4">
        <div>
          <label className="label">Where you train</label>
          <Segmented
            accent="flux"
            value={profile.equipment}
            onChange={(v) => setProfile({ equipment: v })}
            options={[
              { value: 'gym', label: 'Gym' },
              { value: 'home', label: 'Home' },
              { value: 'bodyweight', label: 'Bodyweight' },
            ]}
          />
        </div>
        <div>
          <label className="label">Days per week: {profile.daysPerWeek}</label>
          <input
            type="range"
            min={2}
            max={6}
            value={profile.daysPerWeek}
            onChange={(e) => setProfile({ daysPerWeek: Number(e.target.value) })}
            className="w-full accent-flux-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Pill tone="violet"><Activity size={11} /> {plan.style.reps} reps</Pill>
          <Pill tone="violet">{plan.style.sets} sets</Pill>
          <Pill tone="violet">Rest {plan.style.rest}</Pill>
          <Pill tone="violet">{plan.style.rpe}</Pill>
        </div>
      </motion.div>

      {/* Cardio guidance */}
      <motion.div {...fadeUp} className="card card-pad">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-red-500/15 text-red-300">
            <Heart size={18} />
          </span>
          <div>
            <div className="text-sm font-bold text-white">Cardio & conditioning</div>
            <p className="mt-0.5 text-sm text-slate-400">{plan.cardioGuidance}</p>
          </div>
        </div>
      </motion.div>

      {/* Plan days */}
      <motion.div {...fadeUp}>
        <SectionTitle>Your weekly split</SectionTitle>
        <div className="space-y-3">
          {plan.days.map((d, i) => {
            const open = openDay === i
            const doneToday = day.workouts.some((w) => w.title === d.title)
            return (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenDay(open ? -1 : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-flux-500/15 font-display font-extrabold text-flux-300">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-display text-base font-bold text-white">
                        {d.title} {doneToday && <Check size={14} className="inline text-leaf-300" />}
                      </div>
                      <div className="text-xs text-slate-400">{d.focus} · {d.blocks.length} exercises</div>
                    </div>
                  </div>
                  <ChevronDown size={18} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="border-t border-white/5 px-5 py-4">
                        <ul className="space-y-2.5">
                          {d.blocks.map((b, j) => (
                            <li key={j} className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-white">{b.name}</span>
                                  {b.finisher && <Pill tone="red">finisher</Pill>}
                                </div>
                                <div className="text-[11px] text-slate-500">{b.muscles}</div>
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="font-display text-sm font-bold text-flux-300">
                                  {b.sets} × {b.reps}
                                </div>
                                <div className="text-[10px] text-slate-500">{b.rest === '—' ? b.rpe : `rest ${b.rest}`}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() =>
                            logWorkout({
                              title: d.title,
                              focus: d.focus,
                              exercises: d.blocks.length,
                            })
                          }
                          className="btn-flux mt-4 w-full"
                        >
                          <Check size={16} /> Mark {d.title} complete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Today's sessions */}
      <motion.div {...fadeUp} className="card card-pad">
        <SectionTitle>Logged today</SectionTitle>
        {day.workouts.length === 0 ? (
          <p className="py-5 text-center text-sm text-slate-500">No sessions logged yet. Crush one today 💪</p>
        ) : (
          <ul className="space-y-2">
            {day.workouts.map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf-500/15 text-leaf-300">
                    <Dumbbell size={16} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{w.title}</div>
                    <div className="text-xs text-slate-400">{w.exercises} exercises · {w.focus}</div>
                  </div>
                </div>
                <button onClick={() => removeWorkout(w.id)} className="text-slate-500 transition hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  )
}
