import { motion } from 'framer-motion'

const MACRO_COLORS = {
  protein: '#f472b6',
  carbs: '#fbbf24',
  fat: '#60a5fa',
  calories: '#34d399',
  leaf: '#34d399',
  flux: '#818cf8',
}

// Circular progress ring with a value/goal label in the center.
export function Ring({ value = 0, goal = 1, size = 132, stroke = 12, color = '#34d399', label, unit = '', sublabel }) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const over = value > goal
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={over ? '#f87171' : color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-extrabold text-white tabular-nums">{Math.round(value)}</span>
        {label && <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>}
        {sublabel && <span className="mt-0.5 text-[10px] text-slate-500">{sublabel}</span>}
      </div>
    </div>
  )
}

// Slim macro progress bar.
export function MacroBar({ name, value, goal, colorKey }) {
  const color = MACRO_COLORS[colorKey] || MACRO_COLORS[name?.toLowerCase()] || '#34d399'
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  const over = value > goal
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold capitalize text-slate-300">{name}</span>
        <span className="tabular-nums text-slate-400">
          <span className={over ? 'text-red-400' : 'text-slate-200'}>{Math.round(value)}</span> / {Math.round(goal)}g
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: over ? '#f87171' : color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function Segmented({ options, value, onChange, accent = 'leaf' }) {
  const ring = accent === 'flux' ? 'from-flux-400 to-flux-600' : 'from-leaf-400 to-leaf-600'
  const text = accent === 'flux' ? 'text-white' : 'text-ink'
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`relative rounded-2xl px-3.5 py-2 text-sm font-semibold transition ${
              active ? `bg-gradient-to-br ${ring} ${text} shadow-soft` : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Stat({ icon, label, value, hint, accent = 'leaf' }) {
  const grad = accent === 'flux' ? 'from-flux-400/20 to-flux-600/5' : 'from-leaf-400/20 to-leaf-600/5'
  return (
    <div className={`rounded-2xl border border-white/5 bg-gradient-to-br ${grad} p-4`}>
      <div className="mb-2 text-lg">{icon}</div>
      <div className="font-display text-2xl font-extrabold text-white tabular-nums">{value}</div>
      <div className="text-xs font-medium text-slate-400">{label}</div>
      {hint && <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>}
    </div>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-white">{children}</h2>
      {action}
    </div>
  )
}

export function Pill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-white/5 text-slate-300 border-white/10',
    green: 'bg-leaf-500/15 text-leaf-300 border-leaf-500/20',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    violet: 'bg-flux-500/15 text-flux-300 border-flux-500/20',
    red: 'bg-red-500/15 text-red-300 border-red-500/20',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
}
