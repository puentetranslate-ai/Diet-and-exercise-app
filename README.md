# 🥗 Nourish — Diet & Exercise Tracker

A visually polished, fast, and genuinely useful app that builds your **macros, meals,
and workouts** around your personal goals — then tracks everything you eat and train.

Everything runs **client-side** and saves to your browser (localStorage), so there's
**zero backend setup** required to use it.

## What it does

- **Personalized onboarding** — enter your stats and goal; it calculates your daily
  calories and macros using the Mifflin–St Jeor equation + activity multipliers.
- **Macro & portion targets** — per-day calories, protein/carbs/fat, fiber and water
  goals, plus simple hand-portion coaching (palms, cupped hands, thumbs, fists).
- **Smart Meal Planner** — tell it what you're *craving* (“burger”, “pad thai”, “a big
  salad”) and it builds a real version of that dish with ingredient portions sized to
  fit the macros remaining for that meal. Respects vegetarian/vegan preferences.
- **Food Log** — quick-add from a whole-foods database, track water, and watch your
  totals fill toward your targets in real time.
- **Training plans** — a weekly split (full-body / upper-lower / push-pull-legs) chosen
  from your goal, experience, available equipment and days per week, with exercises,
  sets, rep ranges, rest and cardio guidance. Log completed sessions.
- **Progress** — weight trend chart and a weekly calories chart, plus live plan editing.

## Tech

- React 18 + Vite
- Tailwind CSS (custom dark “aurora” design system)
- Zustand (state + localStorage persistence)
- Framer Motion (animations)
- Recharts (charts)
- lucide-react (icons)

All nutrition/meal/workout logic is deterministic and lives in `src/lib/`:

| File | Responsibility |
|------|----------------|
| `nutrition.js` | BMR, TDEE, calorie & macro targets, portion coaching |
| `foods.js` | Whole-foods macro database + search |
| `mealEngine.js` | Craving → dish template → portion solver that hits macro targets |
| `exercises.js` | Exercise library (by muscle group / equipment) |
| `workoutEngine.js` | Goal → weekly split + sets/reps prescription |

## Run it

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Notes

- Data lives in `localStorage` under the key `nourish-store-v1`. Use **Me → Reset**
  to clear it.
- The meal engine is intentionally offline & deterministic so the app always works
  without an API key. The component boundaries make it straightforward to swap in an
  LLM-backed generator later.
