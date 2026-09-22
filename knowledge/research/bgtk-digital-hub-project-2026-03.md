# BGTK Kaltim Digital Hub — Project Knowledge

## Summary
Government agency digital hub (Balai Guru Tenaga Kependidikan Kalimantan Timur). Multi-role SPA for internal operations: dashboard, attendance, events, AI chat, surveys, and document management.

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Vite + React | React 19.2, Vite 7.2 |
| **Language** | JavaScript (.jsx) | ES Modules |
| **CSS** | Tailwind CSS v4 + DaisyUI v5 + Custom CSS | Custom "Platinum CSS" variables |
| **State (Global)** | Zustand | v5.0 |
| **State (Context)** | React Context | Auth, Theme, i18n, Notifications, Onboarding, Toast |
| **Backend** | Supabase (PostgreSQL) | v2.91 |
| **AI Chat** | Groq (primary) + Gemini (fallback) | Multi-key rotation |
| **Charts** | ApexCharts + Recharts | Dashboard analytics |
| **PDF** | jsPDF + html2canvas | Certificates, reports |
| **QR Code** | qrcode.react + html5-qrcode | Generate & scan |
| **Animation** | Framer Motion | v12.34 |
| **Editor** | Editor.js | Article/blog writing |
| **Icons** | Lucide React | v0.562 |
| **Routing** | React Router DOM | v7.12 |
| **Survey** | SurveyJS | SKM surveys |
| **Testing** | Playwright | E2E tests |
| **Deploy** | FTP + custom smart deploy | build-all.cjs, deploy-smart.cjs |

## Architecture

### Folder Structure
```
src/
├── App.jsx              ← Main app (57KB, massive routing file)
├── index.css            ← Theme system (38KB, CSS variables)
├── main.jsx             ← Entry point
├── components/
│   ├── common/          ← Shared UI (Button, Card, Modal)
│   ├── features/        ← Feature-specific components
│   ├── dashboard/       ← Dashboard widgets
│   ├── layout/          ← Layout components
│   ├── public/          ← Public-facing components
│   ├── pwa/             ← PWA install prompts
│   ├── ui/              ← Base UI primitives
│   └── widgets/         ← Widget components
├── pages/
│   ├── Dashboard.jsx    ← Main dashboard (20KB)
│   ├── LoginPage.jsx    ← Login with themes (11KB)
│   ├── superadmin/      ← SuperAdmin panel
│   ├── admin/           ← Admin panel
│   ├── tim-tu/          ← Tata Usaha (admin team)
│   ├── tim-widyaiswara/ ← Trainer team
│   ├── tim-kemitraan/   ← Partnership team
│   ├── public/          ← Public-facing pages
│   ├── dashboard/       ← Dashboard sub-pages
│   ├── InfographicStudio/ ← Infographic builder
│   └── HelpCenter/      ← Help documentation
├── services/
│   ├── api/             ← External API connections (Groq, Gemini, Supabase)
│   ├── business/        ← Business logic
│   ├── database/        ← Data layer
│   ├── hooks/           ← Service hooks
│   ├── pwa/             ← PWA service worker
│   └── utils/           ← Helper functions
├── contexts/            ← Auth, Theme, i18n, Notification, Onboarding, Toast
├── stores/              ← Zustand (chatStore, themeStore)
├── hooks/               ← Custom React hooks
├── config/              ← Constants & settings
├── data/                ← Static data
├── styles/              ← Additional stylesheets
├── utils/               ← Utility functions
└── simulation/          ← Simulation/testing data
```

### Key Patterns
- **Multi-role auth**: SuperAdmin, Admin, Tim TU, Widyaiswara, Kemitraan — each has own pages
- **AI fallback**: Groq → Gemini Key 1 → Gemini Key 2 → Error message
- **Theme system**: CSS Variables (`--primary-gold`) with light/dark mode
- **State split**: Context for auth/theme/notifications, Zustand for chat/theme data
- **PDF generation**: jsPDF + html2canvas for certificates, attendance reports 
- **QR system**: Generate QR for events, scan for attendance
- **i18n**: Internationalization support via I18nContext
- **PWA**: Progressive Web App with service worker

### Database (Supabase)
- Multi-tenancy via SQL migrations (V1-V4)
- User roles stored in Supabase
- Event management, attendance, surveys (SKM)
- File storage for avatars, documents

### Deployment
- Custom build script: `build-all.cjs` (builds main + sub-projects)
- Smart FTP deploy: `deploy-smart.cjs` (diff-based, only changed files)
- Manual deploy via `deploy.ps1`

## Known Patterns
- App.jsx is VERY large (57KB) — acts as monolithic router
- index.css is VERY large (38KB) — contains all styles + themes
- JavaScript (not TypeScript) — type safety via convention
- Custom CSS preferred over utility-first approach
- Context + Zustand hybrid state management

## Gotchas
- ⚠️ App.jsx 57KB — any route change means editing this massive file
- ⚠️ index.css 38KB — all styles in one file, can be slow to parse
- ⚠️ LoginPage.css 31KB — login page has separate massive CSS
- ⚠️ .env contains real API keys — NEVER commit to git
- ⚠️ Multiple SQL migration files at root — should be in /database or /supabase

## Date Analyzed: 2026-03-17
## Sources: Direct project scan
