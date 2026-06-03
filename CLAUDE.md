# CLAUDE.md — DailyStudent App Context

> Lies diese Datei zu Beginn jeder Session vollständig durch, bevor du irgendwelchen Code schreibst oder Änderungen machst.

---

## Was ist DailyStudent?

DailyStudent ist ein **personalisiertes, KI-gestütztes Lernökosystem** für deutsche Schüler (Klasse 10–13, primär Oberstufe/Abi) und zukünftig auch Studenten.

Die App bietet keinen einzelnen Lernweg, sondern einen **vernetzten Mix aus Lernstrategien**, die sich an die individuelle Lage des Schülers anpassen:
- Wie viel Zeit bleibt bis zur Klausur?
- Was wurde im Unterricht behandelt (Smart Notes)?
- Welche Themen stehen laut Kerncurriculum (KC) des Bundeslandes an?
- Welches Fach ist das schwächste?

**Das Ergebnis** ist ein kohärentes System, in dem jeder Output (Karteikarten, Probeklausur, Lernzettel, Lernplan) auf denselben Inputs basiert: Smart Notes + KC-Daten + Nutzerprofil.

**Zielgruppe:** Gymnasiasten Klasse 10–13, Mittelstufe und Oberstufe — Studentenanpassung in Planung  
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
| KI Text + Vision | Groq API — Llama 3.3 70B (Text) + Llama 4 Scout Vision (Bilder/Scans) |
| KI Probeklausuren | Google Gemini — `gemini-2.5-flash` (Klausurgenerierung + Korrektur) |
| Auth + DB (Phase 3) | Supabase |
| Payments (Phase 3) | Stripe |
| Dev Server | localhost:5174 |
| Repo | https://github.com/simonhapp-ai/DailyStudent.git |
| Projektordner | C:\Users\simon\OneDrive\Desktop\Claude App |

---

## Das Ökosystem-Konzept (Kern der App-Logik)

### Smart Notes als Grundlage
Alles in der App baut auf **Smart Notes** auf. Eine Smart Note entsteht durch:
1. Foto/PDF/Text-Import → Groq Vision OCR → Groq Text → `GeneratedSmartNote`
2. Manuelle Eingabe → optional KI-Analyse → `GeneratedSmartNote`

`GeneratedSmartNote` enthält: `summary`, `keywords`, `examTopics`, optional `solution`/`tasks` (für Aufgaben), `rawText`.

### Die Lernmethoden-Kette

```
Smart Notes
    ├── Karteikarten      → generateFlashcards() via Groq → LearnModeScreen
    ├── Blurting          → evaluateBlurting() via Groq → BlurtingScreen
    ├── Probeklausur      → generateMode1-4Exam() via Gemini → ProbeklausurMode1-4Screen
    ├── Lernzettel        → [FEHLT] generateLernzettel() via Groq → LernzettelScreen
    └── Lernplan          → [FEHLT] generateLernplan() via Groq → LernplanScreen (in KlausurphasenScreen)
```

### Klausurenmodus-Screen als Hub
`KlausurphasenScreen` ist KEIN Feature-Screen — er ist eine **Übersicht/Startpunkt** für alle Lernmethoden, zeigt den nächsten Klausurtermin, Streak, Schwächefach und ermöglicht den Einstieg in alle Lernwege. Das Layout ist bewusst so gewählt. Nicht ändern ohne Rückfrage.

---

## Aktueller Stand — Phase 2 weitgehend fertig

### Was vollständig funktioniert (echte KI, kein Mock):
- Onboarding Gate (Name, Klasse, Schulform, Bundesland, Fächer, Klausurtermin, Stundenplan-Scan)
- **Unterricht-Screen:** Fach-Tree mit Ordnern, Notizen erstellen, Foto-Import per Gemini KI mit auto-Ziel-Vorschlag
- **Smart Notes:** Foto/PDF/Text → Groq OCR → Groq Analyse → `GeneratedSmartNote` mit Summary, Keywords, Klausurthemen, Lösungsschritte
- **Keyword-Erklärung:** Tap auf Schlüsselbegriff → `explainKeyword()` via Groq
- **Karteikarten:** `generateFlashcards()` via Groq aus Smart Note → `LearnModeScreen` mit Deck-Verwaltung
- **Blurting:** `evaluateBlurting()` via Groq — echter KI-Vergleich mit Smart Note Inhalt
- **Probeklausur 4 Modi:** `generateMode1-4Exam()` via Gemini `gemini-2.5-flash` — echt generiert, echt korrigiert
- **Stundenplan-Scanner:** `parseStundenplanFromImage()` via Groq Vision — liest Foto/PDF ein
- **Stats:** Streak (echt), scanCount, examCount, studiedDays — alles live in localStorage
- **InsightsScreen:** Notenverlauf-Chart, Fachvergleich, Wochenaktivität, KI-Lerntipps
- **AbiRechnerScreen:** NP-Rechner mit Zielnote-Vergleich
- **KlausurplanScreen, HausaufgabenheftScreen, KalenderScreen** — funktionsfähig
- **FaecherEditScreen:** Fächer nachträglich hinzufügen/entfernen mit Ordner-Sync
- **FolderSystem:** Ordner, Unterordner, auto-generiert nach Halbjahr/Quartal
- **Theme:** Hell/Dunkel/System
- **isPro-Flag** in UserContext (Toggle im Profil für Dev, Stripe-ready)

