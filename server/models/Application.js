import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
    jobID: {
        type: String,
        required: true,
        ref: 'Job',
    },
    candidateID: {
        type: String,
        required: true,
        ref: 'User',
    },
    applicationStatus: {
        type: String,
        required: true,
        default: 'Applied',
    },
    applicationForm: [{
        question: { type: String },
        answer: { type: String },
    }],
    candidateFeedback: [{
        question: { type: String },
        answer: { type: String },
    }],
    matchScore: {
        type: Number,
    },
    matchBreakdown: {
        component_scores: {
            required_skills: Number,
            keyword_overlap: Number,
            role_relevance: Number,
        },
        matched_skills: [String],
        missing_skills: [String],
        explanation: String,
        version: {
            type: String,
            default: '1.0',
        },
        calculatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;