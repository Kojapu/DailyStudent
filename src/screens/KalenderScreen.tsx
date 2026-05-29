import { useState, useRef } from 'react'
import { Button } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { useUser, type EntryType } from '../context/UserContext'
import { subjects } from '../data/mockData'
import { SUBJECT_INFO } from '../data/subjectInfo'
import type { StundenplanSlot } from '../types'
import { parseStundenplanFromImage } from '../lib/groq'

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const TYPE_CONFIG: Record<EntryType, { label: string; icon: string; color: string }> = {
  lerneinheit: { label: 'Lerneinheit', icon: '📚', color: '#34C759' },
  termin:      { label: 'Termin',      icon: '📅', color: '#007AFF' },
  erinnerung:  { label: 'Erinnerung',  icon: '🔔', color: '#FF9500' },
}

function getWeekDays() {
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function daysUntil(dateStr: string) {
  const exam = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getGreeting(name: string) {
  const h = new Date().getHours()
  const greet = h < 12 ? 'Guten Morgen' : h < 17 ? 'Guten Tag' : 'Guten Abend'
  return `${greet}, ${name}`
}

export function KalenderScreen() {
  const { profile, personalEntries, addEntry, removeEntry, updateProfile } = useUser()
  const weekDays = getWeekDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateStr(today)

  // 0=Mo…4=Fr; null on weekends
  const todayDow = today.getDay()
  const schoolDayIndex: number | null = todayDow >= 1 && todayDow <= 5 ? todayDow - 1 : null
  const todayStundenplanSlots = schoolDayIndex !== null
    ? (profile?.stundenplan?.slots ?? [])
        .filter((s) => s.day === schoolDayIndex)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : []

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<{ title: string; type: EntryType; date: string; time: string }>({
    title: '',
    type: 'lerneinheit',
    date: todayStr,
    time: '',
  })

  const upcomingExams = (profile?.klausurtermine ?? [])
    .map(({ subjectId, date }) => {
      const subject = subjects.find((s) => s.id === subjectId)
      return { subjectId, date, days: daysUntil(date), subject }
    })
    .filter((e) => e.days >= 0 && e.subject)
    .sort((a, b) => a.days - b.days)

  const todayEntries = personalEntries.filter((e) => e.date === todayStr)
  const futureEntries = personalEntries
    .filter((e) => e.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))

  const openModal = (date = todayStr) => {
    setForm({ title: '', type: 'lerneinheit', date, time: '' })
    setModalOpen(true)
  }

  const handleAdd = () => {
    if (!form.title.trim()) return
    addEntry({ id: Date.now().toString(), ...form, title: form.title.trim() })
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-5" style={{ paddingTop: 'max(58px, calc(env(safe-area-inset-top, 0px) + 18px))' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-text-muted">
              {today.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-[28px] font-bold text-text-primary mt-0.5 leading-tight">
              {getGreeting(profile?.name ?? 'Max')}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => openModal()}
              className="w-9 h-9 rounded-full bg-surface shadow-card border border-border/60 flex items-center justify-center press-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-secondary">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-[13px] px-3 py-1.5 rounded-pill bg-warning/10 text-warning font-semibold">🔥 12</span>
          </div>
        </div>
      </div>

      {/* ── Week strip ─────────────────────────────────────────── */}
      <div className="px-5 mt-5 mb-1">
        <div className="flex gap-1.5">
          {weekDays.map((d, i) => {
            const isToday = d.getTime() === today.getTime()
            const dayStr = toDateStr(d)
            const hasEntries = personalEntries.some((e) => e.date === dayStr)
            return (
              <button
                key={i}
                onClick={() => openModal(dayStr)}
                className={`flex-1 flex flex-col items-center py-2.5 rounded-[14px] transition-all duration-200 press-sm relative ${
                  isToday ? 'grad-accent' : 'hover:bg-surface'
                }`}
              >
                <span className={`text-[10px] font-semibold tracking-wide ${isToday ? 'text-white/80' : 'text-text-muted'}`}>
                  {DAY_LABELS[i]}
                </span>
                <span className={`text-[16px] font-bold mt-0.5 leading-none ${isToday ? 'text-white' : 'text-text-secondary'}`}>
                  {d.getDate()}
                </span>
                {hasEntries && (
                  <span
                    className="absolute bottom-1.5 w-1 h-1 rounded-full"
                    style={{ backgroundColor: isToday ? 'rgba(255,255,255,0.7)' : 'rgb(var(--color-accent))' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-5 space-y-7 mt-5">

        {/* ── SmartStundenplan ───────────────────────────────────── */}
        {profile?.stundenplan && profile.stundenplan.slots.length > 0 ? (
          <section>
            <h2 className="section-label mb-3">Heute im Stundenplan</h2>
            {schoolDayIndex === null ? (
              <p className="text-text-muted text-sm">Heute kein Schultag.</p>
            ) : todayStundenplanSlots.length === 0 ? (
              <p className="text-text-muted text-sm">Keine Stunden für heute eingetragen.</p>
            ) : (
              <div
                className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5"
                style={{ scrollbarWidth: 'none' }}
              >
                {todayStundenplanSlots.map((slot) => {
                  const subj = SUBJECT_INFO[slot.subjectId]
                  return (
                    <div
                      key={slot.id}
                      className="flex-shrink-0 bg-surface border border-border/60 rounded-card shadow-card-adaptive p-3.5 flex flex-col gap-1.5 w-[104px]"
                    >
                      <p className="text-text-muted text-[11px] font-medium tabular-nums">{slot.startTime}</p>
                      <div
                        className="w-8 h-8 rounded-btn flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${subj?.color ?? '#7C3AED'}22` }}
                      >
                        {subj?.icon ?? '📚'}
                      </div>
                      <p className="text-text-primary font-semibold text-[12px] leading-tight">{subj?.name ?? slot.subjectId}</p>
                      {slot.room && <p className="text-text-muted text-[11px]">{slot.room}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        ) : (
          <StundenplanSetupWidget
            faecher={profile?.faecher ?? []}
            onSave={(slots) =>
              updateProfile({ stundenplan: { slots, createdAt: new Date().toISOString() } })
            }
          />
        )}

        {/* ── Heute ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-label">Heute</h2>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1 text-[13px] text-accent font-medium press-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Hinzufügen
            </button>
          </div>
          <div className="space-y-2.5">
            {todayEntries.map((entry) => {
              const cfg = TYPE_CONFIG[entry.type]
              return (
                <div
                  key={entry.id}
                  className="bg-surface rounded-card shadow-card-adaptive border border-border/60 p-4 flex items-center gap-4 animate-fade-in"
                >
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center text-lg shrink-0"
                    style={{ background: `linear-gradient(145deg, ${cfg.color}35, ${cfg.color}10)` }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-semibold text-[15px] truncate">{entry.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {entry.time && <p className="text-text-muted text-[12px]">{entry.time} Uhr</p>}
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-pill font-semibold"
                        style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0 press-sm"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )
            })}

            {todayEntries.length === 0 && (
              <button
                onClick={() => openModal()}
                className="w-full border border-dashed border-border rounded-card py-5 flex items-center justify-center gap-2 text-text-muted hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all duration-200 press-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                <span className="text-[13px] font-medium">Eintrag hinzufügen</span>
              </button>
            )}
          </div>
        </section>

        {/* ── Geplant ────────────────────────────────────────────── */}
        {futureEntries.length > 0 && (
          <section>
            <h2 className="section-label mb-3">Geplant</h2>
            <div className="space-y-2.5">
              {futureEntries.map((entry) => {
                const cfg = TYPE_CONFIG[entry.type]
                const d = new Date(entry.date + 'T00:00:00')
                return (
                  <div
                    key={entry.id}
                    className="bg-surface rounded-card shadow-card-adaptive border border-border/60 p-4 flex items-center gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center text-lg shrink-0"
                      style={{ background: `linear-gradient(145deg, ${cfg.color}35, ${cfg.color}10)` }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-semibold text-[15px] truncate">{entry.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-text-muted text-[12px]">
                          {d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                          {entry.time ? `, ${entry.time} Uhr` : ''}
                        </p>
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-pill font-semibold"
                          style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0 press-sm"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Klausuren ──────────────────────────────────────────── */}
        {upcomingExams.length > 0 && (
          <section>
            <h2 className="section-label mb-3">Nächste Klausuren</h2>
            <div className="space-y-2.5">
              {upcomingExams.slice(0, 3).map((exam) => (
                <div
                  key={exam.subjectId + exam.date}
                  className="bg-surface rounded-card shadow-card-adaptive border border-border/60 p-4 flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${exam.subject!.color}18` }}
                  >
                    {exam.subject!.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary font-semibold text-[15px]">{exam.subject!.name}</p>
                    <p className="text-text-muted text-[12px] mt-0.5">
                      {new Date(exam.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
                    </p>
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-pill text-[12px] font-bold shrink-0"
                    style={{ backgroundColor: `${exam.subject!.color}15`, color: exam.subject!.color }}
                  >
                    {exam.days === 0 ? 'Heute' : exam.days === 1 ? 'Morgen' : `${exam.days} Tage`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── KI-Lernvorschlag — Pro teaser ─────────────────────── */}
        <section>
          <h2 className="section-label mb-3">KI-Lernvorschlag</h2>
          <div className="relative overflow-hidden bg-surface rounded-card shadow-card-adaptive border border-border/60 p-5">
            <div className="filter blur-sm pointer-events-none select-none">
              <p className="text-text-primary font-semibold text-[15px] mb-1">Heute: Mathematik — 45 Min</p>
              <p className="text-text-secondary text-[13px]">Fokus Integralrechnung · 3 Karteikarten · 1 Aufgabe</p>
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-28 bg-accent/10 rounded-btn" />
                <div className="h-8 w-20 bg-surface-hover rounded-btn" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-surface/95 border border-border rounded-[14px] px-4 py-2.5 shadow-float">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
                </svg>
                <span className="text-accent text-[13px] font-semibold">Pro freischalten</span>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── Add Entry Modal ─────────────────────────────────────── */}
      <BottomSheet isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="px-5 pb-2">
          <h2 className="text-[20px] font-bold text-text-primary mb-5">Eintrag hinzufügen</h2>

          <div className="flex gap-2 mb-4">
            {(Object.entries(TYPE_CONFIG) as [EntryType, typeof TYPE_CONFIG['lerneinheit']][]).map(([type, cfg]) => (
              <button
                key={type}
                onClick={() => setForm((f) => ({ ...f, type }))}
                className={`flex-1 py-2.5 rounded-btn text-[12px] font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150 press-sm ${
                  form.type === type
                    ? 'text-white border-transparent shadow-sm'
                    : 'border-border text-text-secondary hover:bg-surface-hover'
                }`}
                style={form.type === type ? { backgroundColor: cfg.color } : undefined}
              >
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={
              form.type === 'lerneinheit' ? 'z.B. Geschichte Karteikarten' :
              form.type === 'termin' ? 'z.B. Nachhilfe bei Frau Müller' :
              'z.B. Lernplan aktualisieren'
            }
            className="w-full bg-background border border-border rounded-card px-4 py-3 text-text-primary placeholder-text-muted mb-3 focus:outline-none focus:border-accent transition-colors"
          />

          <div className="flex gap-3 mb-5">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="flex-1 bg-background border border-border rounded-card px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              className="w-32 bg-background border border-border rounded-card px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <Button variant="primary" fullWidth onClick={handleAdd} disabled={!form.title.trim()}>
            Hinzufügen
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

/* ─── SmartStundenplan Setup Widget ──────────────────────── */

const SP_DAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr'] as const

function StundenplanSetupWidget({
  faecher,
  onSave,
}: {
  faecher: string[]
  onSave: (slots: StundenplanSlot[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'choose' | 'manual' | 'scan'>('choose')
  const [slots, setSlots] = useState<StundenplanSlot[]>([])
  const [activeDay, setActiveDay] = useState(0)
  const [addingSlot, setAddingSlot] = useState(false)
  const [newSlot, setNewSlot] = useState({ startTime: '08:00', endTime: '08:45', subjectId: '', room: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  const [scanFile, setScanFile] = useState<File | null>(null)
  const [scanPhase, setScanPhase] = useState<'idle' | 'analyzing' | 'error'>('idle')
  const [scanError, setScanError] = useState('')
  const [fromAI, setFromAI] = useState(false)

  const profileSubjects = faecher
    .map((id) => (SUBJECT_INFO[id] ? { id, ...SUBJECT_INFO[id] } : null))
    .filter((s): s is { id: string; name: string; icon: string; color: string } => s !== null)

  const daySlots = slots
    .filter((s) => s.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const totalSlots = slots.length

  const handleStartTime = (startTime: string) => {
    const [h, m] = startTime.split(':').map(Number)
    const endMin = h * 60 + m + 45
    const endTime = `${String(Math.floor(endMin / 60) % 24).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`
    setNewSlot((n) => ({ ...n, startTime, endTime }))
  }

  const commitSlot = () => {
    if (!newSlot.subjectId) return
    const slot: StundenplanSlot = {
      id: `slot-${Date.now()}`,
      day: activeDay,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      subjectId: newSlot.subjectId,
      room: newSlot.room || undefined,
    }
    setSlots((prev) => [...prev, slot])
    setAddingSlot(false)
    setNewSlot({ startTime: '08:00', endTime: '08:45', subjectId: '', room: '' })
  }

  const removeSlot = (id: string) => setSlots((prev) => prev.filter((s) => s.id !== id))

  const handleSave = () => {
    if (totalSlots > 0) onSave(slots)
  }

  const handleClose = () => {
    setOpen(false)
    setMode('choose')
    setAddingSlot(false)
  }

  const handleScanFileSelect = async (file: File) => {
    setScanFile(file)
    setScanPhase('analyzing')
    setScanError('')
    try {
      const detected = await parseStundenplanFromImage(file, profileSubjects)
      setSlots(detected)
      setFromAI(true)
      setMode('manual')
      setScanPhase('idle')
    } catch (err) {
      setScanPhase('error')
      setScanError(err instanceof Error ? err.message : 'Analyse fehlgeschlagen')
    }
  }

  return (
    <section>
      {/* Collapsed pill ───────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 bg-surface border border-border/60 rounded-[20px] shadow-card-adaptive px-5 py-4 text-left hover:bg-surface-hover active:scale-[0.99] transition-all duration-200"
      >
        <div className="w-10 h-10 rounded-[12px] bg-accent/10 flex items-center justify-center text-xl shrink-0">
          🗓️
        </div>
        <div className="flex-1">
          <p className="text-text-primary font-semibold text-[15px]">Stundenplan einrichten</p>
          <p className="text-text-muted text-[12px] mt-0.5">Dein Schultag auf einen Blick</p>
        </div>
        <svg
          className={`text-text-muted shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded panel ───────────────────────────────── */}
      {open && (
        <div className="mt-1.5 bg-surface border border-border/60 rounded-[20px] shadow-card-adaptive overflow-hidden animate-fade-in">

          {/* ── CHOOSE ─────────────────────────────────── */}
          {mode === 'choose' && (
            <div className="p-4 space-y-2">
              <button
                onClick={() => setMode('manual')}
                className="w-full flex items-center gap-3 bg-background border border-border rounded-[14px] px-4 py-3.5 text-left hover:bg-surface-hover active:scale-[0.98] transition-all"
              >
                <span className="text-xl shrink-0">✏️</span>
                <div className="flex-1">
                  <p className="text-text-primary font-semibold text-[14px]">Manuell eintragen</p>
                  <p className="text-text-muted text-[12px] mt-0.5">Fächer und Zeiten eingeben</p>
                </div>
                <svg className="text-text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => setMode('scan')}
                className="w-full flex items-center gap-3 bg-background border border-border rounded-[14px] px-4 py-3.5 text-left hover:bg-surface-hover active:scale-[0.98] transition-all"
              >
                <span className="text-xl shrink-0">📷</span>
                <div className="flex-1">
                  <p className="text-text-primary font-semibold text-[14px]">Foto / Scan hochladen</p>
                  <p className="text-text-muted text-[12px] mt-0.5">Stundenplan fotografieren oder PDF</p>
                </div>
                <svg className="text-text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2.5 text-center text-[13px] text-text-muted hover:text-text-secondary transition-colors"
              >
                Schließen
              </button>
            </div>
          )}

          {/* ── SCAN ───────────────────────────────────── */}
          {mode === 'scan' && (
            <div className="p-4 space-y-3">
              <button
                onClick={() => { setMode('choose'); setScanPhase('idle'); setScanError(''); setScanFile(null) }}
                className="flex items-center gap-1.5 text-text-muted text-sm hover:text-text-secondary transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Zurück
              </button>

              {/* IDLE — upload area */}
              {scanPhase === 'idle' && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-[16px] p-6 flex flex-col items-center gap-2 hover:border-accent/50 hover:bg-accent/5 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl">📷</div>
                  <p className="text-text-primary font-semibold text-[14px]">Foto oder PDF auswählen</p>
                  <p className="text-text-muted text-xs">KI erkennt Fächer und Zeiten automatisch</p>
                </button>
              )}

              {/* ANALYZING — spinner */}
              {scanPhase === 'analyzing' && (
                <div className="bg-background border border-border rounded-[16px] p-5 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-accent/25 border-t-accent rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-text-primary font-semibold text-[14px]">KI analysiert Stundenplan…</p>
                    <p className="text-text-muted text-[12px] mt-0.5 truncate max-w-[200px]">{scanFile?.name}</p>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {scanPhase === 'error' && (
                <div className="space-y-2">
                  <div className="rounded-[14px] p-4" style={{ background: 'rgba(var(--color-danger),0.08)', border: '1px solid rgba(var(--color-danger),0.25)' }}>
                    <p className="text-text-primary font-semibold text-[14px] mb-1">Erkennung fehlgeschlagen</p>
                    <p className="text-text-muted text-[12px] leading-relaxed">{scanError}</p>
                  </div>
                  <button
                    onClick={() => { setScanPhase('idle'); setScanFile(null); setScanError('') }}
                    className="w-full py-2.5 rounded-[12px] grad-accent text-white text-sm font-semibold active:scale-95 transition-all"
                  >
                    Erneut versuchen
                  </button>
                  <button
                    onClick={() => { setMode('manual'); setScanPhase('idle'); setScanError('') }}
                    className="w-full py-2.5 rounded-[12px] border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover transition-colors"
                  >
                    Manuell eintragen
                  </button>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleScanFileSelect(f) }}
              />
            </div>
          )}

          {/* ── MANUAL ─────────────────────────────────── */}
          {mode === 'manual' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setMode('choose'); setAddingSlot(false); setFromAI(false) }}
                  className="flex items-center gap-1.5 text-text-muted text-sm hover:text-text-secondary transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Zurück
                </button>
                {totalSlots > 0 && !addingSlot && (
                  <button
                    onClick={handleSave}
                    className="px-3.5 py-1.5 rounded-pill grad-accent text-white text-[12px] font-semibold press-sm"
                  >
                    Speichern · {totalSlots} Std
                  </button>
                )}
              </div>

              {/* KI success banner */}
              {fromAI && totalSlots > 0 && (
                <div className="rounded-[12px] px-3 py-2.5 flex items-center gap-2" style={{ background: 'rgba(var(--color-success),0.08)', border: '1px solid rgba(var(--color-success),0.25)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success shrink-0">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[12px] font-medium text-success">{totalSlots} Stunden erkannt — prüfen & anpassen</p>
                </div>
              )}

              {/* Day tabs */}
              <div className="flex gap-1">
                {SP_DAY_SHORT.map((d, i) => {
                  const count = slots.filter((s) => s.day === i).length
                  return (
                    <button
                      key={d}
                      onClick={() => { setActiveDay(i); setAddingSlot(false) }}
                      className={`flex-1 flex flex-col items-center py-2 rounded-[12px] transition-all duration-200 ${
                        activeDay === i ? 'grad-accent' : 'bg-background border border-border hover:bg-surface-hover'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold ${activeDay === i ? 'text-white/80' : 'text-text-muted'}`}>{d}</span>
                      <span className={`text-[12px] font-bold mt-0.5 ${activeDay === i ? 'text-white' : count > 0 ? 'text-accent' : 'text-text-muted/30'}`}>
                        {count > 0 ? count : '·'}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Slot list */}
              {daySlots.length > 0 && (
                <div className="space-y-1.5">
                  {daySlots.map((slot) => {
                    const subj = SUBJECT_INFO[slot.subjectId]
                    return (
                      <div key={slot.id} className="bg-background border border-border/60 rounded-[12px] p-3 flex items-center gap-2.5 animate-fade-in">
                        <div
                          className="w-8 h-8 rounded-btn flex items-center justify-center text-base shrink-0"
                          style={{ backgroundColor: `${subj?.color ?? '#7C3AED'}22` }}
                        >
                          {subj?.icon ?? '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary font-semibold text-[13px]">{subj?.name ?? slot.subjectId}</p>
                          <p className="text-text-muted text-[11px]">
                            {slot.startTime} – {slot.endTime}{slot.room ? ` · ${slot.room}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-danger transition-colors shrink-0"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add slot trigger or inline form */}
              {!addingSlot ? (
                <button
                  onClick={() => setAddingSlot(true)}
                  className="w-full border border-dashed border-border rounded-[12px] py-3 flex items-center justify-center gap-2 text-text-muted hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  <span className="text-[13px] font-medium">Stunde hinzufügen</span>
                </button>
              ) : (
                <div className="bg-background border border-accent/30 rounded-[14px] p-3.5 space-y-2.5">
                  {/* Time row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Von</p>
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => handleStartTime(e.target.value)}
                        className="w-full bg-surface border border-border rounded-[10px] px-2.5 py-2 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Bis</p>
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot((n) => ({ ...n, endTime: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-[10px] px-2.5 py-2 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject grid */}
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Fach</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {profileSubjects.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setNewSlot((n) => ({ ...n, subjectId: s.id }))}
                        className={`flex items-center gap-1.5 p-2 rounded-[10px] border text-left transition-all duration-150 ${
                          newSlot.subjectId === s.id
                            ? 'border-accent bg-accent-soft'
                            : 'border-border bg-surface hover:bg-surface-hover'
                        }`}
                      >
                        <span className="text-sm shrink-0">{s.icon}</span>
                        <span className={`text-[10px] font-medium leading-tight truncate ${newSlot.subjectId === s.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Room */}
                  <input
                    type="text"
                    value={newSlot.room}
                    onChange={(e) => setNewSlot((n) => ({ ...n, room: e.target.value }))}
                    placeholder="Raum (optional)"
                    className="w-full bg-surface border border-border rounded-[10px] px-2.5 py-2 text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAddingSlot(false)
                        setNewSlot({ startTime: '08:00', endTime: '08:45', subjectId: '', room: '' })
                      }}
                      className="flex-1 py-2 rounded-[10px] border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={commitSlot}
                      disabled={!newSlot.subjectId}
                      className="flex-1 py-2 rounded-[10px] grad-accent text-white text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              )}

              {/* Save button */}
              {totalSlots > 0 && !addingSlot && (
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-[14px] grad-accent text-white text-[14px] font-semibold press-sm"
                >
                  Stundenplan speichern · {totalSlots} Stunde{totalSlots === 1 ? '' : 'n'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
