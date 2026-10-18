import User from '../models/User.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import fs from 'fs';
import path from 'path';

// Get all candidates with search and stage filter
export const getCandidates = async (req, res) => {
    try {
        const { search, stage } = req.query;
        let query = { role: 'candidate' };

        if (stage && stage !== 'all') {
            query.currentStage = stage;
        }

        let candidates = await User.find(query).sort({ createdAt: -1, _id: -1 });

        if (search) {
            const s = search.toLowerCase();
            candidates = candidates.filter(c => {
                const name = c.userName?.toLowerCase() || '';
                const email = c.userEmail?.toLowerCase() || '';
                const skills = Array.isArray(c.skills) ? c.skills.join(' ').toLowerCase() : '';
                return name.includes(s) || email.includes(s) || skills.includes(s);
            });
        }

        // Attach applications count and resume status for each candidate
        const enrichedCandidates = await Promise.all(
            candidates.map(async (c) => {
                const appCount = await Application.countDocuments({ candidateID: c._id.toString() });
                const latestApp = await Application.findOne({ candidateID: c._id.toString() }).sort({ createdAt: -1 });
                
                // Check if resume file exists
                const resumeDir = path.resolve('uploads', 'resume');
                let hasResumeFile = false;
                if (fs.existsSync(resumeDir)) {
                    const files = fs.readdirSync(resumeDir);
                    hasResumeFile = files.some(f => f.startsWith(c._id.toString()));
                }

                return {
                    _id: c._id,
                    userName: c.userName,
                    userEmail: c.userEmail,
                    gender: c.gender,
                    address: c.address,
                    role: c.role,
                    currentStage: c.currentStage || latestApp?.applicationStatus || 'Applied',
                    skills: c.skills || [],
                    notes: c.notes || [],
                    hasResume: hasResumeFile || !!c.resumeUrl || !!c.resumeText,
                    applicationsCount: appCount,
                    latestApplication: latestApp,
                    createdAt: c.createdAt,
                };
            })
        );

        res.status(200).json(enrichedCandidates);
    } catch (error) {
        console.error('Error in getCandidates:', error);
        res.status(500).json({ message: 'Failed to fetch candidates', error: error.message });
    }
};

// Get single candidate by ID with applications and resume info
export const getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await User.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const applications = await Application.find({ candidateID: id }).sort({ createdAt: -1 });
        const enrichedApplications = await Promise.all(
            applications.map(async (app) => {
                let job = null;
                if (app.jobID) {
                    try {
                        job = await Job.findById(app.jobID);
                    } catch (e) {}
                }
                return {
                    ...app.toObject(),
                    job,
                };
            })
        );

        // Resume file check
        const resumeDir = path.resolve('uploads', 'resume');
        let resumeFilename = null;
        if (fs.existsSync(resumeDir)) {
            const files = fs.readdirSync(resumeDir);
            const found = files.find(f => f.startsWith(id));
            if (found) resumeFilename = found;
        }

        res.status(200).json({
            candidate,
            applications: enrichedApplications,
            resumeFilename,
        });
    } catch (error) {
        console.error('Error in getCandidateById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add new candidate
export const addCandidate = async (req, res) => {
    try {
        const { userName, userEmail, userPassword, gender, address, skills, currentStage } = req.body;
        
        const existing = await User.findOne({ userEmail });
        if (existing) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const candidate = new User({
            userName,
            userEmail,
            userPassword: userPassword || 'talenttrack123',
            gender: gender || 'Other',
            address: address || 'Not specified',
            role: 'candidate',
            skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
            currentStage: currentStage || 'Applied',
        });

        await candidate.save();
        res.status(201).json(candidate);
    } catch (error) {
        console.error('Error in addCandidate:', error);
        res.status(500).json({ message: 'Failed to create candidate', error: error.message });
    }
};

// Update candidate
export const updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, userEmail, gender, address, skills, currentStage, notes, resumeText } = req.body;

        const candidate = await User.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        if (userName) candidate.userName = userName;
        if (userEmail) candidate.userEmail = userEmail;
        if (gender) candidate.gender = gender;
        if (address) candidate.address = address;
        if (skills) candidate.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
        if (currentStage) candidate.currentStage = currentStage;
        if (resumeText !== undefined) candidate.resumeText = resumeText;
        if (notes) candidate.notes = notes;

        await candidate.save();
        res.status(200).json(candidate);
    } catch (error) {
        console.error('Error in updateCandidate:', error);
        res.status(500).json({ message: 'Failed to update candidate', error: error.message });
    }
};

// Add note to candidate
export const addCandidateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, author } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Note text is required' });
        }

        const candidate = await User.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        candidate.notes.push({
            text: text.trim(),
            author: author || 'Recruiter',
            createdAt: new Date(),
        });

        await candidate.save();
        res.status(200).json({ success: true, notes: candidate.notes });
    } catch (error) {
        console.error('Error in addCandidateNote:', error);
        res.status(500).json({ message: 'Failed to add note', error: error.message });
    }
};

// Update candidate stage
export const updateCandidateStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage, applicationId } = req.body;

        const validStages = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired', 'Rejected'];
        if (!validStages.includes(stage)) {
            return res.status(400).json({ message: `Invalid stage. Must be one of: ${validStages.join(', ')}` });
        }

        const candidate = await User.findByIdAndUpdate(id, { currentStage: stage }, { new: true });
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        if (applicationId) {
            await Application.findByIdAndUpdate(applicationId, { applicationStatus: stage });
        } else {
            // Update latest application for this candidate
            await Application.findOneAndUpdate(
                { candidateID: id },
                { applicationStatus: stage },
                { sort: { createdAt: -1 } }
            );
        }

        res.status(200).json({
            success: true,
            message: `Stage updated to ${stage}`,
            candidate,
        });
    } catch (error) {
        console.error('Error in updateCandidateStage:', error);
        res.status(500).json({ message: 'Failed to update stage', error: error.message });
    }
};

// Delete candidate
export const deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        await Application.deleteMany({ candidateID: id });
        res.status(200).json({ success: true, message: 'Candidate and associated applications deleted' });
    } catch (error) {
        console.error('Error in deleteCandidate:', error);
        res.status(500).json({ message: 'Failed to delete candidate', error: error.message });
    }
};
