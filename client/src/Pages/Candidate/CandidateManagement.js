import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const STAGES = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired', 'Rejected'];

const STAGE_BADGES = {
    Applied: 'bg-blue-50 text-blue-700 border-blue-200',
    Screening: 'bg-purple-50 text-purple-700 border-purple-200',
    Interview: 'bg-amber-50 text-amber-700 border-amber-200',
    Assessment: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Hired: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const CandidateManagement = () => {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStage, setSelectedStage] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state for new candidate
    const [newCandidate, setNewCandidate] = useState({
        userName: '',
        userEmail: '',
        gender: 'Male',
        address: '',
        skills: '',
        currentStage: 'Applied',
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchCandidates = async () => {
        try {
            setIsLoading(true);
            const query = [];
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);
            if (selectedStage !== 'all') query.push(`stage=${encodeURIComponent(selectedStage)}`);
            const endpoint = `/api/candidates${query.length ? '?' + query.join('&') : ''}`;
            const data = await api.get(endpoint);
            setCandidates(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast.error('Failed to load candidate roster');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchCandidates();
        }, 200);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedStage]);

    const handleStageChange = async (candidateId, newStage) => {
        try {
            await api.put(`/api/candidates/${candidateId}/stage`, { stage: newStage });
            setCandidates((prev) =>
                prev.map((c) => (c._id === candidateId ? { ...c, currentStage: newStage } : c))
            );
            toast.success(`Hiring stage updated to ${newStage}`);
        } catch (error) {
            console.error('Error updating stage:', error);
            toast.error(error.message || 'Failed to update stage');
        }
    };

    const handleDeleteCandidate = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete candidate ${name}? This will remove all their applications.`)) {
            return;
        }
        try {
            await api.delete(`/api/candidates/${id}`);
            setCandidates((prev) => prev.filter((c) => c._id !== id));
            toast.success(`Candidate ${name} removed`);
        } catch (error) {
            console.error('Error deleting candidate:', error);
            toast.error('Failed to delete candidate');
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await api.post('/api/candidates', newCandidate);
            toast.success('Candidate added successfully');
            setShowAddModal(false);
            setNewCandidate({
                userName: '',
                userEmail: '',
                gender: 'Male',
                address: '',
                skills: '',
                currentStage: 'Applied',
            });
            fetchCandidates();
        } catch (error) {
            console.error('Error adding candidate:', error);
            toast.error(error.message || 'Failed to add candidate');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Candidate Roster & Pipeline
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Screen, evaluate, and transition candidates across your hiring workflow
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Candidate
                </button>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-full sm:w-96">
                    <input
                        type="text"
                        placeholder="Search candidate by name, email, or skill..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Stage Filter:
                    </span>
                    <select
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                    >
                        <option value="all">All Stages ({candidates.length})</option>
                        {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* CANDIDATES TABLE */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-sm text-gray-500">Loading candidate roster...</div>
                ) : candidates.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-medium">No candidates found matching your filter criteria.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedStage('all'); }}
                            className="mt-2 text-sm text-[#087658] font-semibold hover:underline"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hiring Stage</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resume</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {candidates.map((candidate) => (
                                    <tr key={candidate._id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-sm text-gray-900">{candidate.userName}</div>
                                            <div className="text-xs text-gray-500">{candidate.userEmail}</div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">{candidate.address || 'Remote'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {candidate.skills && candidate.skills.length > 0 ? (
                                                    candidate.skills.slice(0, 4).map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-700 rounded">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No skills listed</span>
                                                )}
                                                {candidate.skills?.length > 4 && (
                                                    <span className="text-[10px] text-gray-400 self-center">+{candidate.skills.length - 4} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={candidate.currentStage || 'Applied'}
                                                onChange={(e) => handleStageChange(candidate._id, e.target.value)}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${
                                                    STAGE_BADGES[candidate.currentStage] || 'bg-gray-50 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                {STAGES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                                            {candidate.hasResume ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                    ✓ Available
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">Not uploaded</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                                            <Link
                                                to={`/candidate/${candidate._id}`}
                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#087658] font-bold transition-colors inline-block"
                                            >
                                                Profile & ATS Score →
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteCandidate(candidate._id, candidate.userName)}
                                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors inline-block"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADD CANDIDATE MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Add New Candidate</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCandidate.userName}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, userName: e.target.value })}
                                    placeholder="Jordan Smith"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#087658]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={newCandidate.userEmail}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, userEmail: e.target.value })}
                                    placeholder="jordan@example.com"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#087658]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Gender</label>
                                    <select
                                        value={newCandidate.gender}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, gender: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Non-binary">Non-binary</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Initial Stage</label>
                                    <select
                                        value={newCandidate.currentStage}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, currentStage: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                                    >
                                        {STAGES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Location</label>
                                <input
                                    type="text"
                                    value={newCandidate.address}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, address: e.target.value })}
                                    placeholder="Bengaluru, India"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Skills (comma-separated)</label>
                                <input
                                    type="text"
                                    value={newCandidate.skills}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })}
                                    placeholder="React, Node.js, TypeScript, PostgreSQL"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-[#087658] hover:bg-[#065e46] rounded-lg disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Add Candidate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
