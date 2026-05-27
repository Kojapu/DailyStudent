import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/ui/Header'
import { Badge } from '../components/ui/Badge'
import { useUser } from '../context/UserContext'
import { subjects } from '../data/mockData'

export function FolderScreen() {
  const { id, folderId } = useParams<{ id: string; folderId: string }>()
  const navigate = useNavigate()
  const { userFolders, userNotes } = useUser()

  const subject = subjects.find((s) => s.id === id)
  const folder = userFolders.find((f) => f.id === folderId)
  const folderNotes = userNotes.filter((n) => n.folderId === folderId)

  if (!subject || !folder) {
    return <div className="p-4 text-text-secondary">Ordner nicht gefunden.</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <Header
        title={folder.name}
        subtitle={subject.name}
        showBack
        right={
          <div
            className="w-10 h-10 rounded-btn flex items-center justify-center text-xl"
            style={{ backgroundColor: `${subject.color}22` }}
          >
            {subject.icon}
          </div>
        }
      />

      <div className="px-4 space-y-2 mt-2">
        {folderNotes.map((note) => (
          <button
            key={note.id}
            onClick={() => navigate(`/unterricht/${id}/${note.id}`)}
            className="w-full bg-surface border border-border rounded-card p-4 text-left hover:bg-surface-hover active:scale-95 transition-all duration-150 flex items-start gap-4"
          >
            <div className="flex flex-col items-center gap-1 shrink-0 text-center min-w-[40px]">
              <span className="text-xs text-text-muted">
                {new Date(note.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
              </span>
              <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: subject.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-text-primary font-medium text-sm">{note.title}</p>
                {note.attachment && <Badge color="muted">Foto</Badge>}
                {note.content && <Badge color="accent">Notiz</Badge>}
              </div>
              {note.content ? (
                <p className="text-text-muted text-xs mt-1 truncate">{note.content}</p>
              ) : (
                <p className="text-text-muted text-xs mt-1">Eigene Notiz</p>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0 mt-1">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}

        {folderNotes.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            Noch keine Notizen in diesem Ordner.<br />
            Tippe auf „+" um die erste zu erstellen.
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate(`/unterricht/${id}/ordner/${folderId}/neue-notiz`)}
        className="fixed bottom-24 right-4 bg-accent text-white rounded-pill px-5 py-3 font-semibold text-sm shadow-lg shadow-accent/30 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Neue Notiz
      </button>
    </div>
  )
}
