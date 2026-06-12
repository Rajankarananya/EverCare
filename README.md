# EverCare

EverCare is an Alzheimer care support app built around a patient/caregiver workflow. It combines static pages for the user experience with an Express and MySQL backend for authentication and stored care data.

## What This Project Does

The app is focused on everyday care tasks instead of a generic dashboard style site. It gives users a place to organize personal medical information, manage daily care routines, keep important documents and contacts in one place, and access support pages for caregivers and family members.

Main features in this repo:

- Patient and caregiver sign up / login
- Personal care plan with emergency medical details
- Guardian and caregiver contact storage
- Daily care task planning
- Medication and routine support pages
- Voice recording storage for reminders or notes
- Document tracking for medical, legal, or insurance files
- Feedback submission for app tools
- Contact and support messaging
- Caregiver community and help/resource pages

## Pages In The Frontend

The frontend lives in `frontend/public/` and is made of separate HTML pages rather than a React or SPA build.

- `index.html` - landing page
- `login.html` and `login_2.html` - login entry pages
- `register.html` - account creation page
- `dashboard.html` - main post-login hub
- `personal_plan.html` - patient profile and emergency information
- `daily-planner.html` - daily care task planning
- `medication-tracker.html` - medication support page
- `cognitive-exercises.html` - memory and brain exercise page
- `voice_rec.html` - voice recording page
- `journals.html` - journal/notes page
- `caregiver-community.html` - caregiver support/community page
- `tools.html` - tools and resources page
- `help.html` - help page
- `contact.html` - contact form page
- `emergency_resources.html` - emergency support page
- `about.html` - project/about page

Static assets used by those pages are stored in:

- `frontend/public/js/`
- `frontend/public/images/`
- `frontend/public/videos/`
- `frontend/public/pdf/`

## Backend

The backend is in `backend/` and runs with Express.

What it handles:

- User registration and login with JWT authentication
- Serving the frontend pages from the public folder
- Storing and reading personal plans, guardians, daily care tasks, voice recordings, documents, feedback, and messages

Important backend routes:

- `POST /api/register`
- `POST /api/login`
- `POST /api/personal-plan`
- `GET /api/personal-plan`
- `POST /api/guardians`
- `GET /api/guardians`
- `POST /api/daily-care`
- `GET /api/daily-care`
- `POST /api/recordings`
- `GET /api/recordings`
- `POST /api/documents`
- `GET /api/documents`
- `POST /api/feedback`
- `POST /api/messages`

The backend starts on port `3000` by default and also serves the static frontend files.

## Database

`backend/database.sql` defines the MySQL schema used by the app.

Tables in the database:

- `users` - account data and role (`patient` or `caregiver`)
- `personal_plans` - emergency and profile information
- `guardians` - caregiver/guardian contacts
- `daily_care_plans` - scheduled care tasks
- `voice_recordings` - stored voice notes or recordings
- `documents` - medical, legal, insurance, and other documents
- `feedback` - feedback about the tools in the app
- `messages` - contact form submissions

The schema is designed so each user owns their own care data through `user_id` foreign keys.

## Environment

Create or update `backend/.env` with your database and JWT settings:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=alzheimer_care
JWT_SECRET=your_secret_key
```

## Run It Locally

Install backend dependencies:

```bash
cd backend
npm install
```

Start the backend:

```bash
cd backend
npm start
```

Open the app through the backend at `http://localhost:3000`.

If you want to serve the static pages separately during development:

```bash
cd frontend/public
npx http-server -p 8080
```

## Git Ignore

The repo ignores environment files, dependencies, logs, and build output so secrets and generated files stay out of Git.
