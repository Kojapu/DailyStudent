import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { SUBJECT_INFO } from '../data/subjectInfo'
import type { AbiGradeEntry, AbiHalbjahr } from '../types'

// ── Calculation helpers (exported for widget use) ────────────────────────────

export function subjectAvgAbi(e: AbiGradeEntry): number | null {
  const r = e.smRatio ?? 0.5
  if (e.schriftlich !== null && e.muendlich !== null) {
    return e.schriftlich * r + e.muendlich * (1 - r)
  }
  if (e.schriftlich !== null) return e.schriftlich
  if (e.muendlich !== null) return e.muendlich
  return null
}

export function effectiveWeightAbi(e: AbiGradeEntry): number {
  return e.isLK ? 2 : 1
}

export function overallPunkteAbi(entries: AbiGradeEntry[]): number | null {
  const valid = entries
    .map((e) => ({ avg: subjectAvgAbi(e), w: effectiveWeightAbi(e) }))
    .filter((e): e is { avg: number; w: number } => e.avg !== null)
  if (valid.length === 0) return null
  const totalW = valid.reduce((s, e) => s + e.w, 0)
  return valid.reduce((s, e) => s + e.avg * e.w, 0) / totalW
}

export function pktToNoteAbi(p: number): string {
  const note = Math.max(1.0, Math.min(6.0, (17 - p) / 3))
  return note.toFixed(1).replace('.', ',')
}

export function noteColorAbi(note: string): string {
  const n = parseFloat(note.replace(',', '.'))
  if (n <= 1.9) return '#34C759'
  if (n <= 2.9) return '#FF9500'
  return '#FF3B30'
}

export function totalPunkteAllHalbjahre(halbjahre: AbiHalbjahr[]): number | null {
  const subjectMap = new Map<string, { avgs: number[]; isLK: boolean }>()
  for (const hj of halbjahre) {
    for (const entry of hj.entries) {
      const avg = subjectAvgAbi(entry)
      if (avg === null) continue
      const ex = subjectMap.get(entry.subjectId)
      if (ex) { ex.avgs.push(avg); if (entry.isLK) ex.isLK = true }
      else subjectMap.set(entry.subjectId, { avgs: [avg], isLK: entry.isLK })
    }
  }
  if (subjectMap.size === 0) return null
  let tw = 0, ws = 0
  for (const [, { avgs, isLK }] of subjectMap) {
    const mean = avgs.reduce((s, v) => s + v, 0) / avgs.length
    const w = isLK ? 2 : 1
    ws += mean * w; tw += w
  }
  return ws / tw
}

function zielnoteToPoints(z: string): number {
  return 17 - parseFloat(z.replace(',', '.')) * 3
}

const Q_SEQUENCE = ['Q1', 'Q2', 'Q3', 'Q4']
function nextLabel(existing: AbiHalbjahr[]): string {
  for (const label of Q_SEQUENCE) {
    if (!existing.some((h) => h.label === label)) return label
  }
  return `HJ ${existing.length + 1}`
}

// ── Stepper component ────────────────────────────────────────────────────────

function Stepper({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(value !== null && value > 0 ? value - 1 : null)}
        disabled={value === null}
        className="w-8 h-8 rounded-full bg-surface-hover border border-border/50 flex items-center justify-center text-text-secondary disabled:opacity-20 press-sm shrink-0"
      >
        <span className="text-[14px] font-bold leading-none">−</span>
      </button>
      <span
        className="text-[22px] font-black tabular-nums text-center"
        style={{ minWidth: 34, color: value !== null ? 'rgb(var(--color-text-primary))' : 'rgb(var(--color-text-muted))' }}
      >
        {value !== null ? value : '—'}
      </span>
      <button
        onClick={() => onChange(value !== null ? Math.min(15, value + 1) : 0)}
        disabled={value === 15}
        className="w-8 h-8 rounded-full bg-surface-hover border border-border/50 flex items-center justify-center text-text-secondary disabled:opacity-20 press-sm shrink-0"
      >
        <span className="text-[14px] font-bold leading-none">+</span>
      </button>
    </div>
  )
}

// ── Subject card ─────────────────────────────────────────────────────────────

const SM_RATIOS = [
  { label: '50/50', ratio: 0.5 },
  { label: '60/40', ratio: 0.6 },
  { label: '70/30', ratio: 0.7 },
  { label: '40/60', ratio: 0.4 },
  { label: '30/70', ratio: 0.3 },
] as const

