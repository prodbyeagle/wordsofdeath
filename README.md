## Übersicht
**WordsofDeath** ist eine webbasierte Plattform, die es Nutzern ermöglicht, Wörter oder Sätze in verschiedenen Kategorien zu speichern und zu durchsuchen. Der Zugriff auf die Seite ist auf eine Whitelist von Discord-Nutzern beschränkt. Die Seite nutzt Next.js und TypeScript für das Frontend, MongoDB für die Datenbank und Tailwind CSS für das UI-Design.

## Technologie-Stack
- **Frontend**: Next.js + TypeScript
- **Datenbank**: MongoDB (ohne Mongoose)
- **UI-Design**: Tailwind CSS
- **Login**: Discord OAuth2

## Funktionen
1. **Benutzeranmeldung**:
   - Die Anmeldung erfolgt über Discord OAuth2.
   - Erfasste Benutzerdaten:
     - **Username**: Name des Discord-Benutzers
     - **Avatar**: Profilbild des Discord-Benutzers
     - **ID**: Discord-Id Des Benutzers
     - **Beitrittsdatum**: Zeit Stempel des ersten Zugriffs (erstellt mit `Date.now`)

2. **Wörter und Sätze speichern**:
   - Nutzer können Wörter oder Sätze in der Datenbank speichern und kategorisieren.
   - **Selectbar**-Funktion zur Auswahl, ob es sich um ein Wort oder einen Satz handelt.
   - Angaben beim Speichern:
     - **Word or Sentence**: Die gespeicherte Information (entweder Wort oder Satz).
     - **Kategorien**: Ein oder mehrere Kategorien zur thematischen Einordnung.
     - **Author**: Benutzername des Erstellers.

3. **Suche und Filterung**:
   - Benutzer können gespeicherte Wörter und Sätze anhand von Kategorien oder Stichwörtern durchsuchen.

4. **Whitelist-Verwaltung**:
   - Nur Benutzer, die sich auf der Whitelist befinden, dürfen die Website betreten.
   - Whitelist beinhaltet Discord-Benutzer, die zur Nutzung der Plattform berechtigt sind. (datenbank whitelist.)

## Datenbank-Schema

| Feldname      | Datentyp   | Beschreibung                 |
|---------------|------------|------------------------------|
| `name`        | `string`   | Name des Benutzers           |
| `timestamp`   | `Date.now` | Zeitstempel des Zugriffs     |
| `entry`       | `string`   | Gespeichertes Wort oder Satz |
| `categories`  | `string[]` | Liste der Kategorien         |
| `author`      | `string`   | Name des Erstellers          |
| `variationen` | `string[]` | Variationen vom `entry`      |

### Beispiel für einen Benutzer
```json
{
    "_id":"6732e69ef11016e40775ecf8",
    "id":"1065030118491308082",
    "name": "MaxMustermann",
    "avatar":"a9f0b4b5434e6cd5031bd246fdabce40",
    "joined_at": "2023-10-27T12:34:56Z"
}
```

### Beispiel für gespeicherte Wörter/Sätze

```json
[{
  "_id": {
    "$oid": "6732e47363aa5cc0e6613d7c"
  },
  "id": "01JCFCRRW04PW5RZEWMPNA57H7",
  "entry": "schebedebäpert",

  "type": "word",
  "categories": [
    "discord"
  ],
  "author": "prodbyeagle",
  "authorId": "893759402832699392",
  "timestamp": "2024-10-28T20:42:08.572Z",
  "variation": []
  }]
```