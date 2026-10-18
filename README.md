# TalentTrack ATS

> **Smart, Simple Hiring** — Modern, clean applicant tracking platform with heuristic ATS match scoring and end-to-end recruitment pipeline management.

TalentTrack ATS is a production-ready recruitment platform built on the MERN stack (MongoDB, Express, React, Node.js) with a dedicated local Python FastAPI match-scoring microservice.

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────┐
│     React Frontend (Port 3000)  │  React 18, React Router v6, Tailwind CSS, Centralized API Client
└────────────────┬────────────────┘
                 │ HTTP (REST)
                 ▼
┌─────────────────────────────────┐
│    Express Backend (Port 5000)  │  Node.js ES Modules, JWT Auth, Role-Based Access Control, Mongoose
└────────┬───────────────┬────────┘
         │               │ HTTP (Backend-to-Backend Proxy)
         ▼               ▼
┌─────────────────┐  ┌───────────────────────────────────┐
│ MongoDB Atlas   │  │ Python FastAPI Scorer (Port 8000) │  Auto-spawned by Express
└─────────────────┘  └───────────────────────────────────┘
```

- **Frontend (`client/`)**: React 18 SPA, React Router v6, Tailwind CSS, React Hook Form, Boxicons, React Toastify. Configured for Netlify deployment with client-side SPA routing (`_redirects` / `netlify.toml`).
- **Backend (`server/`)**: Node.js, Express.js (ES Modules), Mongoose ODM, Multer (resume storage), bcryptjs, jsonwebtoken, automated child-process manager for Python. Configured for Render deployment (`render.yaml`).
- **Scoring Microservice (`python-ats/`)**: Python 3.11, FastAPI, Uvicorn, Pydantic, pytest. Computes transparent heuristic resume-job match scores.

---

## 👥 Role-Based Access Control (RBAC) Matrix

TalentTrack ATS enforces strict role-based authorization across backend APIs and frontend routes:

| Role | Core Purpose | Capabilities & Tasks | Permitted UI Pages |
| :--- | :--- | :--- | :--- |
| **Employer** | Hiring Manager / Admin | • Post, edit, and delete job listings<br>• View ATS hiring dashboard & KPIs<br>• View candidate roster, profiles, and resumes<br>• Advance candidate stages and add interview notes<br>• Trigger ATS match scoring<br>• Delete candidate/user profiles | `/dash`<br>`/all-jobs`<br>`/post-job`<br>`/update-job/:id`<br>`/candidates`<br>`/candidate/:id`<br>`/shortlist`<br>`/coordinator/review`<br>`/recruiter/review` |
| **Coordinator** | Hiring Ops / Lead | • Review newly submitted applications<br>• Assign candidates to Recruiters<br>• Track candidate pipeline & transitions<br>• View ATS dashboard & analytics<br>• Create and update job posts<br>• Trigger ATS match scoring | `/dash`<br>`/coordinator/review`<br>`/assign-recruiter/:id`<br>`/candidates`<br>`/candidate/:id`<br>`/shortlist`<br>`/all-jobs`<br>`/post-job` |
| **Recruiter** | Talent Acquisition / Interviewer | • Review assigned candidate pipeline<br>• Evaluate candidate profiles & resumes<br>• Run Python ATS heuristic match scoring<br>• Advance candidate stages (`Applied` → `Screening` → `Interview` → `Assessment` → `Offer` / `Rejected`)<br>• Add interview evaluation feedback & notes<br>• View shortlisted candidates | `/dash`<br>`/recruiter/review`<br>`/candidates`<br>`/candidate/:id`<br>`/shortlist`<br>`/shortlist/details/:candidate_id/:job_id` |
| **Candidate** | Job Seeker / Applicant | • Browse all posted open positions<br>• View job descriptions and requirements<br>• Submit job applications with resume and contact details<br>• Upload resume documents (`.pdf`, `.docx`)<br>• Track status of their own submitted applications | `/all-posted-jobs`<br>`/current-job/:id`<br>`/application-form/:id`<br>`/my-jobs` |

---

## ⚡ Core ATS Features

- **Recruitment Command Center**: Live KPIs (Total Candidates, Active Jobs, Total Applications) and real-time stage distribution calculated directly from MongoDB Atlas.
- **Candidate Management**:
  - Full candidate roster with multi-field search (name, email, skills).
  - Hiring stage filter and 1-click stage advancement.
  - Candidate profile view with recruiter notes, stage timeline, and resume download.
- **Structured Hiring Workflow**:
  - Supported stages: `Applied` → `Screening` → `Interview` → `Assessment` → `Offer` → `Hired` (plus `Rejected`).
- **Python ATS Match Scorer**:
  - Transparent heuristic scoring formula: 50% required skill coverage, 30% keyword overlap, 20% role title relevance.
  - Normalizes aliases (e.g. `JS` ↔ `JavaScript`, `NodeJS` ↔ `Node.js`, `Postgres` ↔ `PostgreSQL`).
  - Safe word-boundary token matching (prevents "Java" from falsely matching "JavaScript").
  - Breakdown of matched and missing skills with actionable recommendations.
- **Automated Service Management**: When the Node.js server starts, it automatically boots the Python FastAPI scoring service in the background and gracefully terminates it on exit.

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or v3.11 with `pip`
- **MongoDB**: MongoDB Atlas cluster URI or local MongoDB instance

---

## 🚀 Local Setup & Run Instructions (Windows PowerShell)

### Step 1: Clone and Configure Environment

```powershell
# Clone the repository
git clone https://github.com/Chaitanyaraut027/Ats-Tracking.git
cd Ats-Tracking

