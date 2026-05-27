# Lernapp — Blueprint v1

KI-basierte Lernplattform für leistungsorientierte Schüler. Navigierbarer Prototyp — kein fertiges Produkt.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v3
- React Router v6

## Setup

```bash
npm install
npm run dev
```

Öffne `http://localhost:5173`

## Screens

| Route | Screen | Beschreibung |
|-------|--------|-------------|
| `/` | HomeScreen | Begrüßung, Streak, Heute-Übersicht, Letzte Aktivität |
| `/faecher` | SubjectListScreen | Grid aller Fächer mit Farb-Akzenten |
| `/faecher/:id` | LessonScreen | Stundenliste eines Fachs + FAB |
| `/faecher/:id/:lessonId` | SmartNotesScreen | Kollabierbare Notiz-Sektionen + Audio-Widget |
| `/lernen` | LearnModeScreen | Karteikarten-Flip + Klausur-Tab |
| `/klausur` | ExamModeScreen | Vollbild-Klausursimulation mit Timer + Fortschritt |
| `/klausur/ergebnis` | ExamResultScreen | KI-Korrektur mit Score, Note, Stärken/Schwächen |

## Projektstruktur

```
src/
  app/            ← Root-Router (App.tsx)
  screens/        ← Ein File pro Screen
  components/
    ui/           ← Button, Card, Badge, BottomNav, Header
    lesson/       ← AudioRecorderWidget, NoteEditor
    learn/        ← FlashCard, ExamQuestion, AIFeedbackCard
  data/           ← mockData.ts (alle Inhalte hier)
  types/          ← Shared TypeScript Interfaces
  styles/         ← theme.ts (Design-Tokens)
```

## Next Steps (TODO)

- [ ] **Whisper on-device**: AudioRecorderWidget an Web Audio API + whisper.cpp anbinden (DSGVO-konform, da on-device)
- [ ] **Cloud-Pipeline**: Qwen2-VL OCR + Llama 3.3 via Groq für Notiz-Synthese integrieren
- [ ] **Dynamic Scheduling**: Rückwärts-Lernplan aus Klausurdatum berechnen, Streak-Logik
- [ ] **Echter Klausur-Modus**: Timer-Logik, Antworten speichern, mehrere Aufgaben
- [ ] **KI-Korrektur**: Echte API-Anbindung mit Erwartungshorizont-Prompt
- [ ] **Authentifizierung**: User-Accounts, Datenpersistenz
- [ ] **Bundesland/Lehrplan-Auswahl**: Onboarding-Flow
- [ ] **Profil-Screen**: Einstellungen, Statistiken
- [ ] **Hausaufgaben-Scanner**: Foto → OCR → KI-Erklärung
