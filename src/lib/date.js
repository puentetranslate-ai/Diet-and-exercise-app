export function todayKey(d = new Date()) {
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

export function shortDate(key) {
  const [y, m, day] = key.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function lastNDays(n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(todayKey(d))
  }
  return out
}
