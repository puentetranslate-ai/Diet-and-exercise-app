// Workout engine: build a weekly training plan from goal, experience,
// days/week and available equipment. Picks exercises + sets + rep ranges.

import { availableFor } from './exercises.js'

// Rep/intensity prescriptions per goal.
const STYLE = {
  lose: { reps: '10–15', sets: 3, rest: '45–60s', rpe: 'RPE 7–8', tempo: 'Brisk, short rest', cardio: true },
  maintain: { reps: '8–12', sets: 3, rest: '60–90s', rpe: 'RPE 7', tempo: 'Controlled', cardio: true },
  gain: { reps: '6–12', sets: 4, rest: '90–120s', rpe: 'RPE 8–9', tempo: 'Controlled, full ROM', cardio: false },
  recomp: { reps: '8–12', sets: 4, rest: '75–90s', rpe: 'RPE 8', tempo: 'Controlled', cardio: true },
  strength: { reps: '3–6', sets: 5, rest: '2–3 min', rpe: 'RPE 8', tempo: 'Explosive up', cardio: false },
}

// Day templates by training split. Each entry: how many of each group.
const FULL_BODY = { legs: 2, push: 1, pull: 1, core: 1 }

function pick(pool, group, type, n, used) {
  const candidates = pool.filter(
    (e) => e.group === group && (!type || e.type === type) && !used.has(e.id),
  )
  const chosen = []
  for (const e of candidates) {
    if (chosen.length >= n) break
    chosen.push(e)
    used.add(e.id)
  }
  return chosen
}

function buildDay(title, pool, layout, style, used, opts = {}) {
  const exercises = []
  // Prefer compounds first within each group.
  for (const [group, count] of Object.entries(layout)) {
    const compounds = pick(pool, group, 'compound', count, used)
    exercises.push(...compounds)
    if (compounds.length < count) {
      exercises.push(...pick(pool, group, null, count - compounds.length, used))
    }
  }
  const blocks = exercises.map((e, i) => ({
    ...e,
    // First (compound) movements get the heavier prescription.
    sets: style.sets,
    reps: i === 0 && style.reps.includes('–') ? style.reps : style.reps,
    rest: style.rest,
    rpe: style.rpe,
  }))

  if (opts.cardioFinisher) {
    const cardio = pool.find((e) => e.group === 'cardio')
    if (cardio) {
      blocks.push({
        ...cardio,
        sets: 1,
        reps: opts.cardioFinisher,
        rest: '—',
        rpe: 'Hard',
        finisher: true,
      })
    }
  }
  return { title, focus: opts.focus, blocks }
}

export function buildWorkoutPlan({ goal = 'maintain', daysPerWeek = 4, equipment = 'gym', experience = 'intermediate' }) {
  const style = goal === 'gain' && experience === 'advanced' ? STYLE.strength : STYLE[goal] || STYLE.maintain
  const pool = availableFor(equipment)
  const days = Math.max(2, Math.min(6, daysPerWeek))

  const plan = []

  // Choose a split based on training frequency.
  if (days <= 3) {
    // Full body x N
    for (let i = 0; i < days; i++) {
      const used = new Set()
      plan.push(
        buildDay(`Full Body ${String.fromCharCode(65 + i)}`, pool, FULL_BODY, style, used, {
          focus: 'Total body',
          cardioFinisher: style.cardio ? '10 min intervals' : null,
        }),
      )
    }
  } else if (days === 4) {
    // Upper / Lower x2
    const splits = [
      { title: 'Upper A', layout: { push: 2, pull: 2, core: 1 }, focus: 'Chest, back, arms' },
      { title: 'Lower A', layout: { legs: 3, core: 1 }, focus: 'Quads, glutes, hams' },
      { title: 'Upper B', layout: { pull: 2, push: 2, core: 1 }, focus: 'Back, shoulders, arms' },
      { title: 'Lower B', layout: { legs: 3, core: 1 }, focus: 'Posterior chain' },
    ]
    splits.forEach((s) => {
      const used = new Set()
      plan.push(buildDay(s.title, pool, s.layout, style, used, {
        focus: s.focus,
        cardioFinisher: style.cardio ? '8 min intervals' : null,
      }))
    })
  } else {
    // Push / Pull / Legs (5–6 days)
    const splits = [
      { title: 'Push', layout: { push: 3, core: 1 }, focus: 'Chest, shoulders, triceps' },
      { title: 'Pull', layout: { pull: 3, core: 1 }, focus: 'Back, biceps' },
      { title: 'Legs', layout: { legs: 4, core: 1 }, focus: 'Quads, glutes, hams' },
      { title: 'Push', layout: { push: 3, core: 1 }, focus: 'Shoulders & chest' },
      { title: 'Pull', layout: { pull: 3, core: 1 }, focus: 'Back & arms' },
      { title: 'Legs', layout: { legs: 4, core: 1 }, focus: 'Glutes & hamstrings' },
    ]
    for (let i = 0; i < days; i++) {
      const s = splits[i]
      const used = new Set()
      plan.push(buildDay(s.title, pool, s.layout, style, used, {
        focus: s.focus,
        cardioFinisher: style.cardio && i % 2 === 1 ? '10 min steady cardio' : null,
      }))
    }
  }

  return {
    goal,
    style,
    daysPerWeek: days,
    equipment,
    experience,
    cardioGuidance: cardioGuidance(goal),
    days: plan,
  }
}

function cardioGuidance(goal) {
  switch (goal) {
    case 'lose':
      return '3–4 cardio sessions/week: mix 2 steady-state walks (30–45 min) with 1–2 HIIT finishers. Aim for 8–10k steps daily.'
    case 'gain':
      return 'Keep cardio light: 1–2 easy 20-min sessions/week to protect recovery and appetite.'
    case 'recomp':
      return '2–3 sessions/week: one HIIT finisher plus steady walks. Prioritize the lifting.'
    default:
      return '2–3 moderate cardio sessions/week (20–40 min) for heart health and recovery.'
  }
}
