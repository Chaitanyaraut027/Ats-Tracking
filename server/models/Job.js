import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    jobID: {
        type: String,
        required: true,
    },
    jobTitle: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        default: 'Engineering',
    },
    employmentType: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    salary: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requiredSkills: [{
        type: String,
    }],
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
    },
    applicationForm: {
        question: [{ type: String }],
        answer: [{ type: String }],
    },
    applicants: [{
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            default: 'Applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Job = mongoose.model('Job', JobSchema);

export default Job;