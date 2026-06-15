import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, Wand2, ClipboardList, Dumbbell, User } from 'lucide-react'
import { useStore } from './store/useStore.js'
import Onboarding from './components/Onboarding.jsx'
import Dashboard from './components/Dashboard.jsx'
import MealPlanner from './components/MealPlanner.jsx'
import FoodLog from './components/FoodLog.jsx'
import Workouts from './components/Workouts.jsx'
import Profile from './components/Profile.jsx'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'plan', label: 'Plan', icon: Wand2 },
  { id: 'log', label: 'Log', icon: ClipboardList },
  { id: 'train', label: 'Train', icon: Dumbbell },
  { id: 'me', label: 'Me', icon: User },
]

export default function App() {
  const onboarded = useStore((s) => s.onboarded)
  const [tab, setTab] = useState('home')

  if (!onboarded) return <Onboarding />

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink/70 px-5 py-3.5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">Nourish</span>
          </div>
          <span className="chip">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </header>

      {/* Page */}
      <main className="px-5 pb-28 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {tab === 'home' && <Dashboard go={setTab} />}
            {tab === 'plan' && <MealPlanner />}
            {tab === 'log' && <FoodLog />}
            {tab === 'train' && <Workouts />}
            {tab === 'me' && <Profile />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-2xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-center justify-around rounded-3xl border border-white/10 bg-ink-card/90 px-2 py-2 shadow-soft backdrop-blur-2xl">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
              >
                {active && (
                  <motion.span
                    layoutId="navpill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-leaf-400/20 to-flux-500/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={20} className={`relative z-10 transition ${active ? 'text-leaf-300' : 'text-slate-500'}`} />
                <span className={`relative z-10 text-[10px] font-semibold transition ${active ? 'text-white' : 'text-slate-500'}`}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
