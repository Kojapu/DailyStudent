# CLAUDE.md — DailyStudent App Context

> Lies diese Datei zu Beginn jeder Session vollständig durch, bevor du irgendwelchen Code schreibst oder Änderungen machst.

---

## Was ist DailyStudent?

Eine KI-gestützte Lernplattform für deutsche Abiturschüler (Klasse 10–13).  
Zwei Kernphasen: **Unterrichtsphase** (Foto-Scan von Tafelbildern → Smart Notes) und **Klausurenphase** (AFB-basierte Probeklausuren, KI-Korrektur, Karteikarten).

**Zielgruppe:** Gymnasiasten in Deutschland  
**Wachstumshebel:** Discord-Community mit 5.000+ Schülern  
**Monetarisierung:** Freemium — Free Tier mit Blur-Paywall, Pro für €7,99/Mo oder €59,99/Jahr

---

## Tech Stack

| Was | Womit |
|-----|-------|
| Framework | React + TypeScript |
| Styling | Tailwind CSS |
| Build Tool | Vite |
| Routing | React Router |
| Persistenz (aktuell) | localStorage (`lernapp_v1`) |
| KI (Phase 2) | Groq API — Llama 3.3 70B (Text) + Llama 3.2 Vision (Bilder) |
| Auth + DB (Phase 3) | Supabase |
| Payments (Phase 3) | Stripe |
| Dev Server | localhost:5174 |
| Repo | https://github.com/simonhapp-ai/DailyStudent.git |
| Projektordner | C:\Users\simon\OneDrive\Desktop\Claude App |

---

## Aktueller Stand — Phase 1 FERTIG

### Was wirklich funktioniert:
- 4-Tab Navigation (Kalender / Unterricht / Klausur / Profil)
- React Router mit allen 9 Routen
- Onboarding Gate (5-Schritt Wizard — blockiert App bis fertig)
- Onboarding: Name, Klasse (10–13), Schulform, Bundesland (alle 16), Fächer-Multiselect, Klausurtermin
- localStorage Persistenz komplett
- Profil zeigt echte Nutzerdaten
- Kalender: Wochenstreifen, Dot-Indikatoren, Einträge hinzufügen/löschen
- Unterricht: Halbjahr-Selector, Fach → Themen-Tree expandierbar
- FotoScannerWidget: Dateiauswahl + Preview funktioniert (kein AI dahinter)
- Karteikarten-Flip UI (CSS 3D-Animation)
- Exam-Flow UI (Multi-Fragen, Fortschrittsbalken, Textfeld)
- Pro Paywall Blur-Pattern + ProModal (UI-Logik funktioniert)
- PWA Manifest + iOS Meta Tags
- 0 TypeScript Errors

### Was gemockt ist (realistisch aussehende Placeholder-Daten):
- Klausur-Countdown-Cards → hardcoded Daten aus `mockData.ts`
- KC-Themen → 17 hardcoded Topics, nur Bayern, nur 5 Fächer
- Lektionen → nur Geschichte + Mathe hardcoded
- Smart Notes Inhalt → nur `l1` hat echten Text, alle anderen fallen auf denselben Note zurück
- Karteikarten → nur Geschichte hardcoded
- Klausurfragen → 3 hardcoded Geschichte-Fragen
- Klausurergebnis → immer "13/15 · 1+", ignoriert echte Antworten
- KI-Korrektur → hardcoded Stärken/Schwächen
- KI-Lernvorschlag → Blur-Teaser, kein AI dahinter
- Timer → zeigt "45:00", läuft nicht
- Streak → hardcoded "12 Tage"
- Stats → Scans "0", Klausuren "0", Ø Note "—" (nicht getrackt)

### Was komplett fehlt:
- Jegliche AI-Pipeline (kein einziger echter API-Call)
- FSRS Spaced-Repetition Algorithmus
- Foto → Smart Notes Pipeline
- KC-Datenbank für alle 16 Bundesländer
- Supabase Auth + DB
- Stripe Payments
- Push-Benachrichtigungen