# Configure Server environment
copy server\.env.example server\.env

# Configure Client environment
copy client\.env.example client\.env

# Configure Python microservice environment
copy python-ats\.env.example python-ats\.env
```

Update `server/.env` with your MongoDB connection string and JWT secret:
```ini
PORT=5000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/talenttrack_ats?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
ATS_SCORING_SERVICE_URL=http://localhost:8000
ATS_SERVICE_TIMEOUT_MS=6000
```

### Step 2: Install Dependencies & Setup Python Virtual Environment

```powershell
# Setup Python virtual environment & install requirements
cd python-ats
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..

# Install Backend dependencies
cd server
npm install
cd ..

# Install Frontend dependencies
cd client
npm install --legacy-peer-deps
cd ..
```

### Step 3: Run the Application

#### Terminal 1: Backend Server (Auto-Spawns Python Service)
```powershell
cd server
npm start
```
*The Express server connects to MongoDB, starts on port `5000`, and automatically launches the Python FastAPI service on port `8000` (`http://localhost:8000/docs`).*

#### Terminal 2: React Frontend
```powershell
cd client
npm start
```
*The React development server compiles and opens at `http://localhost:3000`.*

---

## 🧪 Testing

### Backend & Service Integration Tests
```powershell
cd server
npm test
```

### Python ATS Scorer Unit & API Tests (pytest)
```powershell
cd python-ats
.\venv\Scripts\Activate.ps1
pytest -v
```

### Frontend Production Build Verification
```powershell
cd client
npm run build
```

---

## 🌐 Deployment Configuration

### 1. Frontend Deployment (Netlify)
- **Repository Root**: `/`
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `build` (or `client/build`)
- **Environment Variables**:
  - `REACT_APP_API_URL`: Your deployed Render backend URL (e.g. `https://talenttrack-backend.onrender.com`)
- **SPA Routing**: Handled automatically via `client/public/_redirects` and root `netlify.toml`.

### 2. Backend Deployment (Render)
- **Service Type**: Web Service
- **Root Directory**: `server`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Health Check Path**: `/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `5000`
  - `MONGODB_URL`: Your production MongoDB Atlas connection string
  - `JWT_SECRET`: Production random secret key
  - `ATS_SCORING_SERVICE_URL`: URL of the Python ATS service (or `http://localhost:8000` if collocated)
- **Blueprint**: Included in `render.yaml`.

---

## 📡 API Reference Summary

| Method | Endpoint | Access / Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Backend health check and uptime |
| `POST` | `/auth/register` | Public | Register new user (recruiter, candidate, coordinator, employer) |
| `POST` | `/auth/login` | Public | Authenticate user and issue JWT token |
| `POST` | `/auth/logout` | Public | Clear user session cookies |
| `GET` | `/api/dashboard/metrics` | `employer`, `recruiter`, `coordinator` | Live ATS pipeline metrics & KPIs |
| `GET` | `/api/candidates` | `employer`, `recruiter`, `coordinator` | List all candidates with search & stage filter |
| `GET` | `/api/candidates/:id` | `employer`, `recruiter`, `coordinator` | Get candidate profile by ID |
| `PUT` | `/api/candidates/:id/stage`| `employer`, `recruiter`, `coordinator` | Advance candidate pipeline stage |
| `POST` | `/api/candidates/:id/notes`| `employer`, `recruiter`, `coordinator` | Add interview feedback note to candidate |
| `DELETE`| `/api/candidates/:id` | `employer` | Delete candidate profile |
| `POST` | `/api/candidates/:candidateId/score` | `employer`, `recruiter`, `coordinator` | Evaluate candidate resume against job requirements |
| `POST` | `/api/score` | `employer`, `recruiter`, `coordinator` | Direct heuristic score proxy to Python service |
| `GET` | `/jobs/all-jobs` | Public | List all open job requisitions |
| `GET` | `/jobs/current-job/:id`| Public | Retrieve job details by ID |
| `POST` | `/jobs/post-job` | `employer`, `coordinator` | Create new job post |
| `PUT` | `/jobs/update-job/:id` | `employer`, `coordinator` | Update existing job post |
| `DELETE`| `/jobs/delete-job/:id` | `employer` | Delete job post |
| `POST` | `/application/post-application` | Public / Candidate | Submit job application |
| `POST` | `/upload/resume/:id` | Candidate | Upload candidate resume document |

---

## 🔒 Security Best Practices

- All real `.env` files and credentials are strictly ignored in `.gitignore`.
- Password hashes use salt rounds via `bcryptjs`.
- HTTP-only authentication cookies and authorization headers with JSON Web Tokens.
- Input validation via Pydantic schemas in Python and Mongoose schemas in Express.
- Cross-Origin Resource Sharing (CORS) configured with credentials support.

---

## 📄 License

MIT License. Designed and maintained for **TalentTrack ATS: Smart, Simple Hiring**.
