# Business Context
> AI reads this to understand the project's business goals, users, and constraints.

---

## Project: BGTK Kaltim Digital Hub
- **Type:** Government Agency Internal Portal (SPA)
- **Organization:** BGTK Kalimantan Timur (Balai Guru Tenaga Kependidikan)
- **Status:** Production — deployed via FTP

## Target Users (Personas)

| Persona | Role | Needs |
|---------|------|-------|
| **Ibu Kepala** | SuperAdmin / Director | Overview dashboard, reports, team monitoring |
| **Admin Staff** | Admin | User management, event creation, document handling |
| **Tim TU** | Tata Usaha (Admin team) | Attendance, memos, administrative tasks |
| **Widyaiswara** | Trainers/Instructors | Training management, materials, scheduling |
| **Tim Kemitraan** | Partnership team | Partner management, collaboration tracking |
| **Public** | External visitors | Public information, event registration |

## Primary Goals
1. Digitize internal operations (attendance, events, documents)
2. Provide AI assistant for staff productivity
3. Generate automated reports (PDF, charts)
4. Manage events with QR-code attendance
5. Conduct satisfaction surveys (SKM)
6. Support multiple teams with role-based access

## Tech Constraints
- Deployed via FTP (not cloud CI/CD)
- JavaScript (not TypeScript) — team familiarity
- Supabase as BaaS (no custom backend server)
- Free tier AI APIs (Groq + Gemini with key rotation)
- Must work on government network (potentially restricted)

## Design Constraints
- Professional government look (not flashy startup)
- Dark/Light theme support
- Custom "Platinum CSS" design system
- DaisyUI v5 for component consistency
- Mobile-responsive (PWA support)

## KPIs
- [ ] All team operations digitized
- [ ] AI chat response time < 3s
- [ ] PDF generation works offline
- [ ] QR attendance working for all events
- [ ] SKM survey completion rate > 70%

---
<!-- Updated by AI — do not edit manually unless adding project-specific info -->
