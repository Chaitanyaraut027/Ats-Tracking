# TalentTrack ATS — Python Match Scoring Microservice

A lightweight, explainable heuristic match-scoring microservice built with FastAPI. It estimates candidate qualification alignment against specific job descriptions without external LLM dependencies or paid API keys.

## Features

- **Explainable Weighted Scoring**:
  - **50%**: Required Skill Coverage (with alias normalization like `JS` $\rightarrow$ `JavaScript`, `Postgres` $\rightarrow$ `PostgreSQL`, `Node` $\rightarrow$ `Node.js`).
  - **30%**: Domain & Technical Keyword Overlap (Jaccard token coverage).
  - **20%**: Role & Responsibility Alignment.
- **Boundary-Safe Matching**: Prevents false positive substring matches (e.g., "Java" will not falsely match "JavaScript").
- **PDF & Plaintext Extraction**: Supports parsing resume text from PDF documents using `pypdf`.
- **Adaptive Weighting**: Gracefully handles roles where required skills are not explicitly isolated.

## API Endpoints

### 1. `GET /health`
Returns microservice health status.

**Response:**
```json
{
  "status": "ok",
  "service": "TalentTrack ATS Match Scorer",
  "version": "1.0.0"
}
```

### 2. `POST /api/score`
Computes heuristic match score between resume and job description.

**Request:**
```json
{
  "resume_text": "Experienced full-stack developer with 5+ years building web applications in React, Node.js, Express, and PostgreSQL.",
  "job_description": "Looking for a full stack engineer proficient in React, Node.js, Express, and PostgreSQL.",
  "role_title": "Full Stack Engineer",
  "required_skills": ["React", "Node.js", "Express", "PostgreSQL"]
}
```

**Response:**
```json
{
  "overall_score": 85,
  "component_scores": {
    "required_skills": 100.0,
    "keyword_overlap": 75.0,
    "role_relevance": 65.0
  },
  "matched_skills": ["React", "Node.js", "Express", "PostgreSQL"],
  "missing_skills": [],
  "explanation": "Resume satisfies all 4 required skill requirements. Strong technical vocabulary and domain terminology overlap with the job description.",
  "scoring_version": "1.0"
}
```

### 3. `POST /api/extract-resume`
Extracts text from an uploaded `.pdf` or `.txt` resume file.

## Running Locally

In PowerShell:

```powershell
cd python-ats
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

## Running Tests

```powershell
pytest -v
```
