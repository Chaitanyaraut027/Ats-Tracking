import math
from typing import List, Dict, Set, Tuple
from app.schemas import ScoreRequest, ScoreResponse, ComponentScores
from app.text_processing import normalize_text, tokenize, match_skill, SKILL_ALIASES

def compute_ats_score(request: ScoreRequest) -> ScoreResponse:
    resume = request.resume_text.strip()
    job_desc = request.job_description.strip()

    if not resume or not job_desc:
        return ScoreResponse(
            overall_score=0,
            component_scores=ComponentScores(
                required_skills=0.0,
                keyword_overlap=0.0,
                role_relevance=0.0
            ),
            matched_skills=[],
            missing_skills=request.required_skills or [],
            explanation="Either resume text or job description was empty. No match could be evaluated.",
            scoring_version="1.0"
        )

    # 1. Required Skills Matching (Weight: 50%)
    req_skills = request.required_skills or []
    # Deduplicate required skills by lowercase
    seen_skills = set()
    unique_req_skills = []
    for s in req_skills:
        clean = s.strip()
        if clean and clean.lower() not in seen_skills:
            seen_skills.add(clean.lower())
            unique_req_skills.append(clean)

    matched_skills = []
    missing_skills = []

    for skill in unique_req_skills:
        if match_skill(skill, resume):
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    has_required_skills = len(unique_req_skills) > 0
    if has_required_skills:
        required_skills_score = (len(matched_skills) / len(unique_req_skills)) * 100.0
    else:
        required_skills_score = 0.0

    # 2. Relevant Keyword and Technical Skill Overlap (Weight: 30%)
    resume_tokens = set(tokenize(resume))
    jd_tokens = set(tokenize(job_desc))

    if jd_tokens:
        overlap_tokens = resume_tokens.intersection(jd_tokens)
        # Jaccard index weighted against JD requirements
        # Score is fraction of JD keywords present in resume
        jd_coverage = len(overlap_tokens) / len(jd_tokens)
        # Scale with diminishing returns curve so solid coverage reaches 80-100%
        keyword_overlap_score = min(100.0, jd_coverage * 150.0)
    else:
        keyword_overlap_score = 0.0

    # 3. Role and Responsibility Relevance (Weight: 20%)
    role_relevance_score = 0.0
    role_title = (request.role_title or "").strip()

    if role_title:
        role_tokens = set(tokenize(role_title))
        if role_tokens:
            role_matches = resume_tokens.intersection(role_tokens)
            role_title_coverage = len(role_matches) / len(role_tokens)
            role_relevance_score += role_title_coverage * 50.0  # up to 50 pts
    else:
        # If no role title, check action verbs / responsibility overlap
        role_relevance_score += 25.0

    # Common engineering and professional responsibility indicators
    action_terms = {"develop", "lead", "manage", "build", "design", "architect", "deploy", "optimize", "deliver", "collaborate"}
    action_overlap = resume_tokens.intersection(action_terms).intersection(jd_tokens)
    role_relevance_score += min(50.0, len(action_overlap) * 10.0)
    role_relevance_score = min(100.0, role_relevance_score)

    # Calculate overall weighted score
    if has_required_skills:
        weighted_score = (
            (required_skills_score * 0.50) +
            (keyword_overlap_score * 0.30) +
            (role_relevance_score * 0.20)
        )
    else:
        # Adapted weighting when required_skills not explicitly isolated:
        # 60% keyword overlap, 40% role relevance
        weighted_score = (
            (keyword_overlap_score * 0.60) +
            (role_relevance_score * 0.40)
        )

    overall_score = int(round(max(0.0, min(100.0, weighted_score))))

    # Build human-readable explanation
    explanation_parts = []
    if has_required_skills:
        if len(missing_skills) == 0:
            explanation_parts.append(f"Resume satisfies all {len(matched_skills)} required skill requirements.")
        elif len(matched_skills) > 0:
            explanation_parts.append(
                f"Candidate matches {len(matched_skills)} of {len(unique_req_skills)} required skills ({', '.join(matched_skills)}). "
                f"Missing: {', '.join(missing_skills)}."
            )
        else:
            explanation_parts.append(f"None of the {len(unique_req_skills)} required skills were identified in the resume text.")
    else:
        explanation_parts.append("No explicit required skills list provided; evaluated against job description keyword density and role requirements.")

    if keyword_overlap_score >= 70:
        explanation_parts.append("Strong technical vocabulary and domain terminology overlap with the job description.")
    elif keyword_overlap_score >= 40:
        explanation_parts.append("Moderate keyword alignment with key requirements.")
    else:
        explanation_parts.append("Limited shared terminology found between resume and job description.")

    explanation = " ".join(explanation_parts)

    return ScoreResponse(
        overall_score=overall_score,
        component_scores=ComponentScores(
            required_skills=round(required_skills_score, 1),
            keyword_overlap=round(keyword_overlap_score, 1),
            role_relevance=round(role_relevance_score, 1)
        ),
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        matched_preferred_skills=[],
        explanation=explanation,
        scoring_version="1.0"
    )
