import pytest
from app.schemas import ScoreRequest
from app.scorer import compute_ats_score
from app.text_processing import match_skill, tokenize

def test_strong_match():
    request = ScoreRequest(
        resume_text="Senior Full Stack Engineer with 6+ years in React, JavaScript, Node.js, Express, and PostgreSQL. Experienced architecting scalable cloud services and REST APIs.",
        job_description="Seeking a Full Stack Engineer to build and architect cloud web services using React, Node.js, Express, and PostgreSQL. Must have experience delivering robust REST APIs.",
        role_title="Full Stack Engineer",
        required_skills=["React", "JavaScript", "Node.js", "Express", "PostgreSQL"]
    )
    res = compute_ats_score(request)
    assert res.overall_score >= 80
    assert len(res.matched_skills) == 5
    assert len(res.missing_skills) == 0
    assert res.component_scores.required_skills == 100.0
    assert "satisfies all" in res.explanation

def test_partial_match():
    request = ScoreRequest(
        resume_text="Frontend specialist proficient in React, HTML, CSS, and basic JavaScript. Seeking next challenge in web development.",
        job_description="Full Stack developer needed with React, Node.js, Docker, Kubernetes, and PostgreSQL.",
        role_title="Full Stack Developer",
        required_skills=["React", "Node.js", "PostgreSQL", "Docker", "Kubernetes"]
    )
    res = compute_ats_score(request)
    assert 20 <= res.overall_score <= 65
    assert "React" in res.matched_skills
    assert "Node.js" in res.missing_skills
    assert "Docker" in res.missing_skills
    assert res.component_scores.required_skills == 20.0  # 1 out of 5

def test_poor_match():
    request = ScoreRequest(
        resume_text="Experienced accountant specializing in QuickBooks, tax audit preparation, compliance, and accounts receivable.",
        job_description="Looking for a Senior DevOps Engineer to manage Kubernetes clusters, AWS infrastructure, Terraform, and CI/CD pipelines.",
        role_title="DevOps Engineer",
        required_skills=["Kubernetes", "AWS", "Terraform", "CI/CD"]
    )
    res = compute_ats_score(request)
    assert res.overall_score < 25
    assert len(res.matched_skills) == 0
    assert len(res.missing_skills) == 4
    assert res.component_scores.required_skills == 0.0

def test_empty_or_whitespace_input():
    request = ScoreRequest(
        resume_text="   ",
        job_description="React developer",
        required_skills=["React"]
    )
    res = compute_ats_score(request)
    assert res.overall_score == 0
    assert res.component_scores.required_skills == 0.0

def test_missing_required_skills_adaptive_weighting():
    request = ScoreRequest(
        resume_text="Python data analyst working with pandas, numpy, and sql queries.",
        job_description="Seeking a data analyst skilled in python and sql data analytics.",
        role_title="Data Analyst",
        required_skills=[]
    )
    res = compute_ats_score(request)
    # When no explicit required skills, weighting adapts to keyword + role relevance
    assert res.overall_score > 50
    assert "No explicit required skills" in res.explanation

def test_skills_with_aliases():
    # Candidate writes 'JS', 'NodeJS', 'Postgres', 'k8s'
    resume = "Developed applications using JS, NodeJS, Postgres database, and k8s orchestration."
    assert match_skill("JavaScript", resume) is True
    assert match_skill("Node.js", resume) is True
    assert match_skill("PostgreSQL", resume) is True
    assert match_skill("Kubernetes", resume) is True

def test_word_boundary_safety():
    # 'Java' must not falsely match 'JavaScript'
    resume = "Front-end engineer with expertise in JavaScript and React."
    assert match_skill("JavaScript", resume) is True
    assert match_skill("Java", resume) is False

def test_duplicate_skills_and_repeated_keywords():
    request = ScoreRequest(
        resume_text="React React React React React. JavaScript JavaScript.",
        job_description="React developer with React and JavaScript skills.",
        role_title="Frontend Developer",
        required_skills=["React", "React", "JavaScript"]  # duplicates in request
    )
    res = compute_ats_score(request)
    # Duplicates in request are deduplicated
    assert len(res.matched_skills) == 2
    assert "React" in res.matched_skills
    assert "JavaScript" in res.matched_skills
    assert res.component_scores.required_skills == 100.0
