# Smart Healthcare Management System - Frontend

This is the React frontend for the **Smart Healthcare Management System**, built with React 19, Vite, Tailwind CSS, and React Router.

## Features
- **Healthcare Dashboard**: Overview metrics (total patients, total documents, processed/processing stats, recent items).
- **Patient Management**: Search, filter, and view patient demographic and contact records.
- **Patient Details**: Medical document history, patient metadata, and direct document upload integration.
- **Document Management**: Document listing with status badges, detailed JSON extraction viewer, download signed URLs, and delete confirmation.
- **Document Upload**: Multipart upload for medical files (`.pdf`, `.jpg`, `.jpeg`, `.png`) with patient linking and progress tracking.
- **Document Search**: Search documents by query with relevance scores and quick previews.
- **Data Migration**: Run batch data migration and monitor progress (`POST /api/migration/start`).
- **Audit Logs**: Designed to consume future audit log telemetry with clean empty states.
- **Authentication**: Modular auth interface designed for Supabase Auth integration.

## Environment Configuration
Copy `.env.example` to `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8000
```

All API calls are centralized in `src/services/api.js` using `import.meta.env.VITE_API_BASE_URL`.

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