function SubjectCard({
  entry,
  onChange,
}: {
  entry: AbiGradeEntry
  onChange: (e: AbiGradeEntry) => void
}) {
  const subj = SUBJECT_INFO[entry.subjectId]
  const avg = subjectAvgAbi(entry)
  const avgNote = avg !== null ? pktToNoteAbi(avg) : null
  const ratio = entry.smRatio ?? 0.5
  const bothEntered = entry.schriftlich !== null && entry.muendlich !== null

  const matchesPreset = SM_RATIOS.some((r) => r.ratio === ratio)
  const [manualOpen, setManualOpen] = useState(!matchesPreset)
  const [manualPct, setManualPct] = useState(Math.round(ratio * 100))

  return (
    <div className="bg-surface border border-border/60 rounded-[18px] overflow-hidden">
      {/* Header: icon + name + LK toggle + avg */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-btn flex items-center justify-center text-lg shrink-0"
            style={{ background: `${subj?.color ?? '#7C3AED'}22` }}
          >
            {subj?.icon ?? '📚'}
          </div>
          <span className="font-semibold text-[14px] text-text-primary truncate">
            {subj?.name ?? entry.subjectId}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* LK 2× toggle */}
          <button
            onClick={() => onChange({ ...entry, isLK: !entry.isLK })}
            className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold transition-all press-sm"
            style={
              entry.isLK
                ? {
                    background: 'rgba(var(--color-accent),0.15)',
                    color: 'rgb(var(--color-accent))',
                    border: '1px solid rgba(var(--color-accent),0.4)',
                  }
                : {
                    background: 'rgba(var(--color-border),0.4)',
                    color: 'rgb(var(--color-text-muted))',
                    border: '1px solid transparent',
                  }
            }
          >
            LK 2×
          </button>
          {avgNote && (
            <span className="text-[14px] font-bold" style={{ color: noteColorAbi(avgNote) }}>
              Ø {avgNote}
            </span>
          )}
        </div>
      </div>

      {/* Grade inputs */}
      <div className="flex border-t border-border/30">
        {/* Schriftlich */}
        <div className="flex-1 flex flex-col items-center py-4 px-3">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-3">
            Schriftlich
            {bothEntered && ratio !== 0.5 && (
              <span className="ml-1 font-normal normal-case opacity-60">
                {Math.round(ratio * 100)}%
              </span>
            )}
          </p>
          <Stepper
            value={entry.schriftlich}
            onChange={(v) => onChange({ ...entry, schriftlich: v })}
          />
          {entry.schriftlich !== null ? (
            <p className="text-[9px] text-text-muted mt-2">≈ {pktToNoteAbi(entry.schriftlich)}</p>
          ) : (
            <p className="text-[9px] text-text-muted/40 mt-2">nicht eingetragen</p>
          )}
        </div>

        <div className="w-px bg-border/30 self-stretch" />

        {/* Mündlich */}
        <div className="flex-1 flex flex-col items-center py-4 px-3">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-3">
            Mündlich
            {bothEntered && ratio !== 0.5 && (
              <span className="ml-1 font-normal normal-case opacity-60">
                {Math.round((1 - ratio) * 100)}%
              </span>
            )}
          </p>
          <Stepper
            value={entry.muendlich}
            onChange={(v) => onChange({ ...entry, muendlich: v })}
          />
          {entry.muendlich !== null ? (
            <p className="text-[9px] text-text-muted mt-2">≈ {pktToNoteAbi(entry.muendlich)}</p>
          ) : (
            <p className="text-[9px] text-text-muted/40 mt-2">nicht eingetragen</p>
          )}
        </div>
      </div>

      {/* S/M ratio row — only shown when both grades are entered */}
      {bothEntered && (
        <div className="px-4 py-3 border-t border-border/30 bg-background/40 space-y-2.5">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">S / M Gewichtung</p>

          {/* Preset buttons + manual toggle */}
          <div className="flex flex-wrap gap-1">
            {SM_RATIOS.map(({ label, ratio: r }) => {
              const active = !manualOpen && ratio === r
              return (
                <button
                  key={label}
                  onClick={() => { onChange({ ...entry, smRatio: r }); setManualOpen(false) }}
                  className="px-2 py-1 rounded-pill text-[10px] font-bold transition-all press-sm"
                  style={
                    active
                      ? {
                          background: 'linear-gradient(135deg, rgb(var(--color-accent)), rgba(var(--color-accent),0.8))',
                          color: 'white',
                          boxShadow: '0 2px 6px rgba(var(--color-accent),0.3)',
                        }
                      : {
                          background: 'rgba(var(--color-border),0.4)',
                          color: 'rgb(var(--color-text-secondary))',
                        }
                  }
                >
                  {label}
                </button>
              )
            })}
            <button
              onClick={() => setManualOpen((v) => !v)}
              className="px-2 py-1 rounded-pill text-[10px] font-bold transition-all press-sm"
              style={
                manualOpen
                  ? {
                      background: 'linear-gradient(135deg, rgb(var(--color-accent)), rgba(var(--color-accent),0.8))',
                      color: 'white',
                      boxShadow: '0 2px 6px rgba(var(--color-accent),0.3)',
                    }
                  : {
                      background: 'rgba(var(--color-border),0.4)',
                      color: 'rgb(var(--color-text-secondary))',
                    }
              }
            >
              Manuell
            </button>
          </div>

          {/* Manual input row */}
          {manualOpen && (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-background border border-border rounded-[10px] px-3 py-1.5">
                <span className="text-[10px] font-bold text-text-muted">S</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={manualPct}
                  onChange={(e) => {
                    const v = Math.min(99, Math.max(1, parseInt(e.target.value) || 1))
                    setManualPct(v)
                    onChange({ ...entry, smRatio: v / 100 })
                  }}
                  className="w-9 bg-transparent text-text-primary text-[14px] font-bold text-center focus:outline-none tabular-nums"
                />
                <span className="text-[10px] text-text-muted">%</span>
              </div>
              <span className="text-[11px] text-text-muted">/</span>
              <div className="flex items-center gap-1.5 bg-background border border-border/50 rounded-[10px] px-3 py-1.5 opacity-70">
                <span className="text-[10px] font-bold text-text-muted">M</span>
                <span className="w-9 text-text-secondary text-[14px] font-bold text-center tabular-nums">
                  {100 - manualPct}
                </span>
                <span className="text-[10px] text-text-muted">%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Screen ──────────────────────────────────────────────────────────────

function ChevronLeft({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AbiRechnerScreen() {
  const { profile, updateProfile } = useUser()
  const navigate = useNavigate()

  const faecher = profile?.faecher ?? []
  const zielnote = profile?.zielnote

  // Init: migrate legacy abiNoten (single HJ) → abiHalbjahre if needed
  const [halbjahre, setHalbjahre] = useState<AbiHalbjahr[]>(() => {
    const saved = profile?.abiHalbjahre
    const ensureAllFaecher = (entries: AbiGradeEntry[]) =>
      faecher.map(
        (subjectId) =>
          entries.find((e) => e.subjectId === subjectId) ?? {
            subjectId, schriftlich: null, muendlich: null, isLK: false,
          },
      )
    if (saved && saved.length > 0) {
      return saved.map((hj) => ({ ...hj, entries: ensureAllFaecher(hj.entries) }))
    }
    const legacy = profile?.abiNoten ?? []
    return [{ id: 'hj-q1', label: 'Q1', entries: ensureAllFaecher(legacy) }]
  })

  const [activeId, setActiveId] = useState<string>(halbjahre[0]?.id ?? '')

  const activeHj = halbjahre.find((hj) => hj.id === activeId) ?? halbjahre[0]
  const activeEntries = activeHj?.entries ?? []

  const persist = (updated: AbiHalbjahr[]) => {
    setHalbjahre(updated)
    updateProfile({ abiHalbjahre: updated })
  }

  const updateEntry = (updatedEntry: AbiGradeEntry) => {
    persist(
      halbjahre.map((hj) =>
        hj.id === activeId
          ? { ...hj, entries: hj.entries.map((e) => e.subjectId === updatedEntry.subjectId ? updatedEntry : e) }
          : hj,
      ),
    )
  }

  const addHalbjahr = () => {
    const label = nextLabel(halbjahre)
    const newHj: AbiHalbjahr = {
      id: `hj-${Date.now()}`,
      label,
      entries: faecher.map((subjectId) => ({ subjectId, schriftlich: null, muendlich: null, isLK: false })),
    }
    const updated = [...halbjahre, newHj]
    persist(updated)
    setActiveId(newHj.id)
  }

  const deleteHalbjahr = (hjId: string) => {
    if (halbjahre.length <= 1) return
    const updated = halbjahre.filter((hj) => hj.id !== hjId)
    if (activeId === hjId) setActiveId(updated[updated.length - 1]?.id ?? '')
    persist(updated)
  }

  // Totals across all HJ
  const totalPunkte = totalPunkteAllHalbjahre(halbjahre)
  const totalNote = totalPunkte !== null ? pktToNoteAbi(totalPunkte) : null
  const zielpunkte = zielnote ? zielnoteToPoints(zielnote) : null
  const diffPunkte = totalPunkte !== null && zielpunkte !== null ? totalPunkte - zielpunkte : null
  const isOnTrack = diffPunkte !== null && diffPunkte >= 0

  // Active HJ stats
  const activeOverall = overallPunkteAbi(activeEntries)
  const activeNote = activeOverall !== null ? pktToNoteAbi(activeOverall) : null
  const activeFilledCount = activeEntries.filter((e) => subjectAvgAbi(e) !== null).length
  const activeLkCount = activeEntries.filter((e) => e.isLK).length

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 border-b border-border/40"
        style={{ paddingTop: 'max(58px, calc(env(safe-area-inset-top, 0px) + 18px))', paddingBottom: 14 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center text-text-muted press-sm shrink-0"
        >
          <ChevronLeft />
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-text-primary">Abi-Notenrechner</h1>
          <p className="text-[12px] text-text-muted">
            {halbjahre.length} {halbjahre.length === 1 ? 'Halbjahr' : 'Halbjahre'}
            {totalPunkte !== null ? ` · Gesamt ${totalPunkte.toFixed(1)} Pkt` : ''}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4">

        {/* ── Gesamtschnitt card ────────────────────────────────── */}
        <div className="bg-surface border border-border/60 rounded-[20px] p-5">
          {totalPunkte !== null ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                    Gesamtschnitt
                  </p>
                  <div className="flex items-end gap-2">
                    <span
                      className="font-black leading-none"
                      style={{ fontSize: 54, color: noteColorAbi(totalNote!), letterSpacing: '-0.02em' }}
                    >
                      {totalPunkte.toFixed(1).replace('.', ',')}
                    </span>
                    <div className="mb-1 leading-tight">
                      <p className="text-[12px] text-text-muted">Punkte</p>
                      <p className="text-[18px] font-bold" style={{ color: noteColorAbi(totalNote!) }}>
                        ≈ {totalNote}
                      </p>
                    </div>
                  </div>
                </div>
                {zielnote && (
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Zielnote</p>
                    <p className="text-[28px] font-bold text-text-secondary leading-none">{zielnote}</p>
                    {diffPunkte !== null && (
                      <p className="text-[12px] font-bold mt-1" style={{ color: isOnTrack ? '#34C759' : '#FF9500' }}>
                        {isOnTrack ? `+${diffPunkte.toFixed(1)} Pkt ✓` : `${diffPunkte.toFixed(1)} Pkt`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {zielpunkte !== null && (
                <div className="mb-3">
                  <div className="relative h-2.5 bg-border/30 rounded-pill overflow-hidden">
                    <div
                      className="h-full rounded-pill transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (totalPunkte / 15) * 100)}%`,
                        background: `linear-gradient(90deg, ${noteColorAbi(totalNote!)}, ${noteColorAbi(totalNote!)}CC)`,
                      }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5"
                      style={{
                        left: `${Math.min(99, (zielpunkte / 15) * 100)}%`,
                        background: 'rgb(var(--color-text-secondary))',
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] text-text-muted">0 Pkt</span>
                    <span className="text-[9px] text-text-muted/60">
                      Ziel {zielpunkte.toFixed(1)} Pkt (Note {zielnote})
                    </span>
                    <span className="text-[9px] text-text-muted">15 Pkt</span>
                  </div>
                </div>
              )}

              {/* Per-HJ breakdown */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-text-muted">Aus</span>
                {halbjahre.map((hj) => {
                  const pts = overallPunkteAbi(hj.entries)
                  const note = pts !== null ? pktToNoteAbi(pts) : null
                  return (
                    <span
                      key={hj.id}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-pill"
                      style={{
                        background: note ? `${noteColorAbi(note)}18` : 'rgba(var(--color-border),0.3)',
                        color: note ? noteColorAbi(note) : 'rgb(var(--color-text-muted))',
                      }}
                    >
                      {hj.label}{note ? ` · ${note}` : ''}
                    </span>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(var(--color-accent),0.1)' }}
              >
                🎓
              </div>
              <div>
                <p className="text-text-primary font-semibold text-[15px]">Noch keine Noten eingetragen</p>
                <p className="text-text-muted text-[13px] mt-0.5">Trag deine Punkte für jedes Fach ein</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Halbjahr tab bar ──────────────────────────────────── */}
        <div>
          <div
            className="flex gap-1.5 pb-2"
            style={{ overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' } as CSSProperties}
          >
            {halbjahre.map((hj) => {
              const isActive = hj.id === activeId
              const pts = overallPunkteAbi(hj.entries)
              const note = pts !== null ? pktToNoteAbi(pts) : null
              return (
                <button
                  key={hj.id}
                  onClick={() => setActiveId(hj.id)}
                  className="flex items-center gap-1.5 rounded-pill shrink-0 press-sm transition-all duration-200"
                  style={{
                    padding: '8px 14px',
                    ...(isActive
                      ? {
                          background: 'linear-gradient(135deg, rgb(var(--color-accent)), rgba(var(--color-accent),0.8))',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(var(--color-accent),0.35)',
                        }
                      : {
                          background: 'rgba(var(--color-border),0.3)',
                          color: 'rgb(var(--color-text-secondary))',
                        }),
                  }}
                >
                  <span className="text-[13px] font-bold">{hj.label}</span>
                  {note && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-pill"
                      style={
                        isActive
                          ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                          : { background: `${noteColorAbi(note)}18`, color: noteColorAbi(note) }
                      }
                    >
                      {note}
                    </span>
                  )}
                  {/* × delete — only on active tab when >1 HJ */}
                  {isActive && halbjahre.length > 1 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); deleteHalbjahr(hj.id) }}
                      className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[11px] font-black press-sm shrink-0"
                      style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
                    >
                      ×
                    </span>
                  )}
                </button>
              )
            })}

            {/* + Halbjahr */}
            <button
              onClick={addHalbjahr}
              className="flex items-center gap-1.5 rounded-pill shrink-0 press-sm transition-all duration-200"
              style={{
                padding: '8px 14px',
                background: 'transparent',
                border: '1.5px dashed rgba(var(--color-border),0.7)',
                color: 'rgb(var(--color-text-muted))',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <span className="text-[12px] font-semibold">Halbjahr</span>
            </button>
          </div>

          {/* Active HJ inline stats */}
          {activeOverall !== null && activeHj && (
            <div className="flex items-center justify-between px-1 py-0.5 mt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-text-secondary">{activeHj.label}</span>
                <span className="text-[12px] font-bold" style={{ color: noteColorAbi(activeNote!) }}>
                  {activeOverall.toFixed(1).replace('.', ',')} Pkt · ≈ {activeNote}
                </span>
              </div>
              <span className="text-[11px] text-text-muted">
                {activeFilledCount}/{activeEntries.length} Fächer
                {activeLkCount > 0 && ` · ${activeLkCount} LK`}
              </span>
            </div>
          )}
        </div>

        {/* ── Subject cards for active HJ ───────────────────────── */}
        {activeEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted text-[13px]">Keine Fächer ausgewählt</p>
            <p className="text-text-muted text-[11px] mt-1">Füge Fächer im Profil hinzu</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              {activeHj?.label ?? ''} — Fächer
            </p>
            {activeEntries.map((entry) => (
              <SubjectCard
                key={`${activeId}-${entry.subjectId}`}
                entry={entry}
                onChange={updateEntry}
              />
            ))}
          </div>
        )}

        {/* ── Grade scale ─────────────────────────────────────────── */}
        <div className="bg-surface border border-border/40 rounded-[14px] px-4 py-3.5">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Punkte → Note</p>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { pts: '15–13', note: '1,0–1,3', color: '#34C759' },
                { pts: '12–10', note: '1,7–2,3', color: '#34C759' },
                { pts: '9–7',   note: '2,7–3,3', color: '#FF9500' },
                { pts: '6–5',   note: '3,7–4,0', color: '#FF3B30' },
              ] as const
            ).map((item) => (
              <div key={item.pts} className="text-center">
                <p className="text-[13px] font-bold text-text-primary">{item.pts}</p>
                <p className="text-[10px] font-semibold" style={{ color: item.color }}>{item.note}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
