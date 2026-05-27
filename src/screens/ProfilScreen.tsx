import { useUser } from '../context/UserContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const STATS_ICONS = ['🔥', '🎙️', '📝', '⭐']
const SETTINGS_ITEMS = ['Fach hinzufügen', 'Bundesland & Lehrplan', 'Benachrichtigungen', 'Datenschutz', 'Account']

export function ProfilScreen() {
  const { profile } = useUser()

  const stats = [
    { label: 'Streak', value: '12 Tage', icon: STATS_ICONS[0] },
    { label: 'Scans', value: '0', icon: STATS_ICONS[1] },
    { label: 'Klausuren', value: '0', icon: STATS_ICONS[2] },
    { label: 'Ø Note', value: '—', icon: STATS_ICONS[3] },
  ]

  const subtitle = profile
    ? `${profile.schulform} · ${profile.klasse}. Klasse · ${profile.bundesland}`
    : 'Gymnasium · 12. Klasse'

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-text-primary">Profil</h1>
      </div>

      {/* User card */}
      <div className="px-4 mb-4">
        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center text-2xl shrink-0">
            🎓
          </div>
          <div className="flex-1">
            <p className="text-text-primary font-semibold text-lg">{profile?.name ?? 'Max Müller'}</p>
            <p className="text-text-muted text-sm">{subtitle}</p>
          </div>
          <Badge color="muted">Free</Badge>
        </Card>
      </div>

      {/* Pro upgrade card */}
      <div
        className="mx-4 mb-6 border border-accent/25 rounded-card p-5"
        style={{ background: 'linear-gradient(135deg, rgba(124,111,255,0.06) 0%, rgba(124,111,255,0.02) 100%)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-accent font-bold text-base">Upgrade auf Pro</p>
            <p className="text-text-secondary text-sm mt-0.5">KI-Features freischalten</p>
          </div>
          <div className="text-right">
            <p className="text-text-primary font-bold text-lg">€5<span className="text-text-muted text-xs font-normal">/Mo</span></p>
            <p className="text-text-muted text-xs">Jährlich abgerechnet</p>
          </div>
        </div>
        <ul className="space-y-2 mb-4">
          {['KI-Zusammenfassungen aus Foto-Scans', 'Unbegrenzte Karteikarten (FSRS)', 'KI-Rotstift-Korrektur', 'Persönlicher Lernplan'].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
        <Button variant="primary" fullWidth>Pro freischalten · €59,99/Jahr</Button>
        <p className="text-center text-xs text-text-muted mt-2">Abi-Schnitt unserer Pro-Nutzer: Ø 1.7</p>
      </div>

      {/* Stats */}
      <div className="px-4 mb-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Statistiken</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-text-primary font-bold text-xl">{stat.value}</p>
              <p className="text-text-muted text-xs mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Einstellungen</h2>
        <div className="bg-surface border border-border rounded-card overflow-hidden divide-y divide-border">
          {SETTINGS_ITEMS.map((item) => (
            <button
              key={item}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-surface-hover transition-colors"
            >
              <span className="text-text-primary text-sm">{item}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
          {/* Reset onboarding (dev helper) */}
          <button
            onClick={() => {
              localStorage.removeItem('lernapp_v1')
              window.location.reload()
            }}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-surface-hover transition-colors"
          >
            <span className="text-danger text-sm">Onboarding zurücksetzen</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
