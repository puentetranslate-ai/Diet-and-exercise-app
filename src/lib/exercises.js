// Exercise library. equipment: gym | home | bodyweight
// type: compound | isolation | cardio
// group: push | pull | legs | core | full | cardio

export const EXERCISES = [
  // Push
  { id: 'bench', name: 'Barbell bench press', group: 'push', type: 'compound', equipment: 'gym', muscles: 'Chest, triceps, shoulders' },
  { id: 'db_bench', name: 'Dumbbell bench press', group: 'push', type: 'compound', equipment: 'home', muscles: 'Chest, triceps' },
  { id: 'ohp', name: 'Overhead press', group: 'push', type: 'compound', equipment: 'gym', muscles: 'Shoulders, triceps' },
  { id: 'db_shoulder', name: 'Dumbbell shoulder press', group: 'push', type: 'compound', equipment: 'home', muscles: 'Shoulders' },
  { id: 'pushup', name: 'Push-ups', group: 'push', type: 'compound', equipment: 'bodyweight', muscles: 'Chest, triceps' },
  { id: 'incline_db', name: 'Incline dumbbell press', group: 'push', type: 'compound', equipment: 'home', muscles: 'Upper chest' },
  { id: 'lateral_raise', name: 'Lateral raises', group: 'push', type: 'isolation', equipment: 'home', muscles: 'Side delts' },
  { id: 'tricep_dip', name: 'Bench dips', group: 'push', type: 'isolation', equipment: 'bodyweight', muscles: 'Triceps' },
  { id: 'tricep_pushdown', name: 'Triceps pushdown', group: 'push', type: 'isolation', equipment: 'gym', muscles: 'Triceps' },

  // Pull
  { id: 'deadlift', name: 'Deadlift', group: 'pull', type: 'compound', equipment: 'gym', muscles: 'Posterior chain' },
  { id: 'pullup', name: 'Pull-ups', group: 'pull', type: 'compound', equipment: 'bodyweight', muscles: 'Back, biceps' },
  { id: 'row_barbell', name: 'Barbell row', group: 'pull', type: 'compound', equipment: 'gym', muscles: 'Back' },
  { id: 'db_row', name: 'One-arm dumbbell row', group: 'pull', type: 'compound', equipment: 'home', muscles: 'Back, biceps' },
  { id: 'lat_pulldown', name: 'Lat pulldown', group: 'pull', type: 'compound', equipment: 'gym', muscles: 'Lats' },
  { id: 'face_pull', name: 'Face pulls', group: 'pull', type: 'isolation', equipment: 'gym', muscles: 'Rear delts' },
  { id: 'db_curl', name: 'Dumbbell curls', group: 'pull', type: 'isolation', equipment: 'home', muscles: 'Biceps' },
  { id: 'inverted_row', name: 'Inverted rows', group: 'pull', type: 'compound', equipment: 'bodyweight', muscles: 'Back' },

  // Legs
  { id: 'squat', name: 'Barbell back squat', group: 'legs', type: 'compound', equipment: 'gym', muscles: 'Quads, glutes' },
  { id: 'goblet_squat', name: 'Goblet squat', group: 'legs', type: 'compound', equipment: 'home', muscles: 'Quads, glutes' },
  { id: 'rdl', name: 'Romanian deadlift', group: 'legs', type: 'compound', equipment: 'home', muscles: 'Hamstrings, glutes' },
  { id: 'lunge', name: 'Walking lunges', group: 'legs', type: 'compound', equipment: 'bodyweight', muscles: 'Quads, glutes' },
  { id: 'leg_press', name: 'Leg press', group: 'legs', type: 'compound', equipment: 'gym', muscles: 'Quads, glutes' },
  { id: 'hip_thrust', name: 'Hip thrust', group: 'legs', type: 'compound', equipment: 'home', muscles: 'Glutes' },
  { id: 'calf_raise', name: 'Calf raises', group: 'legs', type: 'isolation', equipment: 'bodyweight', muscles: 'Calves' },
  { id: 'bulgarian', name: 'Bulgarian split squat', group: 'legs', type: 'compound', equipment: 'home', muscles: 'Quads, glutes' },
  { id: 'leg_curl', name: 'Leg curl', group: 'legs', type: 'isolation', equipment: 'gym', muscles: 'Hamstrings' },

  // Core
  { id: 'plank', name: 'Plank', group: 'core', type: 'isolation', equipment: 'bodyweight', muscles: 'Core' },
  { id: 'hanging_leg', name: 'Hanging leg raises', group: 'core', type: 'isolation', equipment: 'gym', muscles: 'Lower abs' },
  { id: 'cable_crunch', name: 'Cable crunch', group: 'core', type: 'isolation', equipment: 'gym', muscles: 'Abs' },
  { id: 'deadbug', name: 'Dead bug', group: 'core', type: 'isolation', equipment: 'bodyweight', muscles: 'Core' },

  // Full / conditioning
  { id: 'kb_swing', name: 'Kettlebell swings', group: 'full', type: 'compound', equipment: 'home', muscles: 'Full body, glutes' },
  { id: 'burpee', name: 'Burpees', group: 'cardio', type: 'cardio', equipment: 'bodyweight', muscles: 'Full body' },
  { id: 'mountain_climber', name: 'Mountain climbers', group: 'cardio', type: 'cardio', equipment: 'bodyweight', muscles: 'Core, cardio' },
  { id: 'jump_rope', name: 'Jump rope', group: 'cardio', type: 'cardio', equipment: 'home', muscles: 'Cardio, calves' },
  { id: 'row_erg', name: 'Rowing machine', group: 'cardio', type: 'cardio', equipment: 'gym', muscles: 'Full body cardio' },
  { id: 'incline_walk', name: 'Incline treadmill walk', group: 'cardio', type: 'cardio', equipment: 'gym', muscles: 'Cardio' },
  { id: 'bike', name: 'Stationary bike intervals', group: 'cardio', type: 'cardio', equipment: 'gym', muscles: 'Cardio' },
]

export function exercise(id) {
  return EXERCISES.find((e) => e.id === id)
}

// Equipment availability is a superset chain: gym ⊃ home ⊃ bodyweight.
export function availableFor(setting) {
  if (setting === 'gym') return EXERCISES
  if (setting === 'home') return EXERCISES.filter((e) => e.equipment !== 'gym')
  return EXERCISES.filter((e) => e.equipment === 'bodyweight')
}