---

## Phase 2 — Was jetzt gebaut wird

**Prioritätsreihenfolge:**

### 1. Groq Integration — Foto → Smart Notes
- Groq API Key liegt in `.env` als `VITE_GROQ_API_KEY`
- FotoScannerWidget: Bild → Base64 → Groq Vision (Llama 3.2 Vision) → OCR des Tafelbildes
- Ergebnis → Llama 3.3 70B → strukturierte Smart Note (Zusammenfassung, Schlüsselbegriffe, Klausurthemen)
- Smart Note in localStorage speichern, in SmartNotesScreen anzeigen
- Free User: Zusammenfassung blurred → Pro required

### 2. Karteikarten aus Smart Notes generieren
- Aus jeder gespeicherten Smart Note → Groq generiert 5–10 Karteikarten
- FSRS-Algorithmus implementieren (Spaced Repetition)
- "Weiß ich" / "Nochmal" Buttons verschiebt nächste Wiederholung korrekt
- Streak-Tracking wird echt (localStorage)

### 3. Echter Exam Timer + KI-Korrektur
- Timer läuft wirklich runter (mit Pause/Stop)
- Klausurfragen werden aus Smart Notes generiert (Groq), nicht mehr hardcoded
- Nutzerantwort → Groq → echtes AFB-basiertes Feedback
- Note wird berechnet

### 4. Stats tracken
- Scan-Counter, Klausur-Counter, Ø-Note — alles in localStorage

**Phase 3 (NOCH NICHT JETZT):** Supabase Auth, Stripe Payments, Deployment

---

## Architektur-Entscheidungen (nicht ändern ohne Rückfrage)

- **localStorage Key:** `lernapp_v1` — Schema nicht brechen, Migration schreiben wenn nötig
- **Pro-Flag:** aktuell `const IS_PRO = false` in einer zentralen Stelle — bleibt so bis Stripe kommt
- **Kein Backend eigener Server** — alles Client-Side bis Phase 3
- **Groq statt OpenAI** — bewusste Entscheidung wegen Kosten und Geschwindigkeit
- **Blur-Paywall Pattern** — beibehalten für alle AI-Features bei Free-Usern
- **TypeScript strict** — keine `any` Types einbauen

---

## Umgebungsvariablen

```
VITE_GROQ_API_KEY=...        # Groq API Key (Text + Vision)
```

`.env` liegt im Root-Verzeichnis. Nie in Git committen (ist in `.gitignore`).

---

## Wichtige Dateien / Struktur

```
src/
├── components/          # Wiederverwendbare UI-Komponenten
│   ├── FotoScannerWidget.tsx
│   ├── FlashCard.tsx
│   ├── AudioRecorderWidget.tsx
│   └── ProModal.tsx
├── screens/             # Alle Screens (1 pro Route)
│   ├── SmartNotesScreen.tsx
│   ├── LearnModeScreen.tsx
│   ├── ExamModeScreen.tsx
│   └── ...
├── data/
│   └── mockData.ts      # Alle Placeholder-Daten — Phase 2 ersetzt diese schrittweise
├── hooks/               # Custom React Hooks
└── App.tsx              # Router + Navigation
```

---

## Developer-Kontext

- **Entwickler:** Simon, kein Coding-Background — arbeitet mit Claude Code in VS Code
- **Workflow:** Claude Code baut, Simon reviewed im Browser (localhost:5174), dann git commit + push
- **Git:** `git add . && git commit -m "..." && git push`
- **Wichtig:** Immer erklären was du gebaut hast und warum — keine stillen Änderungen

---

## Letzte Session

- Phase 1 komplett fertig und auf GitHub gepusht
- Dieser Zwischenstand wurde dokumentiert
- Nächster Schritt: Groq API Key eintragen → `.env` anlegen → Groq Integration starten
