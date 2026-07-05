# Teleios Backend

Minimal Node + Express backend to provide simple API endpoints for the Teleios frontend.

Quick start

1. Install dependencies

```bash
cd backend
npm install
```

2. Run

```bash
npm start
```

Endpoints

- `GET /api/team` — returns team data
- `GET /api/services` — returns services
- `GET /api/gallery` — returns gallery items
- `POST /api/contact` — accepts `{ name, email, subject, message }` and stores it in `data/contacts.json`. If SMTP is configured via environment variables, the message will also be forwarded.

Environment

Copy `.env.example` to `.env` to configure `PORT` and optional SMTP settings.
