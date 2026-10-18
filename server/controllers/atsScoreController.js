import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

const PYTHON_SERVICE_URL = process.env.ATS_SCORING_SERVICE_URL || 'http://localhost:8000';
const TIMEOUT_MS = parseInt(process.env.ATS_SERVICE_TIMEOUT_MS, 10) || 6000;

// Helper: Call Python FastAPI service with timeout
const callPythonScorer = async (payload) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(`${PYTHON_SERVICE_URL}/api/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Python ATS scoring service returned ${response.status}: ${errBody}`);
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error(`Python ATS service timed out after ${TIMEOUT_MS}ms`);
        }
        if (err.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
            throw new Error(`ATS Match Scoring service is unreachable at ${PYTHON_SERVICE_URL}. Please start the Python service.`);
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
};

// Extract resume text for a candidate
const getCandidateResumeText = (candidate) => {
    // 1. If explicit resumeText stored in candidate record
    if (candidate.resumeText && candidate.resumeText.trim().length > 10) {
        return candidate.resumeText;
    }

    // 2. Check uploaded file on disk
    const uploadDir = path.resolve('uploads', 'resume');
    if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        const userFile = files.find(f => f.startsWith(candidate._id.toString()));
        if (userFile) {
            const ext = path.extname(userFile).toLowerCase();
            const filePath = path.join(uploadDir, userFile);
            if (ext === '.txt') {
                try {
                    return fs.readFileSync(filePath, 'utf-8');
                } catch (e) {}
            }
            // For PDFs, we can note that the file is on disk
        }
    }

    // 3. Fallback: synthesize candidate profile text (name, skills, address)
    const skillsText = Array.isArray(candidate.skills) ? candidate.skills.join(', ') : '';
    return `Candidate Name: ${candidate.userName}\nLocation: ${candidate.address}\nSkills: ${skillsText}`;
};

// POST /api/candidates/:candidateId/score
export const scoreCandidateForJob = async (req, res) => {
    try {
        const candidateId = req.params.candidateId || req.body.candidateId;
        const jobId = req.body.jobId || req.query.jobId;
        const customResumeText = req.body.resume_text;
        const customJobDesc = req.body.job_description;

        let candidate = null;
        let job = null;

        if (candidateId) {
            try {
                candidate = await User.findById(candidateId);
            } catch (e) {}
        }

        if (jobId) {
            try {
                job = await Job.findById(jobId);
            } catch (e) {}
        }

        // Determine resume text
        let resumeText = customResumeText;
        if (!resumeText && candidate) {
            resumeText = getCandidateResumeText(candidate);
        }

        // Determine job description & required skills
        let jobDescription = customJobDesc || (job ? job.description : '');
        let roleTitle = req.body.role_title || (job ? job.jobTitle : 'Role');
        let requiredSkills = req.body.required_skills || (job?.requiredSkills?.length ? job.requiredSkills : []);

        // If no required skills isolated yet, check job's screening questions or title
        if ((!requiredSkills || requiredSkills.length === 0) && job?.applicationForm?.question) {
            // Screen questions often mention skills
            requiredSkills = job.applicationForm.question
                .map(q => q.replace(/[^a-zA-Z0-9+#. ]/g, '').trim())
                .filter(Boolean);
        }

        if (!resumeText || !resumeText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'No resume text available for this candidate. Please upload a resume or provide text manually.'
            });
        }

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Job description is required to calculate match score.'
            });
        }

        const scoringPayload = {
            resume_text: resumeText,
            job_description: jobDescription,
            role_title: roleTitle,
            required_skills: requiredSkills,
        };

        // Call Python service
        const scoreResult = await callPythonScorer(scoringPayload);

        // Optionally persist to Application if candidate and job exist
        if (candidate && job) {
            try {
                let application = await Application.findOne({
                    candidateID: candidate._id.toString(),
                    jobID: job._id.toString(),
                });

                if (!application) {
                    // Try by object id
                    application = await Application.findOne({
                        candidateID: candidate._id,
                        jobID: job._id,
                    });
                }

                if (application) {
                    application.matchScore = scoreResult.overall_score;
                    application.matchBreakdown = {
                        component_scores: scoreResult.component_scores,
                        matched_skills: scoreResult.matched_skills,
                        missing_skills: scoreResult.missing_skills,
                        explanation: scoreResult.explanation,
                        version: '1.0',
                        calculatedAt: new Date(),
                    };
                    await application.save();
                }
            } catch (saveErr) {
                console.error('Non-critical: Failed to save score in Application:', saveErr.message);
            }
        }

        res.status(200).json({
            success: true,
            candidateId: candidate?._id,
            jobId: job?._id,
            ...scoreResult,
        });
    } catch (error) {
        console.error('Error in scoreCandidateForJob:', error);
        res.status(502).json({
            success: false,
            message: error.message || 'Scoring failed',
        });
    }
};

// Direct score calculation proxy POST /api/score
export const directScore = async (req, res) => {
    try {
        const { resume_text, job_description, role_title, required_skills } = req.body;
        if (!resume_text || !job_description) {
            return res.status(400).json({
                success: false,
                message: 'Both resume_text and job_description are required.',
            });
        }

        const scoreResult = await callPythonScorer({
            resume_text,
            job_description,
            role_title: role_title || '',
            required_skills: required_skills || [],
        });

        res.status(200).json({
            success: true,
            ...scoreResult,
        });
    } catch (error) {
        res.status(502).json({
            success: false,
            message: error.message || 'Scoring service unavailable',
        });
    }
};
