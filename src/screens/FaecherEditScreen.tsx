import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { SUBJECT_INFO, SUBJECT_GROUPS } from '../data/subjectInfo'
import { BottomSheet } from '../components/ui/BottomSheet'

export function FaecherEditScreen() {
  const navigate = useNavigate()
  const { profile, applyFaecherChanges } = useUser()

  const [selectedFaecher, setSelectedFaecher] = useState<string[]>([...(profile?.faecher ?? [])])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (!profile) return null

  function handleToggle(id: string) {
    if (selectedFaecher.includes(id)) {
      if (profile!.faecher.includes(id)) {
        setConfirmDelete(id)
      } else {
        setSelectedFaecher((prev) => prev.filter((f) => f !== id))
      }
    } else {
      setSelectedFaecher((prev) => [...prev, id])
    }
  }

  function handleConfirmDelete() {
    if (!confirmDelete) return
    setSelectedFaecher((prev) => prev.filter((f) => f !== confirmDelete))
    setConfirmDelete(null)
  }

  function handleSave() {
    const deletedIds = profile!.faecher.filter((id) => !selectedFaecher.includes(id))
    applyFaecherChanges(selectedFaecher, deletedIds)
    navigate(-1)
  }

  const confirmSubject = confirmDelete ? SUBJECT_INFO[confirmDelete] : null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 pt-14 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-accent font-medium text-[15px] press-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Zurück
          </button>
          <button
            onClick={handleSave}
            disabled={selectedFaecher.length === 0}
            className="px-4 py-1.5 rounded-pill bg-accent text-white text-[14px] font-semibold press-sm disabled:opacity-40"
          >
            Fertig
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-10 overflow-y-auto">
        <h1 className="text-[28px] font-bold text-text-primary mb-1">Deine Fächer</h1>
        <p className="text-text-muted text-sm mb-6">
          Fächer hinzufügen oder entfernen.{' '}
          <span className="text-accent font-medium">{selectedFaecher.length} ausgewählt</span>
        </p>

        <div className="space-y-5">
          {SUBJECT_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {group.ids.map((id) => {
                  const subject = SUBJECT_INFO[id]
                  const active = selectedFaecher.includes(id)
                  const isExisting = profile.faecher.includes(id)
                  const markedForDelete = isExisting && !active
                  return (
                    <button
                      key={id}
                      onClick={() => handleToggle(id)}
                      className={`relative flex items-center gap-3 p-3 rounded-card border text-left transition-all duration-150 press-sm ${
                        active
                          ? 'border-accent bg-accent-soft'
                          : markedForDelete
                          ? 'border-danger/40 bg-danger/5'
                          : 'border-border bg-surface hover:bg-surface-hover'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-btn flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: `${subject.color}22` }}
                      >
                        {subject.icon}
                      </div>
                      <p className={`text-xs font-semibold leading-tight ${
                        active ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        {subject.name}
                      </p>
                      {active && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full grad-accent flex items-center justify-center shrink-0">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                      {markedForDelete && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-danger/15 flex items-center justify-center shrink-0">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FF453A" strokeWidth="3">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Info note about folder creation */}
        <div className="mt-6 px-4 py-3 rounded-card bg-surface border border-border/60">
          <p className="text-xs text-text-muted leading-relaxed">
            Neue Fächer erhalten automatisch Ordner nach deinem gewählten Sortiermodus ({profile.folderSortMode === 'manual' ? 'Manuell' : 'Halbjahr/Quartale'}).
          </p>
        </div>
      </div>

      {/* Deletion confirmation sheet */}
      <BottomSheet isOpen={confirmDelete !== null} onClose={() => setConfirmDelete(null)}>
        <div className="px-5 pb-2 pt-1">
          <div className="flex items-center gap-3 mb-4">
            {confirmSubject && (
              <div
                className="w-10 h-10 rounded-btn flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${confirmSubject.color}22` }}
              >
                {confirmSubject.icon}
              </div>
            )}
            <div>
              <p className="text-text-primary font-bold text-[16px]">
                {confirmSubject?.name} entfernen?
              </p>
              <p className="text-text-muted text-[13px] mt-0.5">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </div>
          </div>

          <div className="px-4 py-3 rounded-card bg-danger/8 border border-danger/20 mb-5">
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Alle Ordner und Smart Notes für <span className="font-semibold text-text-primary">{confirmSubject?.name}</span> werden endgültig gelöscht.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pb-2">
            <button
              onClick={handleConfirmDelete}
              className="w-full py-3.5 rounded-card text-[15px] font-semibold text-white press-sm"
              style={{ backgroundColor: '#FF453A' }}
            >
              Fach & Daten löschen
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="w-full py-3.5 rounded-card text-[15px] font-semibold text-text-primary bg-surface border border-border press-sm"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