### Was noch Mock-Daten verwendet:
| Was | Datei | Notiz |
|-----|-------|-------|
| `lessons` | `mockData.ts:103` | 7 hardcoded Stunden (Geschichte + Mathe) — von Legacy-Code noch referenziert |
| `smartNotes[0]` | `mockData.ts:113` | Fallback wenn kein `generatedNote` vorhanden |
| `flashCards` | `mockData.ts:137` | Legacy, nicht mehr aktiv genutzt — `generatedFlashCards` kommt aus Groq |
| `examQuestions` | `mockData.ts:170` | Noch in `ExamModeScreen` (dem alten Klausur-Modus) |
| `mockExamResult` | `mockData.ts:194` | Noch in `ExamResultScreen` |
| Timer "45:00" | `ExamModeScreen.tsx:33` | Hardcoded, läuft nicht |
| Lernplan-Tage | `KlausurphasenScreen.tsx:27` | `LERNPLAN_DAYS` hardcoded, Lernplan generiert nichts |

### Was komplett fehlt (die zwei letzten Features vor Phase 3):
1. **Lernzettel** — Screen + KI-Generierung (Groq) aus Smart Notes + KC-Themen
2. **Lernplan** — echter generierter Plan (Groq) basierend auf Klausurdatum + Smart Notes + KC
3. **KC-Datenbank** — strukturierte Kerncurriculum-Daten pro Bundesland/Fach/Klasse als Input für Lernzettel + Lernplan

---

## Die KC-Frage — Kernproblem für Lernzettel + Lernplan

### Was ist das Problem?
Lernzettel und Lernplan sollen **personalisiert** sein — abgestimmt auf:
- Das Bundesland des Users (jedes Bundesland hat eigenes KC)
- Das Fach
- Die Klasse/das Halbjahr
- Die Smart Notes die der User bereits hat

Ohne KC-Daten kann die KI keine themengerechten Lernzettel oder sinnvollen Lernpläne erstellen.

### Aktuelle KC-Struktur (in mockData.ts)
`topics[]` hat bereits KC-alignierte Themen für: Geschichte, Mathe, Englisch, Biologie, Physik, Religion, Deutsch — Klasse 12+13. Diese sind aber:
- Noch nicht Bundesland-spezifisch differenziert
- Unvollständig (fehlen: Chemie, Informatik, Geographie, Politik, Latein, Französisch, Spanisch, Kunst, Musik, Sport)
- Nicht mit dem Nutzerprofil verknüpft (welche Topics sind für DIESEN User relevant?)

### Empfohlener Ansatz: KC als statische TS-Daten + Prompt-Injection

**Stufe 1 (sofort umsetzbar):** KC-Themen als strukturierte TypeScript-Daten in `src/data/kcData.ts`. Struktur:
```ts
// kcData.ts
Record<BundeslandId, Record<SubjectId, Record<HalfYearId, KcTopic[]>>>

interface KcTopic {
  id: string
  name: string        // "Weimarer Republik"
  subtopics: string[] // ["Novemberrevolution", "Verfassung 1919", ...]
  afbFocus: ('I' | 'II' | 'III')[]  // Welche AFB-Stufen typisch
  klausurrelevanz: 'hoch' | 'mittel' | 'niedrig'
}
```

**Stufe 2:** Relevante KC-Topics werden beim Aufruf von `generateLernzettel()` und `generateLernplan()` als Prompt-Kontext übergeben — die KI weiß dann, was in der Klausur drankommt.

**Stufe 3 (optional, Phase 3):** KC-Daten aus Supabase laden (wenn jedes Bundesland eigene Daten braucht und die TS-Datei zu groß wird).

