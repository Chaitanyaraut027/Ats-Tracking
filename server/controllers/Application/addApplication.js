import Application from '../../models/Application.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';

const addApplication = async (req, res) => {
    const { _id, jobID, candidateID, applicationStatus, applicationForm, candidateFeedback } = req.body;

    try {
        let application = null;
        if (_id) {
            try {
                application = await Application.findById(_id);
            } catch (err) {
                application = null;
            }
        }

        if (application) {
            // Update existing application
            if (jobID) application.jobID = jobID;
            if (candidateID) application.candidateID = candidateID;
            if (applicationStatus) application.applicationStatus = applicationStatus;
            if (applicationForm) application.applicationForm = applicationForm;
            if (candidateFeedback) application.candidateFeedback = candidateFeedback;
            await application.save();
        } else {
            // Create new application
            application = new Application({
                jobID: jobID || '',
                candidateID: candidateID || '',
                applicationStatus: applicationStatus || 'Applied',
                applicationForm: applicationForm || [],
                candidateFeedback: candidateFeedback || []
            });
            await application.save();

            // Link to Job if valid ID
            if (jobID) {
                try {
                    await Job.findByIdAndUpdate(jobID, {
                        $addToSet: {
                            applicants: {
                                applicant: candidateID,
                                status: applicationStatus || 'active'
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error linking applicant to Job:', e.message);
                }
            }

            // Link to User if valid ID
            if (candidateID) {
                try {
                    await User.findByIdAndUpdate(candidateID, {
                        $addToSet: {
                            applications: {
                                jobId: jobID,
                                status: applicationStatus || 'active'
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error linking application to User:', e.message);
                }
            }
        }

        res.status(200).json(application);
    } catch (error) {
        console.error('Error in addApplication:', error);
        res.status(500).json({ message: error.message });
    }
};

export { addApplication };