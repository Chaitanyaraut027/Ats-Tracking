import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "TalentTrack ATS" in data["service"]

def test_api_score_endpoint_success():
    payload = {
        "resume_text": "Experienced React and Node.js developer with PostgreSQL and Express experience.",
        "job_description": "We are seeking a React and Node.js engineer with PostgreSQL knowledge.",
        "role_title": "Full Stack Engineer",
        "required_skills": ["React", "Node.js", "PostgreSQL"]
    }
    response = client.post("/api/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert data["overall_score"] >= 65
    assert len(data["matched_skills"]) == 3
    assert data["component_scores"]["required_skills"] == 100.0

def test_api_score_empty_body_validation():
    # Sending empty JSON fails Pydantic schema validation with 422
    response = client.post("/api/score", json={})
    assert response.status_code == 422