### Priorisierung der Bundesländer für KC-Daten
Absteigend nach Schülerzahl:
1. **NRW** — 2,5 Mio Schüler
2. **Bayern** — 1,8 Mio Schüler (topics[] schon vorhanden)
3. **Baden-Württemberg** — 1,4 Mio Schüler
4. **Niedersachsen** — 1,0 Mio Schüler
5. **Hessen** — 0,8 Mio Schüler
> Diese 5 Bundesländer decken ~65% der deutschen Schüler ab. Start damit.

### Fallback wenn kein spezifisches KC vorhanden
→ Bayern-KC als generischer Fallback (inhaltlich ähnlich, gut dokumentiert)

---

## Roadmap — Nächste Schritte

### Priorität 1 — Sofort (Blocker beheben)
- [ ] **Gemini API Key reparieren** — `VITE_GEMINI_API_KEY` in `.env` ist ungültig (beginnt mit `AQ.Ab...`, muss `AIzaSy...` sein). Neuen Key auf [aistudio.google.com](https://aistudio.google.com) generieren. Ohne das sind alle 4 Probeklausur-Modi broken.

### Priorität 2 — KC-Datenstruktur (Vorbedingung für Lernzettel + Lernplan)
- [ ] `src/data/kcData.ts` anlegen mit Bundesland-spezifischen KC-Themen
- [ ] Start: Bayern + NRW + BW für alle 6 Kernfächer (Deutsch, Mathe, Englisch, Geschichte, Biologie, Physik)
- [ ] UserContext: Funktion `getRelevantKcTopics(subjectId, halfYearId)` — filtert KC-Topics nach User-Bundesland + Halbjahr
- [ ] bestehende `topics[]` in `mockData.ts` schrittweise in `kcData.ts` überführen

### Priorität 3 — Lernzettel Feature
- [ ] `src/lib/groq.ts`: `generateLernzettel(note, kcTopics, subjectName)` — gibt strukturierten HTML/Markdown-Lernzettel zurück
- [ ] `src/screens/LernzettelScreen.tsx` — zeigt Lernzettel, Export als PDF (via `window.print()`)
- [ ] Route: `/klausurmodus/lernzettel/:noteId`
- [ ] Button in `KlausurphasenScreen` → navigiert zu Lernzettel-Screen
- [ ] Free-User: erste Section sichtbar, Rest blur → Pro required

### Priorität 4 — Lernplan Feature (echter generierter Plan)
- [ ] `src/lib/groq.ts`: `generateLernplan(profile, klausurtermin, userNotes, kcTopics)` — gibt Tagesplan als JSON zurück
- [ ] Plan: `{ days: [{ date, topic, kcRef, durationMin, method: 'karteikarten'|'blurting'|'lernzettel' }] }`
- [ ] `KlausurphasenScreen`: "Lernplan generieren" Button ruft echte Funktion auf, speichert Plan in localStorage
- [ ] Tage-Strip im Widget zeigt echte Plan-Daten (ersetzt `LERNPLAN_DAYS` hardcoded)

### Priorität 5 — Legacy Mock aufräumen
- [ ] `ExamModeScreen` + `ExamResultScreen` auf Probeklausur-Logik umstellen oder deprecaten (die 4 Probeklausur-Modi haben diese Rolle übernommen)
- [ ] `lessons[]` aus mockData.ts aus den Screens entfernen — nur noch `userNotes` + `userFolders` verwenden

### Phase 3 — Backend (NACH Priorität 1–5)
- Supabase Auth + DB (User-Daten, Notes, Flashcards in Cloud)
- Stripe Payments (Pro-Subscription, Webhook)
- KI-API-Calls serverseitig (API-Keys nicht mehr im Client)
- Push-Benachrichtigungen für Lernplan-Erinnerungen
- Deployment (Vercel/Netlify)
- Studentenadaption (Uni-Fächer, kein KC aber Syllabus-Upload)

---

## Architektur-Entscheidungen (nicht ändern ohne Rückfrage)

- **localStorage Key:** `lernapp_v1` — Schema nicht brechen, Migration schreiben wenn nötig
- **isPro-Flag:** in `UserContext` als `isPro: boolean` — bleibt so bis Stripe kommt; im Profil-Screen manuell togglebar (Dev-Mode)
- **Kein eigener Backend-Server** — alles Client-Side bis Phase 3; Groq + Gemini direkt aus dem Browser
- **Groq für Text/Vision** — Llama 3.3 70B + Llama 4 Scout Vision: Kosten, Geschwindigkeit, kein Rate-Limit für Prototyp
- **Gemini für Probeklausuren** — `gemini-2.5-flash` hat bessere längere Reasoning-Qualität für strukturierte Klausurgenerierung
- **Blur-Paywall Pattern** — für alle KI-Features bei Free-Usern beibehalten
- **TypeScript strict** — keine `any` Types einbauen
- **KlausurphasenScreen bleibt Hub** — kein Feature-Screen, nur Einstieg in die Lernmethoden

---

## Umgebungsvariablen

```
VITE_GROQ_API_KEY=gsk_...        # Groq API Key (Text + Vision) — gültig
VITE_GEMINI_API_KEY=AIzaSy...    # Google Gemini API Key — MUSS neu generiert werden (aktuell ungültig)
```

`.env` liegt im Root-Verzeichnis. Nie in Git committen (ist in `.gitignore`).

---

## Wichtige Dateien / Struktur

```
src/
├── app/
│   └── App.tsx               # Router, ErrorBoundary, ThemeApplier, Layout
├── components/
│   ├── lesson/
│   │   ├── FotoScannerWidget.tsx
│   │   ├── AudioRecorderWidget.tsx
│   │   └── NoteEditor.tsx
│   ├── learn/
│   │   ├── FlashCard.tsx
│   │   ├── ExamQuestion.tsx
│   │   └── AIFeedbackCard.tsx
│   └── ui/                   # Button, Card, Badge, BottomNav, Header, ProModal, BottomSheet, ...
├── context/
│   └── UserContext.tsx        # Zentraler State + localStorage Persistenz
├── data/
│   ├── mockData.ts            # Legacy-Daten (lessons, smartNotes, flashCards, examQuestions)
│   ├── subjectInfo.ts         # SUBJECT_INFO + SUBJECT_GROUPS (Name, Icon, Farbe pro Fach)
│   └── kcData.ts              # [FEHLT] KC-Daten pro Bundesland/Fach/Halbjahr
├── lib/
│   ├── groq.ts                # Alle Groq API Calls (OCR, SmartNote, Flashcards, Blurting, ...)
│   ├── gemini.ts              # Gemini API Calls (Probeklausur-Generierung + Korrektur, File-Import)
│   └── pdf.ts                 # PDF → Bilder Konvertierung (pdfjs)
├── screens/                   # Ein Screen pro Route
│   ├── OnboardingScreen.tsx
│   ├── KalenderScreen.tsx
│   ├── UnterrichtScreen.tsx   # Fach-Tree, Ordner, Foto-Import mit KI-Zielvorschlag
│   ├── LessonScreen.tsx
│   ├── FolderScreen.tsx
│   ├── SmartNotesScreen.tsx   # Notiz-Detail + KI-Analyse + Keyword-Erklärung + FC-Generator
│   ├── NoteCreateScreen.tsx
│   ├── KlausurphasenScreen.tsx  # Hub-Screen für alle Lernmethoden
│   ├── LearnModeScreen.tsx    # Karteikarten-Bibliothek + Lern-Session
│   ├── FlashCardGeneratorScreen.tsx
│   ├── BlurtingScreen.tsx     # Blurting + KI-Bewertung
│   ├── ProbeklausurMenuScreen.tsx
│   ├── ProbeklausurMode1Screen.tsx   # AFB-Trainer
│   ├── ProbeklausurMode2Screen.tsx   # Vollständige Klausur
│   ├── ProbeklausurMode3Screen.tsx   # Materialklausur
│   ├── ProbeklausurMode4Screen.tsx   # Ohne Material
│   ├── ExamModeScreen.tsx     # Legacy — hardcoded mockData (zu ersetzen/deprecaten)
│   ├── ExamResultScreen.tsx   # Legacy — hardcoded mockResult
│   ├── KlausurplanScreen.tsx
│   ├── HausaufgabenheftScreen.tsx
│   ├── AbiRechnerScreen.tsx
│   ├── InsightsScreen.tsx     # Statistiken, Charts, Lerntipps
│   ├── ProfilScreen.tsx
│   ├── FaecherEditScreen.tsx  # Fächer nachträglich bearbeiten
│   └── HomeScreen.tsx
└── types/
    └── index.ts               # Alle TypeScript-Typen
```

---

## Design-Prinzipien — iOS / Apple Quality Standard

DailyStudent soll sich anfühlen wie eine native Apple-App. Jede UI-Entscheidung orientiert sich an iOS-Designsprache.

### Grundprinzipien

**1. Klarheit vor Dekoration**
Jedes Element hat eine klare Funktion. Kein Ornament ohne Bedeutung. Text ist immer lesbar — nie kleiner als 10px, Haupttext ≥ 13px.

**2. Links-Ausrichtung als Standard**
Alle Widget-Inhalte, Listenpunkte und Karten-Texte sind linksbündig (`text-left`). Zentrierter Text nur für isolierte Metriken (Zahl mit Label darunter) oder leere Zustände. Buttons ohne explizites `text-left` können Browser-seitig zentrieren — immer `text-left` setzen.

**3. Tiefe durch Schatten, nicht Rahmen**
Primäre Karten: `shadow-card-adaptive` + subtiler Border (`border-border/60`). Keine harten schwarzen Borders. Schatten-Stärke signalisiert Hierarchie — float > card > flat.

**4. Konsistente Spacing-Sprache**
- Screen-Padding: `px-4`
- Card-Innenabstand: `p-4` oder `p-5`
- Widget-Icon-Padding: `px-3.5 pt-3.5`
- Gap zwischen Widgets: `gap-3` oder `space-y-3`
- Section-Label Abstand: `mb-2.5`

**5. Gradients für Akzente, nicht für Backgrounds**
Gradient-Icons: `rounded-[14px]` Pill mit farbigem Gradient + Schatten. Gradient-Buttons für primäre CTAs. Hintergrundfarben bleiben flach (`bg-surface`, `bg-background`).

**6. Icons sind immer in einem Gradient-Container**
Widget-Icons: `w-11 h-11 rounded-[14px]` (AppIconPill / GradientIcon Pattern). Icon-Farbe ist immer weiß auf farbigem Gradient. Niemals nackte Emojis als primäre Widget-Icons.

**7. Indikator-Pfeile bei navigierbaren Elementen**
Jeder Button der zu einem anderen Screen navigiert bekommt einen `<Chevron />` (`›`) am rechten Rand. Quadratische Karten: Chevron top-right via `flex items-start justify-between`. Volle Breite: Chevron am Ende der Flex-Row.

**8. Farbe kommuniziert Zustand**
- Grün (`#30D158`) = erledigt / gut / Erfolg
- Orange (`#FF9F0A`) = Warnung / bald fällig / Streak
- Rot (`#FF453A`) = kritisch / Klausur / Gefahr
- Lila (Accent `#7C3AED`) = primäre Aktion / Brand
- Teal (`#5AC8FA`) = Kalender / neutral-informativ

**9. Zahlen in Pill-Badges: immer `whitespace-nowrap`**
Streak, Counts, Badges in Pills: `inline-flex items-center gap-1 whitespace-nowrap` — verhindert Umbruch auf kleinen Phones (375px). `shrink-0` wenn neben flexiblem Text.

**10. Typografie-Hierarchie**
| Rolle | Größe | Gewicht |
|-------|-------|---------|
| Screen-Titel | 28px | 700 bold |
| Section-Label | 12px | 600 semibold, text-muted, uppercase |
| Card-Titel | 15–16px | 700 bold |
| Card-Subtitle | 12–13px | 400–500 |
| Metric groß | 28–34px | 900 black |
| Metric klein | 18px | 900 black |
| Label unter Metric | 11px | 400, text-muted |

**11. Zustandsdesign für leere Screens**
Leerzustände zeigen: Icon (groß, Gradient-Container) + Headline + kurze Erklärung + primärer CTA-Button. Kein leerer Screen ohne Handlungsaufforderung.

**12. Animationen sind subtil und schnell**
- Fade-in: `opacity 0.18s ease`
- Scale-press: `active:scale-[0.98]` oder `press-sm`
- Accordion: `max-height` transition `0.38s cubic-bezier(0.4,0,0.2,1)`
- Modal: `scale + opacity`, origin contextual, `0.2–0.28s`
- Keine Bounce-Animationen auf Datenelementen

---

## Developer-Kontext

- **Entwickler:** Simon, kein Coding-Background — arbeitet mit Claude Code in VS Code
- **Workflow:** Claude Code baut, Simon reviewed im Browser (localhost:5174), dann git commit + push
- **Git:** `git add . && git commit -m "..." && git push`
- **Wichtig:** Immer erklären was du gebaut hast und warum — keine stillen Änderungen

---

## Letzte Session

- Vollständiger Statusbericht der App erstellt
- CLAUDE.md komplett neu geschrieben mit aktuellem Stand, Ökosystem-Konzept, KC-Frage, Roadmap
- Nächster Schritt: **Gemini API Key reparieren**, dann **kcData.ts anlegen** (KC-Daten für NRW + Bayern + BW), dann **Lernzettel + Lernplan** implementieren
