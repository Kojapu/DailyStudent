export const SUBJECT_INFO: Record<string, { name: string; icon: string; color: string }> = {
  deutsch:      { name: 'Deutsch',          icon: '📖', color: '#4ADE80' },
  mathematik:   { name: 'Mathematik',       icon: '📐', color: '#6366F1' },
  englisch:     { name: 'Englisch',         icon: '🌍', color: '#38BDF8' },
  franzoesisch: { name: 'Französisch',      icon: '🗼', color: '#2DD4BF' },
  latein:       { name: 'Latein',           icon: '🏺', color: '#C084FC' },
  spanisch:     { name: 'Spanisch',         icon: '🌶️', color: '#059669' },
  biologie:     { name: 'Biologie',         icon: '🧬', color: '#FACC15' },
  chemie:       { name: 'Chemie',           icon: '🧪', color: '#34D399' },
  physik:       { name: 'Physik',           icon: '⚛️', color: '#818CF8' },
  geschichte:   { name: 'Geschichte',       icon: '🏛️', color: '#F87171' },
  politik:      { name: 'Politik / Soz.',   icon: '⚖️', color: '#6366F1' },
  geographie:   { name: 'Geographie',       icon: '🗺️', color: '#A78BFA' },
  kunst:        { name: 'Kunst',            icon: '🎨', color: '#E879F9' },
  musik:        { name: 'Musik',            icon: '🎵', color: '#EC4899' },
  sport:        { name: 'Sport',            icon: '🏃', color: '#F472B6' },
  religion:     { name: 'Religion / Ethik', icon: '🙏', color: '#D97706' },
  informatik:   { name: 'Informatik',       icon: '💻', color: '#60A5FA' },
  wirtschaft:   { name: 'Wirtschaft',       icon: '📊', color: '#FB923C' },
}

export const SUBJECT_GROUPS = [
  { label: 'Kernfächer',            ids: ['deutsch', 'mathematik', 'englisch'] },
  { label: 'Sprachen',              ids: ['franzoesisch', 'latein', 'spanisch'] },
  { label: 'Naturwissenschaften',   ids: ['biologie', 'chemie', 'physik'] },
  { label: 'Gesellschaftswiss.',    ids: ['geschichte', 'politik', 'geographie'] },
  { label: 'Kunst & Sport',         ids: ['kunst', 'musik', 'sport', 'religion'] },
  { label: 'Weiteres',              ids: ['informatik', 'wirtschaft'] },
]
