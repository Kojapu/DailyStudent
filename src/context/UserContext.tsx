import { createContext, useContext, useState } from 'react'
import { type ReactNode } from 'react'

export type EntryType = 'lerneinheit' | 'termin' | 'erinnerung'

export interface PersonalEntry {
  id: string
  title: string
  type: EntryType
  date: string
  time: string
}

export interface UserProfile {
  name: string
  klasse: string
  schulform: string
  bundesland: string
  bundeslandId: string
  faecher: string[]
  klausurtermine: { subjectId: string; date: string }[]
}

interface UserContextValue {
  profile: UserProfile | null
  isOnboarded: boolean
  personalEntries: PersonalEntry[]
  completeOnboarding: (profile: UserProfile) => void
  updateProfile: (data: Partial<UserProfile>) => void
  addEntry: (entry: PersonalEntry) => void
  removeEntry: (id: string) => void
}

const STORAGE_KEY = 'lernapp_v1'

function loadStorage(): { profile?: UserProfile; personalEntries?: PersonalEntry[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStorage(data: { profile: UserProfile | null; personalEntries: PersonalEntry[] }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const stored = loadStorage()
  const [profile, setProfile] = useState<UserProfile | null>(stored.profile ?? null)
  const [personalEntries, setPersonalEntries] = useState<PersonalEntry[]>(stored.personalEntries ?? [])

  const persist = (p: UserProfile | null, e: PersonalEntry[]) => saveStorage({ profile: p, personalEntries: e })

  const completeOnboarding = (p: UserProfile) => {
    setProfile(p)
    persist(p, personalEntries)
  }

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!profile) return
    const updated = { ...profile, ...data }
    setProfile(updated)
    persist(updated, personalEntries)
  }

  const addEntry = (entry: PersonalEntry) => {
    const updated = [...personalEntries, entry]
    setPersonalEntries(updated)
    persist(profile, updated)
  }

  const removeEntry = (id: string) => {
    const updated = personalEntries.filter((e) => e.id !== id)
    setPersonalEntries(updated)
    persist(profile, updated)
  }

  return (
    <UserContext.Provider value={{ profile, isOnboarded: profile !== null, personalEntries, completeOnboarding, updateProfile, addEntry, removeEntry }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be within UserProvider')
  return ctx
}
