from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class ScoreRequest(BaseModel):
    resume_text: str = Field(..., description="Text extracted from the candidate resume", min_length=1)
    job_description: str = Field(..., description="Full text of the job description", min_length=1)
    role_title: Optional[str] = Field(None, description="Job title / role name (e.g., Full Stack Developer)")
    required_skills: Optional[List[str]] = Field(default_factory=list, description="Explicit list of required skills")
    preferred_skills: Optional[List[str]] = Field(default_factory=list, description="Optional list of preferred / nice-to-have skills")

class ComponentScores(BaseModel):
    required_skills: float = Field(..., description="Score for required skills coverage (0-100)")
    keyword_overlap: float = Field(..., description="Score for keyword and technical terminology overlap (0-100)")
    role_relevance: float = Field(..., description="Score for role and responsibility relevance (0-100)")

class ScoreResponse(BaseModel):
    overall_score: int = Field(..., description="Overall normalized match score (0-100)")
    component_scores: ComponentScores
    matched_skills: List[str]
    missing_skills: List[str]
    matched_preferred_skills: Optional[List[str]] = Field(default_factory=list)
    explanation: str
    scoring_version: str = "1.0"

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
