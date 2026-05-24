# Smart Tourism Guide — Frontend

Progressive Web App built with **React + TypeScript + Vite + TailwindCSS**.

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| TailwindCSS | Utility-first styling |
| Leaflet.js + OpenStreetMap | Interactive maps |
| vite-plugin-pwa | PWA / offline support |
| i18next | Multilingual support |
| Web NFC API | NFC tag reading |
| Browser Geolocation API | GPS tracking |
| SpeechSynthesis API | Voice narration (MVP) |

## Folder Structure

```
frontend/
├── public/                  # Static assets, PWA icons
├── src/
│   ├── assets/              # Images, icons, audio samples
│   │   ├── images/
│   │   ├── icons/
│   │   └── audio/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # LanguageSelector, Navbar, etc.
│   │   ├── map/             # TourMap (Leaflet wrapper)
│   │   ├── nfc/             # NFCScanner (Web NFC API)
│   │   ├── ai/              # AIAssistant chat widget
│   │   └── audio/           # AudioPlayer component
│   ├── pages/               # Route-level page components
│   │   ├── WelcomePage.tsx  # Entry screen, language select
│   │   ├── MapPage.tsx      # Interactive GPS map
│   │   ├── ObjectPage.tsx   # Attraction detail view
│   │   └── NotFoundPage.tsx # 404 fallback
│   ├── hooks/               # Custom React hooks
│   │   ├── useGPS.ts        # Geolocation watchPosition
│   │   ├── useAttractions.ts# Fetch nearby objects
│   │   └── useGeofence.ts   # Haversine zone detection
│   ├── services/            # API call functions (axios)
│   │   ├── objectService.ts # GET /object/:id, GET /nearby
│   │   ├── aiService.ts     # POST /ai/chat
│   │   └── geofenceService.ts # POST /geofence/check
│   ├── maps/
│   │   └── GeofenceManager.tsx # Auto-trigger zone notifications
│   ├── audio/
│   │   └── ttsService.ts    # SpeechSynthesis wrapper
│   ├── context/             # React context providers
│   ├── ai/                  # AI client helpers (Phase 2+)
│   ├── styles/
│   │   └── index.css        # Tailwind directives
│   ├── utils/               # Shared helpers
│   ├── i18n.ts              # i18next configuration
│   ├── App.tsx              # Router + route definitions
│   └── main.tsx             # React DOM entry point
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

## Getting Started

```bash
cd frontend
cp .env.example .env          # set VITE_API_URL
npm install
npm run dev                   # http://localhost:5173
```

## Build for Production

```bash
npm run build
npm run preview
```

## PWA & Offline

The app registers a Service Worker via `vite-plugin-pwa`. Cached assets include:

- All JS/CSS bundles
- OpenStreetMap tiles (CacheFirst, 7-day TTL)
- Audio files served from CDN

## User Flow

```
Tap NFC / Scan QR
       ↓
WelcomePage  →  language select + GPS permission
       ↓
MapPage      →  live map, nearby markers
       ↓
ObjectPage   →  images, audio narration, AI chat
```

## NFC Support

NFC scanning uses the **Web NFC API** (Chrome on Android only).  
QR codes are provided as a universal fallback for all devices.

## Multilingual Support

Default languages: **English**, **French**, **Kinyarwanda**.  
Add more in `src/i18n.ts` under `resources`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:4000/api`) |
