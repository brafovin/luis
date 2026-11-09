# ⚔ Schwerter-Welten

Kleines Ego-Perspektive-Spiel im Browser (Three.js) mit Mehrspieler (WebSocket).

## Starten
```bash
npm install
npm start        # http://localhost:3000
```
Freunde: gleiche **Welt** + gleicher **Raum-Code** eingeben (oder den Link `?world=…&room=…` teilen). Bis zu 8 Spieler pro Raum, gebaute Blöcke und Spieler werden live synchronisiert.

## Features
- 5 Welten (Wiese, Wüste, Eiswelt, Lavawelt, Kristall-Void) mit je 5 Missions-Leveln (Besiegen, Kristalle sammeln, Horde, Überleben, Boss) + freier Modus
- **100 Schwerter**: 10 Typen (Dolch … Koloss-Klinge, verschiedene Größen) × 10 Farben/Materialien
- Krieger-Charakter (Helm, Hörner, Rüstung, Umhang, Schild), wählbare Rüstungsfarbe
- Shop: Schwerter & Bausteine kaufen/verkaufen, Gold durch Kämpfe und Missionen
- Baumodus: Blöcke platzieren/abbauen (Holz, Stein, Ziegel, Gold, Lampe)
- Spielstand wird im Browser gespeichert

## Steuerung
WASD laufen · Shift rennen · Leertaste springen · Maus umsehen · Linksklick Schwert · 1–9 / Mausrad Schwert wählen ·
E Shop · B Baumodus (Linksklick setzen, Rechtsklick abbauen) · T Chat · Esc Pause
