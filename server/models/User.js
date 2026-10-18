import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    userPassword: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["employer", "coordinator", "recruiter", "candidate"],
        default: "candidate",
    },
    isAssigned: {
        type: Boolean,
        default: false,
    },
    skills: [{
        type: String,
    }],
    resumeUrl: {
        type: String,
    },
    resumeText: {
        type: String,
    },
    notes: [{
        text: String,
        author: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    currentStage: {
        type: String,
        enum: ["Applied", "Screening", "Interview", "Assessment", "Offer", "Hired", "Rejected"],
        default: "Applied",
    },
    applications: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
        },
        status: {
            type: String,
            default: 'Applied',
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', UserSchema);

export default User;