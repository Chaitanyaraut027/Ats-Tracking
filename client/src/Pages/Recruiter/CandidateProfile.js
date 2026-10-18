import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const STAGES = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired', 'Rejected'];

export const CandidateProfile = () => {
    const { id } = useParams();

    const [candidate, setCandidate] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // ATS Match Score state
    const [scoreData, setScoreData] = useState(null);
    const [isScoring, setIsScoring] = useState(false);
    const [scoringError, setScoringError] = useState(null);

    // Notes state
    const [notes, setNotes] = useState([]);
    const [newNoteText, setNewNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    const fetchCandidateData = async () => {
        try {
            setIsLoading(true);
            const data = await api.get(`/api/candidates/${id}`);
            if (data && data.candidate) {
                setCandidate(data.candidate);
                setNotes(data.candidate.notes || []);
                if (data.candidate.resumeText) {
                    setResumeText(data.candidate.resumeText);
                } else {
                    const synth = `Candidate: ${data.candidate.userName}\nEmail: ${data.candidate.userEmail}\nSkills: ${(data.candidate.skills || []).join(', ')}\nLocation: ${data.candidate.address}`;
                    setResumeText(synth);
                }

                // If previous score exists on application
                if (data.applications && data.applications.length > 0 && data.applications[0].matchScore !== undefined) {
                    const app = data.applications[0];
                    setScoreData({
                        overall_score: app.matchScore,
                        component_scores: app.matchBreakdown?.component_scores || {
                            required_skills: app.matchScore,
                            keyword_overlap: app.matchScore,
                            role_relevance: app.matchScore,
                        },
                        matched_skills: app.matchBreakdown?.matched_skills || [],
                        missing_skills: app.matchBreakdown?.missing_skills || [],
                        explanation: app.matchBreakdown?.explanation || 'Score loaded from previous evaluation.',
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching candidate:', err);
            toast.error('Failed to load candidate profile');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchJobs = async () => {
        try {
            const data = await api.get('/jobs/all-jobs');
            if (Array.isArray(data)) {
                setJobs(data);
                if (data.length > 0) {
                    setSelectedJobId(data[0]._id);
                }
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCandidateData();
            fetchJobs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleStageUpdate = async (newStage) => {
        try {
            await api.put(`/api/candidates/${id}/stage`, { stage: newStage });
            setCandidate((prev) => ({ ...prev, currentStage: newStage }));
            toast.success(`Candidate moved to ${newStage}`);
        } catch (err) {
            console.error('Error updating stage:', err);
            toast.error('Failed to update hiring stage');
        }
    };

    const handleCalculateScore = async () => {
        if (!selectedJobId && jobs.length === 0) {
            toast.warning('Please select a job role to evaluate against');
            return;
        }

        try {
            setIsScoring(true);
            setScoringError(null);
            const selectedJob = jobs.find((j) => j._id === selectedJobId);

            const payload = {
                candidateId: id,
                jobId: selectedJobId,
                resume_text: resumeText,
                job_description: selectedJob ? selectedJob.description : '',
                role_title: selectedJob ? selectedJob.jobTitle : '',
                required_skills: selectedJob?.requiredSkills || [],
            };

            const result = await api.post(`/api/candidates/${id}/score`, payload);
            if (result.success) {
                setScoreData(result);
                toast.success(`ATS Match Score calculated: ${result.overall_score}%`);
            }
        } catch (err) {
            console.error('Scoring error:', err);
            setScoringError(err.message || 'Scoring microservice unavailable. Ensure Python FastAPI is running on port 8000.');
            toast.error(err.message || 'Failed to compute match score');
        } finally {
            setIsScoring(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNoteText.trim()) return;

        try {
            setIsSavingNote(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await api.post(`/api/candidates/${id}/notes`, {
                text: newNoteText,
                author: user.userName || 'Recruiter',
            });
            if (res.success) {
                setNotes(res.notes);
                setNewNoteText('');
                toast.success('Note added');
            }
        } catch (err) {
            console.error('Error adding note:', err);
            toast.error('Failed to add note');
        } finally {
            setIsSavingNote(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-gray-500">
                Loading candidate profile...
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <p className="text-gray-600 font-semibold">Candidate not found</p>
                <Link to="/candidates" className="mt-4 inline-block text-sm font-semibold text-[#087658] hover:underline">
                    ← Back to Candidate Roster
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* TOP HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#087658] flex items-center justify-center font-black text-2xl">
                        {candidate.userName ? candidate.userName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{candidate.userName}</h1>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {candidate.currentStage || 'Applied'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{candidate.userEmail} • {candidate.address || 'Remote'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/candidates"
                        className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        ← Candidate Roster
                    </Link>
                    {candidate.resumeUrl && (
                        <a
                            href={candidate.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 text-xs font-semibold text-[#087658] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                        >
                            View Resume File
                        </a>
                    )}
                </div>
            </div>

            {/* STAGE STEPPER */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Hiring Pipeline Stage</h2>
                    <span className="text-xs text-gray-400">Click a stage to advance or update candidate</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {STAGES.map((s) => {
                        const isActive = (candidate.currentStage || 'Applied') === s;
                        const isRejected = s === 'Rejected';
                        return (
                            <button
                                key={s}
                                onClick={() => handleStageUpdate(s)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    isActive
                                        ? isRejected
                                            ? 'bg-rose-600 text-white shadow-sm'
                                            : 'bg-[#087658] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {isActive && '✓ '}
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TWO COLUMN GRID: CANDIDATE INFO + ATS MATCH SCORER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: CANDIDATE PROFILE & NOTES (5 COLS) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* PROFILE CARD */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                            Candidate Profile
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-400 block">Full Name</span>
                                <span className="font-medium text-gray-900">{candidate.userName}</span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-400 block">Email Address</span>
                                <span className="font-medium text-gray-900">{candidate.userEmail}</span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-400 block">Location</span>
                                <span className="font-medium text-gray-900">{candidate.address || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-400 block">Gender</span>
                                <span className="font-medium text-gray-900">{candidate.gender || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase text-gray-400 block mb-1">Key Skills</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {candidate.skills && candidate.skills.length > 0 ? (
                                        candidate.skills.map((skill, idx) => (
                                            <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No skills listed yet</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOTES CARD */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                            Recruiter Notes ({notes.length})
                        </h3>

                        <form onSubmit={handleAddNote} className="space-y-2">
                            <textarea
                                rows={2}
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                placeholder="Add screening observation or interview feedback..."
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#087658]"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSavingNote || !newNoteText.trim()}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#087658] hover:bg-[#065e46] rounded-md disabled:opacity-50"
                                >
                                    {isSavingNote ? 'Saving...' : 'Add Note'}
                                </button>
                            </div>
                        </form>

                        <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-gray-100">
                            {notes.length === 0 ? (
                                <p className="text-xs text-gray-400 italic py-2">No notes added for this candidate yet.</p>
                            ) : (
                                notes.map((note, index) => (
                                    <div key={index} className="pt-2 text-xs">
                                        <p className="text-gray-800">{note.text}</p>
                                        <span className="text-[10px] text-gray-400 mt-1 block">
                                            By {note.author || 'Recruiter'} • {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ATS MATCH SCORING MODULE (7 COLS) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                    ATS Match Score Analysis
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Python FastAPI microservice heuristic match evaluation
                                </p>
                            </div>
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                v1.0 Model
                            </span>
                        </div>

                        {/* SELECT TARGET JOB */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                Evaluate against Job Posting:
                            </label>
                            <select
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#087658]"
                            >
                                {jobs.length === 0 ? (
                                    <option value="">No jobs available - please create a job first</option>
                                ) : (
                                    jobs.map((j) => (
                                        <option key={j._id} value={j._id}>
                                            {j.jobTitle} ({j.employmentType} - {j.location})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* RESUME TEXT (EDITABLE FOR MANUAL RESUME SUBMISSIONS) */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold text-gray-700 uppercase">
                                    Candidate Resume / Qualification Text:
                                </label>
                                <span className="text-[11px] text-gray-400">Editable for custom input</span>
                            </div>
                            <textarea
                                rows={4}
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste candidate resume text or skill summary here..."
                                className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#087658]"
                            />
                        </div>

                        {/* RUN SCORING BUTTON */}
                        <div>
                            <button
                                type="button"
                                onClick={handleCalculateScore}
                                disabled={isScoring || !resumeText.trim()}
                                className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isScoring ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Evaluating Resume with Python FastAPI...
                                    </>
                                ) : (
                                    <>
                                        ⚡ Calculate ATS Match Score
                                    </>
                                )}
                            </button>
                        </div>

                        {scoringError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                                <strong>Scoring Notice:</strong> {scoringError}
                            </div>
                        )}

                        {/* STRUCTURED RESULTS DISPLAY */}
                        {scoreData && (
                            <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-5 space-y-5 animate-fade-in">
                                {/* OVERALL SCORE HERO */}
                                <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                            Overall Heuristic Match
                                        </span>
                                        <p className="text-xs text-gray-500 mt-0.5">Transparent weighted formula result</p>
                                    </div>
                                    <div className="flex items-baseline gap-1 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-200">
                                        <span className="text-3xl font-black text-[#087658]">{scoreData.overall_score}</span>
                                        <span className="text-xs font-bold text-gray-400">/ 100</span>
                                    </div>
                                </div>

                                {/* COMPONENT BREAKDOWN */}
                                <div className="space-y-3 text-xs">
                                    <span className="font-bold text-gray-700 block">Score Component Breakdown:</span>
                                    <div>
                                        <div className="flex justify-between font-medium text-gray-600 mb-1">
                                            <span>Required Skills Coverage (50%)</span>
                                            <span className="font-bold text-gray-900">{scoreData.component_scores.required_skills}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-emerald-600 h-2 rounded-full"
                                                style={{ width: `${scoreData.component_scores.required_skills}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between font-medium text-gray-600 mb-1">
                                            <span>Keyword & Tech Overlap (30%)</span>
                                            <span className="font-bold text-gray-900">{scoreData.component_scores.keyword_overlap}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${scoreData.component_scores.keyword_overlap}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between font-medium text-gray-600 mb-1">
                                            <span>Role & Responsibility Relevance (20%)</span>
                                            <span className="font-bold text-gray-900">{scoreData.component_scores.role_relevance}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${scoreData.component_scores.role_relevance}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* MATCHED SKILLS */}
                                <div>
                                    <span className="text-xs font-bold text-emerald-900 block mb-1.5">
                                        Matched Required Skills ({scoreData.matched_skills.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {scoreData.matched_skills.length === 0 ? (
                                            <span className="text-xs text-gray-400 italic">No direct required skill matches found</span>
                                        ) : (
                                            scoreData.matched_skills.map((skill, i) => (
                                                <span key={i} className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                                                    ✓ {skill}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* MISSING SKILLS */}
                                {scoreData.missing_skills.length > 0 && (
                                    <div>
                                        <span className="text-xs font-bold text-amber-900 block mb-1.5">
                                            Missing Required Skills ({scoreData.missing_skills.length}):
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {scoreData.missing_skills.map((skill, i) => (
                                                <span key={i} className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                                                    ✗ {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* EXPLANATION */}
                                <div className="p-3 bg-white rounded-lg border border-emerald-100 text-xs text-gray-700 leading-relaxed">
                                    <strong className="text-gray-900">Analysis Summary: </strong>
                                    {scoreData.explanation}
                                </div>

                                <p className="text-[11px] text-gray-400 italic">
                                    Notice: ATS match scores are heuristic decision-support estimates to aid recruiter screening, not automated hiring decisions.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
