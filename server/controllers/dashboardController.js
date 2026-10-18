import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const getDashboardMetrics = async (req, res) => {
    try {
        const [
            totalCandidates,
            totalJobs,
            totalApplications,
            applications,
            recentCandidatesRaw,
            recentApplicationsRaw
        ] = await Promise.all([
            User.countDocuments({ role: 'candidate' }),
            Job.countDocuments(),
            Application.countDocuments(),
            Application.find({}, 'applicationStatus'),
            User.find({ role: 'candidate' }).sort({ createdAt: -1, _id: -1 }).limit(6),
            Application.find().sort({ createdAt: -1, _id: -1 }).limit(6)
        ]);

        // Stage breakdown
        const stages = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired', 'Rejected'];
        const stageCounts = {
            Applied: 0,
            Screening: 0,
            Interview: 0,
            Assessment: 0,
            Offer: 0,
            Hired: 0,
            Rejected: 0,
        };

        applications.forEach((app) => {
            const rawStatus = app.applicationStatus || 'Applied';
            const matchedStage = stages.find(s => s.toLowerCase() === rawStatus.toLowerCase());
            if (matchedStage) {
                stageCounts[matchedStage] = (stageCounts[matchedStage] || 0) + 1;
            } else if (rawStatus.toLowerCase() === 'shortlist' || rawStatus.toLowerCase() === 'shortlisted') {
                stageCounts['Screening'] = (stageCounts['Screening'] || 0) + 1;
            } else if (rawStatus.toLowerCase() === 'reject' || rawStatus.toLowerCase() === 'rejected') {
                stageCounts['Rejected'] = (stageCounts['Rejected'] || 0) + 1;
            } else if (rawStatus.toLowerCase() === 'active') {
                stageCounts['Applied'] = (stageCounts['Applied'] || 0) + 1;
            } else {
                stageCounts['Applied'] = (stageCounts['Applied'] || 0) + 1;
            }
        });

        // Enrich recent applications with candidate name and job title
        const recentApplications = await Promise.all(
            recentApplicationsRaw.map(async (app) => {
                let candidateName = 'Unknown Candidate';
                let jobTitle = 'Unknown Job';

                if (app.candidateID) {
                    try {
                        const u = await User.findById(app.candidateID, 'userName userEmail');
                        if (u) candidateName = u.userName;
                    } catch (e) {}
                }

                if (app.jobID) {
                    try {
                        const j = await Job.findById(app.jobID, 'jobTitle');
                        if (j) jobTitle = j.jobTitle;
                    } catch (e) {}
                }

                return {
                    _id: app._id,
                    jobID: app.jobID,
                    candidateID: app.candidateID,
                    candidateName,
                    jobTitle,
                    status: app.applicationStatus || 'Applied',
                    matchScore: app.matchScore,
                    createdAt: app.createdAt || new Date(),
                };
            })
        );

        res.status(200).json({
            success: true,
            totalCandidates,
            totalJobs,
            totalApplications,
            stageCounts,
            recentCandidates: recentCandidatesRaw,
            recentApplications,
        });
    } catch (error) {
        console.error('Error in getDashboardMetrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to compute dashboard metrics',
            error: error.message
        });
    }
};
