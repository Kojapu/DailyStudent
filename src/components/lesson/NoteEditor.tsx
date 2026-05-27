// 🚧 TODO: connect to real note editing with auto-save

interface NoteEditorProps {
  value: string
  placeholder?: string
}

export function NoteEditor({ value, placeholder }: NoteEditorProps) {
  return (
    <textarea
      defaultValue={value}
      placeholder={placeholder ?? 'Notizen hinzufügen...'}
      className="w-full min-h-[120px] bg-surface border border-border rounded-card p-3 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-colors"
    />
  )
}
