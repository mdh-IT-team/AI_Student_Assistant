# AI Student Assistant

Full-stack code for the AI Student Assistant, a study platform that gives each student an
AI tutor scoped to the modules they are actually enrolled in. A React frontend talks to a
FastAPI backend, which is the only thing that touches the Supabase database.

## Repository structure

* `/Backend` — FastAPI server, JWT security, Supabase integration, file storage and the Gemini chat.
* `/frontend` — React (Vite) application, authentication state and role-based routing.

---

## Part 1: Backend setup (FastAPI)

### Prerequisites

* **Python 3.11 or newer** (tested on 3.14)
* The five **`.env`** values, listed in the document submitted with this project

### 1. Environment

Copy the example file and paste in the values from the submitted document:

```
cd Backend
cp .env.example .env
```

`.env` needs five variables:

```
SUPABASE_URL="your-supabase-project-url-here"
SUPABASE_KEY="your-supabase-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key-here"
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="gemini-2.5-flash"
```

Without `GEMINI_API_KEY` the server still starts, but `/api/chat` returns HTTP 503 and
`GET /api/chat/status` reports `"configured": false`.

`SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security and is used only for backend-owned
writes, such as mirroring a new Auth user into `ai_student.users` and `ai_student.profile`.
Never send it to the frontend.

### 2. Install (virtual environment)

A virtual environment keeps this off your global Python install.

**macOS / Linux**
```
python3 -m venv venv
source venv/bin/activate
```

**Windows**
```
python -m venv venv
venv\Scripts\activate
```

With it active:

```
pip install -r requirements.txt
```

### 3. Run the server

```
python3 main.py
```

The backend listens on **http://localhost:8000**, and the interactive Swagger UI is at
http://localhost:8000/docs. You can exercise every endpoint from there, including the
JWT guard, by pasting a token into **Authorize**.

The port matters: the frontend currently hardcodes `http://localhost:8000`, so the backend
has to run on 8000.

### 4. API endpoints

27 endpoints. Protected routes need `Authorization: Bearer <token>`; role-restricted routes
return 403 if the caller's role is wrong. The role is read from the database on every request,
never from the token.

**Public**

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Health check, confirms the Supabase connection |
| GET | `/test` | Developer test route |
| POST | `/auth/register` | Register with email, password and full name. Rejects duplicates |
| POST | `/auth/login` | Authenticate, returns a JWT and the user id |
| POST | `/logout` | End the Supabase session |
| POST | `/auth/forgot-password` | Trigger a password reset email |

**Authenticated (any role)**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/me` | Current user, with the role resolved from the database |
| GET | `/api/users/{user_id}` | Profile lookup via `user_profile_view` |
| POST | `/auth/change-password` | Change your own password |
| POST | `/api/chat` | Ask the AI tutor. Calls Gemini with the caller's role and modules |
| GET | `/api/chat/status` | Whether a Gemini key is configured, and which model |
| POST | `/api/chat/reset` | Clear the current conversation |
| POST | `/api/files/upload` | Upload material |
| GET | `/api/files/list` | List material |
| GET | `/api/files/download/{file_id}` | Download a file |
| DELETE | `/api/files/{file_id}` | Delete a file |

**Admin only**

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/users` | All users, newest first |
| PUT | `/admin/users/{user_id}/role` | Change a user's role |
| POST | `/admin/create-teacher` | Invite a teacher by email |
| POST | `/admin/create-student` | Invite a student by email |
| POST | `/api/modules` | Create a module and assign it to a teacher |
| GET | `/api/dashboard/admin` | Institution-wide counts |

**Teacher (or admin)**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/dashboard/teacher` | Modules owned by this teacher and their enrolled students |
| POST | `/api/modules/{module_id}/enroll/{student_id}/{semester}` | Enrol a student. Semester must be 1–7 |
| DELETE | `/api/modules/{module_id}/enroll/{student_id}` | Remove a student from a module |
| GET | `/api/modules/{module_id}/students` | Module roster |

**Student (or admin)**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/dashboard/student` | Enrolled modules and current semester |

Dashboards read the `modules` and `enrollments` tables. Enrolment is a real record — which
student, which module, which semester, since when — rather than a text field on a profile.

---

## Database setup

Nothing to set up. The Supabase keys in the submitted document point at the team's existing
project, which already has the `ai_student` schema, the tables, the Row Level Security policies
and the `materials` storage bucket. Fill in `.env` and the database is ready.

---

## Part 2: Frontend setup (React + Vite)

### Prerequisites

* **Node.js 18+**
* **npm**

### 1. Install

```
cd frontend
npm install
```

### 2. Run

```
npm run dev
```

The frontend serves on **http://localhost:5173**. Start the backend first, since the frontend
calls `http://localhost:8000` directly.

### 3. AI chat

The student and admin dashboards use one reusable chat component,
`frontend/src/components/AiChatBox.jsx`:

* Renders a scrollable message thread and an input, styled to match the dashboard panels.
* Takes a `role` prop (`admin`, `teacher` or `student`) that changes the greeting, subtitle
  and placeholder, so the same component reads as tailored to whoever is using it.
* On send, POSTs `{ message, role }` to `/api/chat` with the user's token attached. The backend
  re-verifies the role against the database rather than trusting the client, then calls Gemini.
* If the request fails it shows a visible notice and falls back to a clearly labelled local reply,
  so a broken backend never looks like a working assistant.

The teacher dashboard still has a placeholder chat input that does not call the API. Replacing
it with `AiChatBox` is outstanding.
