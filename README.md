# LinkedIn Audience Configurator

Eine vollständig selbst-hostbare Anwendung zur Konfiguration von LinkedIn-Zielgruppen mit historischen Kampagnendaten und Performance-Metriken.

## 🎯 Features

✅ **Interaktive Zielgruppen-Konfiguration**
- Job-Titel & Seniority Level
- Branche / Sektor
- Geografischer Standort
- Unternehmensgrößen
- Engagement-Level

✅ **LinkedIn API Integration**
- Echtzeit Audience Insights
- Campaign Manager Integration
- Automatische CPM-Berechnung

✅ **Historische Kampagnendaten**
- Performance-Metriken (CTR, Conversions, ROI)
- Kampagnen-Benchmarks
- ROAS & ROI-Berechnungen

✅ **Datenbank (SQLite)**
- Persistente Speicherung
- API-Caching
- Schnelle Abfragen

## 🚀 Schnellstart

### 1. Repository klonen
```bash
git clone <your-repo-url>
cd linkedin-configurator
npm install
```

### 2. Environment-Variablen setzen
```bash
cp .env.local.example .env.local
```

Bearbeite `.env.local`:
```
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_ACCESS_TOKEN=your_access_token_here
NEXT_PUBLIC_API_URL=https://yourdomain.vercel.app
DATABASE_PATH=./data/campaigns.db
```

### 3. Lokal testen
```bash
npm run dev
```

Öffne http://localhost:3000 in deinem Browser.

---

## 📋 LinkedIn API Setup

### Schritt 1: LinkedIn Developer App erstellen

1. Gehe zu [LinkedIn Developers](https://www.linkedin.com/developers)
2. Klick auf "Create app"
3. Fülle die erforderlichen Informationen aus
4. Bestätige die App

### Schritt 2: Credentials abrufen

1. Gehe zu deiner App Settings
2. Kopiere **Client ID** und **Client Secret**
3. Unter "Auth" findest du die **Access Token** Sektion

### Schritt 3: Permissions aktivieren

Stelle sicher, dass diese Permissions aktiviert sind:
- `adAccount_read`
- `adAudience_read`
- `adCampaign_read`

### Schritt 4: Environment-Variablen aktualisieren
```bash
LINKEDIN_CLIENT_ID=your_id
LINKEDIN_CLIENT_SECRET=your_secret
LINKEDIN_ACCESS_TOKEN=your_token
```

---

## 🌐 Deployment auf Vercel

### Option 1: Git Integration (empfohlen)

1. Pushe dein Projekt zu GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Gehe zu [Vercel](https://vercel.com)
3. Klick "New Project"
4. Wähle dein GitHub-Repository
5. Vercel erkennt automatisch Next.js
6. Klick "Deploy"
7. Unter "Environment Variables" füge folgende hinzu:
   ```
   LINKEDIN_CLIENT_ID = your_id
   LINKEDIN_CLIENT_SECRET = your_secret
   LINKEDIN_ACCESS_TOKEN = your_token
   NEXT_PUBLIC_API_URL = https://yourdomain.vercel.app
   ```

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Folge den Prompts und gib deine Environment-Variablen ein.

---

## 💾 Datenbank-Setup

Die App nutzt **SQLite** für lokale Speicherung:

### Automatische Initialisierung
Die Datenbank wird automatisch beim ersten Request erstellt:
```javascript
// Wird in /pages/api/audience-insights.js aufgerufen
initializeDatabase();
```

### Struktur
```sql
campaigns           -- Historische Kampagnendaten
audience_insights   -- Zielgruppen-Metriken
api_cache          -- API-Response Caching
```

### Daten importieren (optional)

Um historische Kampagnen zu importieren:

```bash
# Stelle eine CSV-Datei bereit mit diesem Format:
# id,name,startDate,endDate,budget,spend,impressions,clicks,conversions,cpm,ctr,conversionRate,roi

node scripts/import-campaigns.js data/campaigns.csv
```

---

## 📊 API Endpoints

### `POST /api/audience-insights`
Berechne Audience-Metriken basierend auf Targeting-Kriterien.

**Request:**
```json
{
  "targeting": {
    "jobTitles": ["ceo", "vp"],
    "industries": ["tech", "finance"],
    "locations": ["de", "at"],
    "companySizes": ["500+"],
    "engagementLevels": ["high"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "audienceInsights": { ... },
  "campaignHistory": [ ... ],
  "performanceMetrics": { ... },
  "summary": { ... }
}
```

### `GET /api/campaigns`
Abrufen aller historischen Kampagnen.

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [ ... ],
    "summary": { ... }
  }
}
```

### `POST /api/campaigns`
Speichere eine neue Kampagne.

**Request:**
```json
{
  "campaignData": { ... }
}
```

---

## 🔐 Sicherheit

### Best Practices

1. **Environment-Variablen verwenden** – speichere Secrets niemals im Code
2. **HTTPS erzwingen** – bei Production-Deployment
3. **Rate Limiting** – für API-Endpoints
4. **CORS konfigurieren** – nur erlaubte Origins
5. **Regelmäßige Updates** – npm dependencies updaten

### Vercel Secrets Management

Alle Umgebungsvariablen in Vercel werden verschlüsselt gespeichert:

```bash
vercel env add LINKEDIN_ACCESS_TOKEN
```

---

## 📈 Performance Optimierungen

### API Caching
- LinkedIn API Responses werden für 24h gecacht
- Kampagnendaten werden für 12h gecacht
- Reduziert API-Calls und Kosten

### Database Indexing
```javascript
// Automatisch erstellt auf:
// - campaigns.id (PRIMARY KEY)
// - audience_insights.id (PRIMARY KEY)
// - api_cache.key (PRIMARY KEY)
```

### Vercel Optimierungen
- Automatisches Image Optimization
- Static Generation für Pages
- Edge Caching

---

## 🐛 Troubleshooting

### Fehler: "LinkedIn API Token nicht konfiguriert"
```
Lösung: Überprüfe .env.local und stelle sicher, dass 
LINKEDIN_ACCESS_TOKEN gesetzt ist.
```

### Fehler: "Database lock"
```
Lösung: SQLite hat eine Schreib-Lock. Warte 30 Sekunden 
oder starte die App neu.
```

### Fehler: "Cannot find module 'better-sqlite3'"
```
Lösung: npm install
Dann neu starten: npm run dev
```

### Kampagnendaten werden nicht angezeigt
```
Lösung: 
1. Prüfe /api/campaigns Response
2. Kontrolliere LinkedIn API Credentials
3. Nutze Demo-Daten (fallback automatisch aktiv)
```

---

## 📚 Dokumentation

- [Next.js Docs](https://nextjs.org/docs)
- [LinkedIn API Docs](https://docs.microsoft.com/en-us/linkedin/marketing/apis)
- [Vercel Docs](https://vercel.com/docs)

---

## 🤝 Support

Bei Fragen oder Issues:
1. Schau ins `/docs` Verzeichnis
2. Überprüfe die Logs in Vercel Dashboard
3. Kontaktiere das Digital Marketing Team

---

## 📄 Lizenz

Intern. Nicht für externe Nutzung.

---

**Letzte Aktualisierung:** März 2026
