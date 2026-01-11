# Betriebskostenverrechner (Web App)

Simple Web-App für eine Betriebskostenabrechnung mit 2 Posten:

- **Heizkosten Gesamt**: werden nach Summe der Heiz-Zählerwerte pro Partei aufgeteilt.
- **Grundkosten Gesamt**: werden nach Quadratmetern (m²) pro Partei aufgeteilt.

Die App zeigt pro Partei eine übersichtliche Aufteilung inkl. Formel/„Rechnung“.

## Features

- Parteien anlegen/entfernen, Namen & m² editierbar
- Pro Partei Vorauszahlung (für Restbetrag/Guthaben)
- Pro Partei beliebig viele Heiz-Zähler (hinzufügen/entfernen) + Werteingabe
- Übersichtstabelle + Rechnung je Partei
- PDF Download: Gesamtübersicht + PDF je Partei
- Daten Export/Import als JSON Datei
- Autosave im Browser (localStorage)
- Druckansicht (Browser-Print)

## Mehrere Abrechnungen ("Dokumente")

Die App speichert nicht nur *eine* Abrechnung, sondern mehrere Dokumente (ähnlich wie "Speichern unter").

- Oben rechts gibt es den Button **Dokumente**.
- Dort kannst du:
	- **Neues Dokument** anlegen
	- Dokument **umbenennen** (Name-Feld)
	- Dokument **öffnen** (aktiv schalten)
	- Dokument **duplizieren** (Kopie)
	- Dokument **löschen** (mindestens 1 Dokument bleibt immer)

Export/Import bezieht sich immer auf das aktuell geöffnete Dokument:

- **Export**: lädt eine JSON-Datei inkl. Dokumentname.
- **Import**: fragt nach dem Einfügen:
	- **OK** = aktuelles Dokument überschreiben
	- **Abbrechen** = als neues Dokument importieren

## Development

Install:

`npm install`

Start:

`npm run dev`

Build:

`npm run build`

## Desktop (Windows / macOS)

Die App kann als Desktop-App (Electron) gebaut werden.

Dev (öffnet ein Desktop-Fenster gegen den Vite Dev-Server):

`npm run dev:desktop`

Build + Paket (auf dem aktuellen OS):

`npm run build:desktop`

Windows Installer (NSIS):

`npm run dist:win`

macOS Build:

`npm run dist:mac`

Hinweis: Ein macOS-Build lässt sich normalerweise nur auf macOS erstellen (oder via CI mit macOS Runner).

### Wo finde ich die Dateien?

Nach dem Build liegen die Ergebnisse im Ordner `release/`.

- Windows: `release/Betriebskostenverrechner Setup <version>.exe`

### macOS Build von Windows aus (GitHub Actions)

Wenn du gerade auf Windows bist, kannst du den macOS Build automatisch in GitHub Actions erstellen lassen.
Workflow: `.github/workflows/build-desktop.yml` (manuell per **Run workflow** startbar).

Die Artefakte findest du danach unter **Actions → Workflow Run → Artifacts**.
