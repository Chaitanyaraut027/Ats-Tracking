from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import ScoreRequest, ScoreResponse, HealthResponse
from app.scorer import compute_ats_score
from app.text_processing import extract_text_from_pdf

app = FastAPI(
    title="TalentTrack ATS Match Scoring Service",
    description="Explainable, lightweight heuristic resume and job matching microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        service="TalentTrack ATS Match Scorer",
        version="1.0.0"
    )

@app.post("/api/score", response_model=ScoreResponse)
def score_resume(request: ScoreRequest):
    try:
        return compute_ats_score(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")

@app.post("/api/extract-resume")
async def extract_resume(file: UploadFile = File(...)):
    filename = file.filename.lower() if file.filename else ""
    contents = await file.read()
    
    if filename.endswith(".pdf"):
        try:
            text = extract_text_from_pdf(contents)
            return {"filename": file.filename, "text": text}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif filename.endswith(".txt"):
        try:
            text = contents.decode("utf-8", errors="ignore")
            return {"filename": file.filename, "text": text}
        except Exception as e:
            raise HTTPException(status_code=400, detail="Unable to decode text file")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a .pdf or .txt file.")
